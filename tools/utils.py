"""Shared utilities for the Offline Study Library tools."""

from __future__ import annotations

import json
import logging
import shutil
import socket
from dataclasses import dataclass
from pathlib import Path

from colorama import Fore, Style
from rich.console import Console


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = PROJECT_ROOT / "config.json"
LOG_DIR = PROJECT_ROOT / "logs"
LOG_PATH = LOG_DIR / "downloader.log"
DEFAULT_RETRY_COUNT = 5
MAX_VIDEO_QUALITY = 1080
SUPPORTED_VIDEO_FORMAT = "mp4"

console = Console()


@dataclass(frozen=True)
class Subject:
    """A configured school subject and its playlist URL."""

    name: str
    playlist: str


@dataclass(frozen=True)
class DownloaderConfig:
    """Validated downloader settings loaded from config.json."""

    download_location: Path
    video_quality: int
    video_format: str
    concurrent_downloads: int
    retry_count: int
    subjects: tuple[Subject, ...]


def setup_file_logging(log_path: Path) -> None:
    """Configure file logging for a project tool."""

    log_path.parent.mkdir(parents=True, exist_ok=True)
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    logging.basicConfig(
        filename=log_path,
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        encoding="utf-8",
    )


def setup_logging() -> None:
    """Configure file logging for downloader runs."""

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    setup_file_logging(LOG_PATH)


def load_config() -> DownloaderConfig | None:
    """Load and validate config.json, returning None for friendly errors."""

    if not CONFIG_PATH.exists():
        console.print(f"{Fore.RED}Missing config.json at project root.{Style.RESET_ALL}")
        logging.error("Missing config.json: %s", CONFIG_PATH)
        return None

    try:
        raw_config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        console.print(f"{Fore.RED}config.json is corrupted: {exc}{Style.RESET_ALL}")
        logging.error("Corrupted config.json: %s", exc)
        return None
    except OSError as exc:
        console.print(f"{Fore.RED}Unable to read config.json: {exc}{Style.RESET_ALL}")
        logging.error("Unable to read config.json: %s", exc)
        return None

    if not isinstance(raw_config, dict):
        console.print(f"{Fore.RED}config.json must contain a JSON object.{Style.RESET_ALL}")
        logging.error("config.json root is not an object")
        return None

    try:
        download_location = Path(str(raw_config["download_location"]))
        video_quality = int(raw_config["video_quality"])
        video_format = str(raw_config["video_format"]).lower()
        concurrent_downloads = int(raw_config["concurrent_downloads"])
        retry_count = int(raw_config.get("retry_count", DEFAULT_RETRY_COUNT))
        raw_subjects = raw_config["subjects"]
    except KeyError as exc:
        console.print(f"{Fore.RED}config.json is missing required setting: {exc}{Style.RESET_ALL}")
        logging.error("Missing config key: %s", exc)
        return None
    except (TypeError, ValueError) as exc:
        console.print(f"{Fore.RED}config.json contains an invalid value: {exc}{Style.RESET_ALL}")
        logging.error("Invalid config value: %s", exc)
        return None

    if video_quality <= 0 or video_quality > MAX_VIDEO_QUALITY:
        console.print(
            f"{Fore.RED}video_quality must be between 1 and {MAX_VIDEO_QUALITY}.{Style.RESET_ALL}"
        )
        logging.error("Invalid video_quality: %s", video_quality)
        return None

    if concurrent_downloads < 1:
        console.print(f"{Fore.RED}concurrent_downloads must be at least 1.{Style.RESET_ALL}")
        logging.error("Invalid concurrent_downloads: %s", concurrent_downloads)
        return None

    if retry_count < 1:
        console.print(f"{Fore.RED}retry_count must be at least 1.{Style.RESET_ALL}")
        logging.error("Invalid retry_count: %s", retry_count)
        return None

    if video_format != SUPPORTED_VIDEO_FORMAT:
        console.print(
            f"{Fore.RED}Only MP4 output is supported. "
            f"Found '{video_format}' in config.json.{Style.RESET_ALL}"
        )
        logging.error("Unsupported video_format: %s", video_format)
        return None

    if download_location.is_absolute():
        console.print(f"{Fore.RED}download_location must be relative to the project root.{Style.RESET_ALL}")
        logging.error("download_location is absolute: %s", download_location)
        return None

    full_download_location = PROJECT_ROOT / download_location
    try:
        full_download_location.mkdir(parents=True, exist_ok=True)
    except PermissionError as exc:
        console.print(f"{Fore.RED}Cannot create download_location: permission denied.{Style.RESET_ALL}")
        logging.error("Cannot create download_location %s: %s", full_download_location, exc)
        return None
    except OSError as exc:
        console.print(f"{Fore.RED}Cannot create download_location: {exc}{Style.RESET_ALL}")
        logging.error("Cannot create download_location %s: %s", full_download_location, exc)
        return None

    if not isinstance(raw_subjects, dict):
        console.print(f"{Fore.RED}subjects must be a dictionary in config.json.{Style.RESET_ALL}")
        logging.error("Config subjects is not a dictionary")
        return None

    subjects: list[Subject] = []
    for name, subject_config in raw_subjects.items():
        if not isinstance(subject_config, dict):
            console.print(f"{Fore.RED}Subject '{name}' must be a dictionary.{Style.RESET_ALL}")
            logging.error("Subject config is not a dictionary: %s", name)
            return None

        playlist = subject_config.get("playlist", "")
        if not isinstance(playlist, str):
            console.print(f"{Fore.RED}Playlist for '{name}' must be a string.{Style.RESET_ALL}")
            logging.error("Playlist is not a string for subject: %s", name)
            return None

        subjects.append(Subject(name=str(name), playlist=playlist.strip()))

    return DownloaderConfig(
        download_location=full_download_location,
        video_quality=video_quality,
        video_format=video_format,
        concurrent_downloads=concurrent_downloads,
        retry_count=retry_count,
        subjects=tuple(subjects),
    )


def verify_ffmpeg() -> bool:
    """Return True when FFmpeg is available on PATH."""

    if shutil.which("ffmpeg"):
        return True

    message = (
        "FFmpeg was not found on PATH. Please install FFmpeg and try again. "
        "It is required for reliable MP4 merging without re-encoding."
    )
    console.print(f"{Fore.RED}{message}{Style.RESET_ALL}")
    logging.error("Missing FFmpeg")
    return False


def has_internet_connection(timeout: float = 3.0) -> bool:
    """Perform a lightweight connectivity check before downloading."""

    try:
        socket.create_connection(("8.8.8.8", 53), timeout=timeout).close()
        return True
    except OSError as exc:
        logging.warning("Internet connectivity check failed: %s", exc)
        return False


def safe_folder_name(name: str) -> str:
    """Create a Windows-safe folder name for a subject."""

    invalid_chars = '<>:"/\\|?*'
    cleaned = "".join("_" if char in invalid_chars else char for char in name)
    return cleaned.strip().rstrip(".") or "Subject"


def friendly_error(exc: BaseException) -> str:
    """Convert common failures into short user-facing text."""

    message = str(exc)
    lowered = message.lower()
    if "no address associated with hostname" in lowered or "temporary failure" in lowered:
        return "No internet connection or DNS failure."
    if "timed out" in lowered or "timeout" in lowered:
        return "The network connection timed out."
    if "private" in lowered:
        return "The playlist or video is private."
    if "unavailable" in lowered or "removed" in lowered:
        return "The playlist or one of its videos is unavailable."
    if "age" in lowered:
        return "An age-restricted video could not be downloaded."
    if "invalid" in lowered or "unsupported url" in lowered:
        return "The playlist URL is invalid."
    if "no space" in lowered or "disk full" in lowered:
        return "The disk appears to be full."
    if "ffmpeg" in lowered:
        return "FFmpeg is missing or could not process the downloaded streams."
    return message


def format_bytes(value: float | int | None) -> str:
    """Format a byte count for progress display."""

    if value is None:
        return "?"
    size = float(value)
    for unit in ("B", "KiB", "MiB", "GiB"):
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TiB"


def format_eta(seconds: int | float | None) -> str:
    """Format an ETA value from yt-dlp."""

    if seconds is None:
        return "?"
    seconds = int(seconds)
    minutes, remaining_seconds = divmod(seconds, 60)
    hours, remaining_minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}h {remaining_minutes}m"
    if remaining_minutes:
        return f"{remaining_minutes}m {remaining_seconds}s"
    return f"{remaining_seconds}s"
