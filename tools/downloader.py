"""Downloader for the Offline Study Library project."""

from __future__ import annotations

import logging
import platform
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from functools import lru_cache
from typing import Any, Callable
import unicodedata

from colorama import Fore, Style, init as colorama_init
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from rich.table import Table
from tqdm import tqdm
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError, ExtractorError

try:
    from utils import (
        DownloaderConfig,
        Subject,
        format_bytes,
        format_eta,
        friendly_error,
        has_internet_connection,
        load_config,
        safe_folder_name,
        setup_logging,
        verify_ffmpeg,
    )
except ModuleNotFoundError:
    from tools.utils import (
        DownloaderConfig,
        Subject,
        format_bytes,
        format_eta,
        friendly_error,
        has_internet_connection,
        load_config,
        safe_folder_name,
        setup_logging,
        verify_ffmpeg,
    )


console = Console()


@dataclass
class DownloadSummary:
    """Download result counters for one subject."""

    subject: str
    downloaded: int = 0
    skipped: int = 0
    failed: int = 0
    duration_seconds: float = 0.0
    downloaded_ids: set[str] = field(default_factory=set, repr=False)


@dataclass(frozen=True)
class PlaylistStats:
    """Metadata-only playlist statistics displayed before downloading."""

    total: int
    already_downloaded: int
    skipped_titles: tuple[str, ...] = ()

    @property
    def remaining(self) -> int:
        """Number of videos not present in the download archive."""

        return max(0, self.total - self.already_downloaded)


class UserInterruptedDownload(Exception):
    """Raised when the user confirms a Ctrl+C download interruption."""


def build_format_selector(quality: int) -> str:
    """Prefer the best native MP4 at or below configured quality."""

    return (
        f"bestvideo[ext=mp4][height<={quality}]+bestaudio[ext=m4a]/"
        f"best[ext=mp4][height<={quality}]/"
        "best[ext=mp4]"
    )


@lru_cache(maxsize=1)
def get_cookie_file() -> Path | None:
    """Return the project-root cookies.txt file when it exists."""

    cookie_file = Path(__file__).resolve().parents[1] / "cookies.txt"
    if cookie_file.is_file():
        logging.info("Using cookies.txt authentication.")
        return cookie_file

    logging.info("No cookies.txt found. Downloading without authentication.")
    return None


def print_authentication_message() -> None:
    """Show guidance when YouTube authentication is required."""

    if getattr(print_authentication_message, "_emitted", False):
        return
    setattr(print_authentication_message, "_emitted", True)

    message = (
        "----------------------------------------------------\n"
        "Some videos require YouTube authentication.\n\n"
        "To download these videos:\n\n"
        "1. Export YouTube cookies as cookies.txt\n"
        "2. Place cookies.txt in the project root\n"
        "3. Run the downloader again\n\n"
        "Already downloaded videos will be skipped automatically.\n"
        "----------------------------------------------------"
    )
    console.print(f"{Fore.YELLOW}{message}{Style.RESET_ALL}")
    logging.warning("YouTube authentication required for one or more videos.")


def normalize_authentication_text(text: str) -> str:
    """Normalize yt-dlp auth text for resilient keyword matching."""

    normalized = unicodedata.normalize("NFKC", text)
    translation_table = str.maketrans(
        {
            "’": "'",
            "‘": "'",
            "ʼ": "'",
            "′": "'",
            "`": "'",
            "´": "'",
            "“": '"',
            "”": '"',
            "„": '"',
            "‟": '"',
            "–": "-",
            "—": "-",
            "−": "-",
            "‐": "-",
            "‑": "-",
        }
    )
    return normalized.translate(translation_table).lower()


def remote_components_error(exc: BaseException) -> bool:
    """Return True when yt-dlp cannot fetch or use remote challenge components."""

    normalized = normalize_authentication_text(str(exc))
    return any(
        keyword in normalized
        for keyword in (
            "remote component",
            "remote components",
            "challenge solver",
            "ejs:github",
            "failed to download",
            "unable to download",
            "could not download",
        )
    )


def authentication_error(exc: BaseException) -> bool:
    """Return True when yt-dlp reports an authentication-related failure."""

    normalized = normalize_authentication_text(str(exc))
    return any(
        keyword in normalized
        for keyword in (
            "sign in to confirm",
            "requires authentication",
            "authentication required",
            "login required",
            "--cookies",
            "cookies-from-browser",
            "youtube cookies",
        )
    )


def authentication_message(message: str) -> bool:
    """Return True when a yt-dlp log message indicates authentication is required."""

    normalized = normalize_authentication_text(message)
    return any(
        keyword in normalized
        for keyword in (
            "sign in to confirm",
            "requires authentication",
            "authentication required",
            "login required",
            "--cookies",
            "cookies-from-browser",
            "youtube cookies",
        )
    )


def read_archive_ids(archive_file: Path) -> set[str]:
    """Read yt-dlp archive IDs from a subject archive file."""

    if not archive_file.exists():
        return set()

    archive_ids: set[str] = set()
    try:
        for line in archive_file.read_text(encoding="utf-8").splitlines():
            parts = line.split()
            if parts:
                archive_ids.add(parts[-1])
    except OSError as exc:
        logging.warning("Unable to read archive file %s: %s", archive_file, exc)
    return archive_ids


def extract_playlist_entries(
    subject: Subject,
    cookie_file: Path | None = None,
) -> list[dict[str, Any]]:
    """Fetch playlist metadata without downloading videos."""

    try:
        return _extract_playlist_entries(subject, cookie_file, use_remote_components=True)
    except Exception as exc:
        if remote_components_error(exc):
            logging.warning("Remote challenge solver unavailable during metadata extraction: %s", exc)
            try:
                return _extract_playlist_entries(subject, cookie_file, use_remote_components=False)
            except Exception as retry_exc:
                if authentication_error(retry_exc):
                    print_authentication_message()
                    return []
                raise
        if authentication_error(exc):
            print_authentication_message()
            return []
        raise


def _extract_playlist_entries(
    subject: Subject,
    cookie_file: Path | None = None,
    use_remote_components: bool = True,
) -> list[dict[str, Any]]:
    """Fetch playlist metadata without downloading videos."""

    options = {
        "extract_flat": "in_playlist",
        "ignoreerrors": True,
        "quiet": True,
        "no_warnings": True,
    }
    if cookie_file is not None:
        options["cookiefile"] = str(cookie_file)
    if use_remote_components:
        options["remote_components"] = ["ejs:github"]

    with YoutubeDL(options) as ydl:
        info = ydl.extract_info(subject.playlist, download=False)

    entries = (info or {}).get("entries") or []
    return [entry for entry in entries if entry]


def get_playlist_stats(
    subject: Subject,
    subject_dir: Path,
    cookie_file: Path | None = None,
) -> PlaylistStats | None:
    """Display metadata-only playlist statistics before a download starts."""

    try:
        entries = extract_playlist_entries(subject, cookie_file)
    except (DownloadError, ExtractorError, OSError) as exc:
        console.print(f"{Fore.RED}Could not read playlist metadata: {friendly_error(exc)}{Style.RESET_ALL}")
        logging.error("Metadata fetch failed for %s: %s", subject.name, exc)
        return None

    archive_ids = read_archive_ids(subject_dir / ".downloaded.txt")
    skipped_titles = tuple(
        str(entry.get("title") or entry.get("id") or "Video")
        for entry in entries
        if entry.get("id") and str(entry.get("id")) in archive_ids
    )
    entry_ids = {str(entry.get("id")) for entry in entries if entry.get("id")}
    already_downloaded = len(entry_ids & archive_ids)
    stats = PlaylistStats(
        total=len(entries),
        already_downloaded=already_downloaded,
        skipped_titles=skipped_titles,
    )
    print_playlist_stats(subject, stats)
    print_skipped_videos(stats.skipped_titles)
    return stats


def print_playlist_stats(subject: Subject, stats: PlaylistStats) -> None:
    """Render pre-download subject statistics."""

    table = Table(title=f"{subject.name} Playlist", show_header=False)
    table.add_column("Label", style="cyan")
    table.add_column("Value", style="white")
    table.add_row("Subject", subject.name)
    table.add_row("Playlist URL", subject.playlist)
    table.add_row("Already Downloaded", str(stats.already_downloaded))
    table.add_row("Remaining", str(stats.remaining))
    table.add_row("Total Videos", str(stats.total))
    console.print(table)


def print_skipped_videos(titles: tuple[str, ...]) -> None:
    """Display concise skip messages for videos already in the archive."""

    for title in titles:
        console.print(f"{Fore.YELLOW}Skipping{Style.RESET_ALL}\n{title}\nAlready Downloaded\n")


def make_progress_hook(subject: str, summary: DownloadSummary) -> Callable[[dict[str, Any]], None]:
    """Create a tqdm progress hook for yt-dlp."""

    progress_bar: tqdm[Any] | None = None
    current_video = ""

    def hook(status: dict[str, Any]) -> None:
        nonlocal progress_bar, current_video

        filename = Path(status.get("filename") or "").name
        info = status.get("info_dict") or {}
        playlist_index = info.get("playlist_index")
        playlist_total = info.get("n_entries") or info.get("playlist_count")
        video_counter = ""
        if playlist_index and playlist_total:
            video_counter = f" [{playlist_index}/{playlist_total}]"
        elif playlist_index:
            video_counter = f" [{playlist_index}]"

        if filename and filename != current_video:
            if progress_bar is not None:
                progress_bar.close()
            current_video = filename
            progress_bar = tqdm(
                total=status.get("total_bytes") or status.get("total_bytes_estimate"),
                unit="B",
                unit_scale=True,
                unit_divisor=1024,
                desc=f"{subject}{video_counter}: {filename[:45]}",
                leave=False,
                dynamic_ncols=True,
            )

        if status.get("status") == "downloading" and progress_bar is not None:
            downloaded = int(status.get("downloaded_bytes") or 0)
            total = status.get("total_bytes") or status.get("total_bytes_estimate")
            if total and progress_bar.total != total:
                progress_bar.total = total
            progress_bar.n = downloaded
            speed = status.get("speed")
            eta = status.get("eta")
            progress_bar.set_postfix(
                speed=format_bytes(speed) + "/s" if speed else "?/s",
                eta=format_eta(eta),
            )
            progress_bar.refresh()

        if status.get("status") == "finished":
            if progress_bar is not None:
                progress_bar.n = progress_bar.total or progress_bar.n
                progress_bar.refresh()
                progress_bar.close()
                progress_bar = None
            video_id = str(info.get("id") or filename)
            if video_id not in summary.downloaded_ids:
                summary.downloaded_ids.add(video_id)
                summary.downloaded += 1
            logging.info("Downloaded video for %s: %s", subject, filename)

    return hook


class YtdlpLogger:
    """Route yt-dlp messages into logs and concise terminal output."""

    def __init__(self, subject: str, summary: DownloadSummary) -> None:
        self.subject = subject
        self.summary = summary

    def debug(self, message: str) -> None:
        logging.debug("%s | %s", self.subject, message)
        self._handle_skip_message(message)

    def warning(self, message: str) -> None:
        if authentication_message(message):
            print_authentication_message()
            return
        logging.warning("%s | %s", self.subject, message)
        if self._handle_skip_message(message):
            return
        console.print(f"{Fore.YELLOW}Warning [{self.subject}]: {message}{Style.RESET_ALL}")

    def error(self, message: str) -> None:
        if authentication_message(message):
            print_authentication_message()
            logging.info("%s | Authentication required: %s", self.subject, normalize_authentication_text(message))
            return
        logging.error("%s | %s", self.subject, message)
        self.summary.failed += 1
        console.print(f"{Fore.RED}Error [{self.subject}]: {message}{Style.RESET_ALL}")

    def _handle_skip_message(self, message: str) -> bool:
        lowered = message.lower()
        if "has already been recorded in the archive" not in lowered:
            return False

        title = message.split(":", 1)[-1].strip() if ":" in message else "Video"
        logging.info("Skipped already downloaded video for %s: %s", self.subject, title)
        return True


def ytdlp_options(
    config: DownloaderConfig,
    subject: Subject,
    subject_dir: Path,
    summary: DownloadSummary,
    cookie_file: Path | None = None,
    use_remote_components: bool = True,
) -> dict[str, Any]:
    """Build yt-dlp options for one subject playlist."""

    archive_file = subject_dir / ".downloaded.txt"
    options = {
        "format": build_format_selector(config.video_quality),
        "merge_output_format": config.video_format,
        "outtmpl": str(subject_dir / "%(title)s.%(ext)s"),
        "download_archive": str(archive_file),
        "continuedl": True,
        "ignoreerrors": True,
        "overwrites": False,
        "noplaylist": False,
        "retries": config.retry_count,
        "fragment_retries": config.retry_count,
        "file_access_retries": config.retry_count,
        "extractor_retries": config.retry_count,
        "concurrent_fragment_downloads": config.concurrent_downloads,
        "windowsfilenames": True,
        "restrictfilenames": False,
        "progress_hooks": [make_progress_hook(subject.name, summary)],
        "quiet": True,
        "no_warnings": False,
        "logger": YtdlpLogger(subject.name, summary),
    }

    if cookie_file is not None:
        options["cookiefile"] = str(cookie_file)
    if use_remote_components:
        options["remote_components"] = ["ejs:github"]

    return options


def ensure_internet_or_return() -> bool:
    """Check internet availability and keep the menu alive when offline."""

    if has_internet_connection():
        return True

    console.print(
        f"{Fore.YELLOW}No internet connection detected. "
        f"Please reconnect and try again from the menu.{Style.RESET_ALL}"
    )
    return False


def download_subject(config: DownloaderConfig, subject: Subject) -> DownloadSummary:
    """Download one configured subject playlist and return its summary."""

    summary = DownloadSummary(subject=subject.name)
    start_time = time.monotonic()
    cookie_file = get_cookie_file()
    use_remote_components = True

    if not subject.playlist:
        console.print(f"{Fore.YELLOW}Skipping {subject.name}: playlist is empty.{Style.RESET_ALL}")
        logging.info("Skipped empty playlist: %s", subject.name)
        return summary

    if not ensure_internet_or_return():
        return summary

    subject_dir = config.download_location / safe_folder_name(subject.name)
    try:
        subject_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError as exc:
        console.print(f"{Fore.RED}Permission denied creating {subject_dir}: {exc}{Style.RESET_ALL}")
        logging.error("Permission denied creating %s: %s", subject_dir, exc)
        summary.failed += 1
        return summary
    except OSError as exc:
        console.print(f"{Fore.RED}Unable to create {subject_dir}: {exc}{Style.RESET_ALL}")
        logging.error("Unable to create %s: %s", subject_dir, exc)
        summary.failed += 1
        return summary

    stats = get_playlist_stats(subject, subject_dir, cookie_file)
    if stats is None:
        summary.failed += 1
        return summary
    summary.skipped = stats.already_downloaded

    logging.info("Starting playlist: %s | %s", subject.name, subject.playlist)
    console.print(f"\n{Fore.CYAN}Downloading {subject.name}{Style.RESET_ALL}")

    while True:
        try:
            with YoutubeDL(
                ytdlp_options(
                    config,
                    subject,
                    subject_dir,
                    summary,
                    cookie_file,
                    use_remote_components=use_remote_components,
                )
            ) as ydl:
                ydl.download([subject.playlist])
            break
        except KeyboardInterrupt as exc:
            if Confirm.ask("\nInterrupt download?", default=True):
                raise UserInterruptedDownload from exc
            console.print(f"{Fore.CYAN}Continuing download...{Style.RESET_ALL}")
            logging.info("User chose to continue after Ctrl+C for %s", subject.name)
        except Exception as exc:
            if use_remote_components and remote_components_error(exc):
                logging.warning("Remote challenge solver unavailable during download: %s", exc)
                use_remote_components = False
                continue
            if authentication_error(exc):
                print_authentication_message()
                break
            if isinstance(exc, PermissionError):
                console.print(f"{Fore.RED}Permission error while downloading {subject.name}: {exc}{Style.RESET_ALL}")
                logging.error("Permission error for %s: %s", subject.name, exc)
                summary.failed += 1
                break
            if isinstance(exc, OSError):
                console.print(
                    f"{Fore.RED}System error while downloading {subject.name}: {friendly_error(exc)}{Style.RESET_ALL}"
                )
                logging.error("System error for %s: %s", subject.name, exc)
                summary.failed += 1
                break
            if isinstance(exc, (DownloadError, ExtractorError)):
                if authentication_message(str(exc)):
                    print_authentication_message()
                    break
                console.print(f"{Fore.RED}Could not download {subject.name}: {friendly_error(exc)}{Style.RESET_ALL}")
                logging.error("Download failed for %s: %s", subject.name, exc)
                summary.failed += 1
                break
            raise

    summary.duration_seconds = time.monotonic() - start_time
    logging.info("Finished playlist: %s", subject.name)
    print_download_summary(summary)
    return summary


def print_download_summary(summary: DownloadSummary) -> None:
    """Display a subject download summary."""

    console.print("-" * 32)
    console.print(summary.subject)
    console.print(f"Downloaded : {summary.downloaded}")
    console.print(f"Skipped    : {summary.skipped}")
    console.print(f"Failed     : {summary.failed}")
    console.print(f"Duration   : {format_eta(summary.duration_seconds)}")
    console.print("-" * 32)


def print_final_summary(summaries: list[DownloadSummary]) -> None:
    """Display final summary after Download Everything."""

    total = DownloadSummary(
        subject="Download Everything",
        downloaded=sum(summary.downloaded for summary in summaries),
        skipped=sum(summary.skipped for summary in summaries),
        failed=sum(summary.failed for summary in summaries),
        duration_seconds=sum(summary.duration_seconds for summary in summaries),
    )
    console.print(Panel.fit("Final Summary", border_style="green"))
    print_download_summary(total)


def play_completion_sound() -> None:
    """Play a short Windows beep after successful full downloads."""

    if platform.system() != "Windows":
        return
    try:
        import winsound

        winsound.MessageBeep(winsound.MB_OK)
    except Exception:
        pass


def valid_subjects(config: DownloaderConfig) -> list[Subject]:
    """Return subjects with non-empty playlists."""

    return [subject for subject in config.subjects if subject.playlist]


def download_all(config: DownloaderConfig) -> list[DownloadSummary]:
    """Download every subject that has a configured playlist."""

    subjects = valid_subjects(config)
    if not subjects:
        console.print(f"{Fore.YELLOW}No playlists are configured.{Style.RESET_ALL}")
        logging.warning("Download all requested but no playlists are configured")
        return []

    summaries: list[DownloadSummary] = []
    for subject in subjects:
        summaries.append(download_subject(config, subject))

    print_final_summary(summaries)
    if summaries and all(summary.failed == 0 for summary in summaries):
        play_completion_sound()
    return summaries


def check_for_new_videos(config: DownloaderConfig) -> None:
    """Check configured playlists for new videos and download them."""

    logging.info("Checking for new videos")
    console.print(f"{Fore.CYAN}Checking for new videos...{Style.RESET_ALL}")
    download_all(config)


def print_menu(config: DownloaderConfig) -> None:
    """Render the interactive downloader menu."""

    table = Table(title="Offline Study Library Downloader", show_header=False)
    table.add_column("Option", justify="right", style="cyan", width=4)
    table.add_column("Action", style="white")

    for index, subject in enumerate(config.subjects, start=1):
        suffix = "" if subject.playlist else " [dim](not configured)[/dim]"
        table.add_row(str(index), f"{subject.name}{suffix}")

    download_all_option = len(config.subjects) + 1
    update_option = len(config.subjects) + 2
    exit_option = len(config.subjects) + 3
    table.add_row(str(download_all_option), "Download Everything")
    table.add_row(str(update_option), "Check for New Videos")
    table.add_row(str(exit_option), "Exit")

    console.print(Panel(table, border_style="cyan"))


def menu_loop() -> None:
    """Run the interactive terminal menu until the user exits."""

    while True:
        config = load_config()
        if config is None:
            return

        print_menu(config)
        exit_option = len(config.subjects) + 3
        choice = Prompt.ask("Choose an option", default=str(exit_option)).strip()

        try:
            option = int(choice)
        except ValueError:
            console.print(f"{Fore.YELLOW}Please enter a number from the menu.{Style.RESET_ALL}")
            continue

        try:
            if 1 <= option <= len(config.subjects):
                download_subject(config, config.subjects[option - 1])
            elif option == len(config.subjects) + 1:
                download_all(config)
            elif option == len(config.subjects) + 2:
                check_for_new_videos(config)
            elif option == exit_option:
                console.print(f"{Fore.GREEN}Goodbye.{Style.RESET_ALL}")
                logging.info("Downloader exited by user")
                return
            else:
                console.print(f"{Fore.YELLOW}Please enter a valid menu option.{Style.RESET_ALL}")
        except UserInterruptedDownload:
            console.print(f"{Fore.YELLOW}Download interrupted. Run again to resume.{Style.RESET_ALL}")
            logging.warning("Download interrupted by user")


def main() -> int:
    """Program entry point."""

    colorama_init(autoreset=True)
    setup_logging()
    logging.info("Downloader started at %s", datetime.now().isoformat(timespec="seconds"))

    try:
        if not verify_ffmpeg():
            return 1
        menu_loop()
    except KeyboardInterrupt:
        console.print(f"\n{Fore.YELLOW}Exiting downloader.{Style.RESET_ALL}")
        logging.warning("Downloader interrupted at menu level")
        return 130
    except Exception as exc:  # Defensive final guard to keep CLI failures friendly.
        console.print(f"{Fore.RED}Unexpected error: {friendly_error(exc)}{Style.RESET_ALL}")
        logging.exception("Unexpected error")
        return 1
    finally:
        logging.info("Downloader ended at %s", datetime.now().isoformat(timespec="seconds"))

    return 0


if __name__ == "__main__":
    sys.exit(main())
