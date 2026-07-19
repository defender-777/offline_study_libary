"""Generate videos.json for the Offline Study Library."""

from __future__ import annotations

import hashlib
import json
import logging
import subprocess
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from colorama import Fore, Style, init as colorama_init
from rich.console import Console
from rich.table import Table

try:
    from utils import (
        LOG_DIR,
        PROJECT_ROOT,
        Subject,
        format_bytes,
        friendly_error,
        load_config,
        safe_folder_name,
        setup_file_logging,
    )
except ModuleNotFoundError:
    from tools.utils import (
        LOG_DIR,
        PROJECT_ROOT,
        Subject,
        format_bytes,
        friendly_error,
        load_config,
        safe_folder_name,
        setup_file_logging,
    )


GENERATOR_VERSION = "1.0"
VIDEOS_JSON_PATH = PROJECT_ROOT / "website" / "videos.json"
METADATA_LOG_PATH = LOG_DIR / "metadata_generator.log"
SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".avi", ".mov"}

console = Console()


@dataclass(frozen=True)
class Resolution:
    """Video resolution extracted from ffprobe."""

    width: int
    height: int


@dataclass(frozen=True)
class ProbeMetadata:
    """Technical metadata extracted from a video file."""

    duration_seconds: float
    duration_formatted: str
    resolution: Resolution
    fps: float
    video_codec: str
    audio_codec: str


@dataclass(frozen=True)
class VideoMetadata:
    """Metadata record written to videos.json for one video."""

    id: str
    display_title: str
    title: str
    subject: str
    filename: str
    relative_path: str
    thumbnail: str
    search_text: str
    extension: str
    file_size_bytes: int
    file_size_mb: float
    duration_seconds: float
    duration_formatted: str
    resolution: Resolution
    fps: float
    video_codec: str
    audio_codec: str
    created_time: str
    last_modified: str


@dataclass(frozen=True)
class SubjectMetadata:
    """Subject-level videos.json record."""

    name: str
    video_count: int
    videos: list[VideoMetadata]


def default_probe_metadata() -> ProbeMetadata:
    """Return safe defaults for videos that ffprobe cannot read."""

    return ProbeMetadata(
        duration_seconds=0.0,
        duration_formatted="00:00",
        resolution=Resolution(width=0, height=0),
        fps=0.0,
        video_codec="",
        audio_codec="",
    )


def project_relative_path(path: Path) -> str:
    """Return a project-relative POSIX path for JSON output and hashing."""

    return path.relative_to(PROJECT_ROOT).as_posix()


def is_hidden(path: Path) -> bool:
    """Return True when any path segment is hidden."""

    return any(part.startswith(".") for part in path.parts)


def video_id(relative_path: str) -> str:
    """Generate a deterministic video ID from the relative path only."""

    return hashlib.sha256(relative_path.encode("utf-8")).hexdigest()


def format_duration(seconds: float) -> str:
    """Format a duration as HH:MM:SS or MM:SS."""

    total_seconds = max(0, int(round(seconds)))
    hours, remainder = divmod(total_seconds, 3600)
    minutes, remaining_seconds = divmod(remainder, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{remaining_seconds:02d}"
    return f"{minutes:02d}:{remaining_seconds:02d}"


def parse_fps(value: str | None) -> float:
    """Parse ffprobe frame-rate strings such as '30000/1001'."""

    if not value or value == "0/0":
        return 0.0
    try:
        if "/" in value:
            numerator, denominator = value.split("/", 1)
            denominator_value = float(denominator)
            if denominator_value == 0:
                return 0.0
            return round(float(numerator) / denominator_value, 3)
        return round(float(value), 3)
    except (TypeError, ValueError, ZeroDivisionError):
        return 0.0


def run_ffprobe(video_path: Path) -> ProbeMetadata:
    """Extract technical video metadata with ffprobe."""

    command = [
        "ffprobe",
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(video_path),
    ]

    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=True,
        )
        probe_data = json.loads(completed.stdout)
    except FileNotFoundError:
        logging.warning("ffprobe is not installed; using defaults for %s", video_path)
        return default_probe_metadata()
    except subprocess.CalledProcessError as exc:
        logging.warning("ffprobe failed for %s: %s", video_path, exc.stderr.strip())
        return default_probe_metadata()
    except json.JSONDecodeError as exc:
        logging.warning("ffprobe returned invalid JSON for %s: %s", video_path, exc)
        return default_probe_metadata()

    return parse_probe_metadata(probe_data)


def parse_probe_metadata(probe_data: dict[str, Any]) -> ProbeMetadata:
    """Parse ffprobe JSON into a stable metadata object."""

    streams = probe_data.get("streams") or []
    video_stream = next((stream for stream in streams if stream.get("codec_type") == "video"), {})
    audio_stream = next((stream for stream in streams if stream.get("codec_type") == "audio"), {})
    format_data = probe_data.get("format") or {}

    duration = parse_float(format_data.get("duration"))
    if duration == 0:
        duration = parse_float(video_stream.get("duration"))

    width = parse_int(video_stream.get("width"))
    height = parse_int(video_stream.get("height"))
    fps = parse_fps(video_stream.get("avg_frame_rate") or video_stream.get("r_frame_rate"))

    return ProbeMetadata(
        duration_seconds=round(duration, 3),
        duration_formatted=format_duration(duration),
        resolution=Resolution(width=width, height=height),
        fps=fps,
        video_codec=str(video_stream.get("codec_name") or ""),
        audio_codec=str(audio_stream.get("codec_name") or ""),
    )


def parse_float(value: Any) -> float:
    """Parse a float value, returning 0.0 on invalid input."""

    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def parse_int(value: Any) -> int:
    """Parse an integer value, returning 0 on invalid input."""

    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def discover_video_files(subject_dir: Path) -> list[Path]:
    """Return supported, non-hidden video files for one subject directory."""

    try:
        candidates = subject_dir.iterdir()
    except PermissionError as exc:
        console.print(f"{Fore.RED}Permission denied scanning {subject_dir}.{Style.RESET_ALL}")
        logging.error("Permission denied scanning %s: %s", subject_dir, exc)
        return []
    except OSError as exc:
        console.print(f"{Fore.RED}Unable to scan {subject_dir}: {exc}{Style.RESET_ALL}")
        logging.error("Unable to scan %s: %s", subject_dir, exc)
        return []

    videos: list[Path] = []
    for path in candidates:
        if is_hidden(path.relative_to(PROJECT_ROOT)):
            logging.info("Skipped hidden path: %s", path)
            continue
        if not path.is_file():
            if path.is_dir():
                logging.info("Skipped folder inside subject: %s", path)
            continue
        if path.suffix.lower() not in SUPPORTED_VIDEO_EXTENSIONS:
            logging.info("Skipped non-video file: %s", path)
            continue
        videos.append(path)

    return sorted(videos, key=lambda item: item.name.lower())


def build_thumbnail_path(subject: Subject, display_title: str) -> str:
    """Return the expected project-relative thumbnail path."""

    thumbnail = (
        PROJECT_ROOT
        / "thumbnails"
        / safe_folder_name(subject.name)
        / f"{display_title}.jpg"
    )
    return project_relative_path(thumbnail)


def build_video_metadata(video_path: Path, subject: Subject) -> VideoMetadata | None:
    """Build one videos.json video record."""

    try:
        stat = video_path.stat()
    except PermissionError as exc:
        logging.error("Permission denied reading file metadata for %s: %s", video_path, exc)
        return None
    except OSError as exc:
        logging.error("Unable to read file metadata for %s: %s", video_path, exc)
        return None

    relative_path = project_relative_path(video_path)

    display_title = video_path.stem
    filename = video_path.name
    probe = run_ffprobe(video_path)
    file_size_bytes = stat.st_size

    search_text = " ".join(
        [
            display_title.lower(),
            filename.lower(),
            subject.name.lower(),
        ]
    )

    return VideoMetadata(
        id=video_id(relative_path),
        display_title=display_title,
        title=display_title,
        subject=subject.name,
        filename=filename,
        relative_path=relative_path,
        thumbnail=build_thumbnail_path(subject, display_title),
        search_text=search_text,
        extension=video_path.suffix.lower(),
        file_size_bytes=file_size_bytes,
        file_size_mb=round(file_size_bytes / (1024 * 1024), 2),
        duration_seconds=probe.duration_seconds,
        duration_formatted=probe.duration_formatted,
        resolution=probe.resolution,
        fps=probe.fps,
        video_codec=probe.video_codec,
        audio_codec=probe.audio_codec,
        created_time=datetime.fromtimestamp(stat.st_ctime).isoformat(timespec="seconds"),
        last_modified=datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
    )


def scan_subject(subject: Subject, download_location: Path) -> SubjectMetadata | None:
    """Scan one subject folder and return its metadata."""

    subject_dir = download_location / safe_folder_name(subject.name)
    if not subject_dir.exists():
        logging.warning("Missing subject folder skipped: %s", subject_dir)
        return None
    if not subject_dir.is_dir():
        logging.warning("Subject path is not a folder and was skipped: %s", subject_dir)
        return None
    if is_hidden(subject_dir.relative_to(PROJECT_ROOT)):
        logging.info("Hidden subject folder skipped: %s", subject_dir)
        return None

    logging.info("Subject scanned: %s", subject.name)
    videos: list[VideoMetadata] = []
    for video_path in discover_video_files(subject_dir):
        metadata = build_video_metadata(video_path, subject)
        if metadata is None:
            logging.warning("Skipped unreadable video: %s", video_path)
            continue
        videos.append(metadata)
        logging.info("Video indexed: %s", video_path)

    videos.sort(key=lambda item: item.display_title.lower())
    return SubjectMetadata(name=subject.name, video_count=len(videos), videos=videos)


def subjects_to_scan(config_subjects: tuple[Subject, ...], download_location: Path) -> list[Subject]:
    """Return configured subjects plus any existing subject folders."""

    subjects_by_folder = {
        safe_folder_name(subject.name).lower(): subject
        for subject in config_subjects
    }

    try:
        folder_candidates = download_location.iterdir()
    except PermissionError as exc:
        console.print(f"{Fore.RED}Permission denied reading downloads folder.{Style.RESET_ALL}")
        logging.error("Permission denied reading downloads folder %s: %s", download_location, exc)
        folder_candidates = []
    except OSError as exc:
        console.print(f"{Fore.RED}Unable to read downloads folder: {exc}{Style.RESET_ALL}")
        logging.error("Unable to read downloads folder %s: %s", download_location, exc)
        folder_candidates = []

    for folder in folder_candidates:
        if not folder.is_dir() or is_hidden(folder.relative_to(PROJECT_ROOT)):
            continue
        subjects_by_folder.setdefault(folder.name.lower(), Subject(name=folder.name, playlist=""))

    return sorted(subjects_by_folder.values(), key=lambda item: item.name.lower())


def metadata_to_dict(metadata: Any) -> Any:
    """Convert dataclass metadata to dictionaries for JSON serialization."""

    return asdict(metadata)


def generate_metadata() -> tuple[dict[str, Any], float]:
    """Scan downloads and build the full videos.json object."""

    start_time = time.monotonic()
    config = load_config()
    if config is None:
        raise RuntimeError("Unable to load config.json.")

    if not config.download_location.exists():
        logging.warning("Missing downloads folder: %s", config.download_location)
        subjects: list[SubjectMetadata] = []
    else:
        subjects = [
            subject_metadata
            for subject in subjects_to_scan(config.subjects, config.download_location)
            if (subject_metadata := scan_subject(subject, config.download_location)) is not None
        ]

    all_videos = [video for subject in subjects for video in subject.videos]
    data = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "generator_version": GENERATOR_VERSION,
        "total_subjects": len(subjects),
        "total_videos": len(all_videos),
        "subjects": [metadata_to_dict(subject) for subject in subjects],
        "all_videos": [metadata_to_dict(video) for video in all_videos],
    }
    generation_time = time.monotonic() - start_time
    return data, generation_time


def write_videos_json(data: dict[str, Any]) -> None:
    """Write videos.json as deterministic pretty UTF-8 JSON."""

    try:
        VIDEOS_JSON_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=4, sort_keys=False),
            encoding="utf-8",
        )
    except PermissionError as exc:
        logging.error("Permission denied writing videos.json: %s", exc)
        raise
    except OSError as exc:
        logging.error("Unable to write videos.json: %s", exc)
        raise


def print_summary(data: dict[str, Any], generation_time: float) -> None:
    """Display a concise generation summary."""

    table = Table(title="Metadata Generation Complete", show_header=False)
    table.add_column("Label", style="cyan")
    table.add_column("Value", style="white")
    table.add_row("Subjects Indexed", str(data["total_subjects"]))
    table.add_row("Videos Indexed", str(data["total_videos"]))
    table.add_row("Generation Time", f"{generation_time:.2f}s")
    table.add_row("videos.json location", project_relative_path(VIDEOS_JSON_PATH))
    table.add_row("videos.json size", format_bytes(VIDEOS_JSON_PATH.stat().st_size))
    console.print(table)


def main() -> int:
    """Generate videos.json from the downloaded video library."""

    colorama_init(autoreset=True)
    setup_file_logging(METADATA_LOG_PATH)
    logging.info("Metadata generation started")

    try:
        data, generation_time = generate_metadata()
        write_videos_json(data)
        print_summary(data, generation_time)
        logging.info("Videos indexed: %s", data["total_videos"])
        logging.info("Subjects indexed: %s", data["total_subjects"])
        logging.info("Generation time: %.2fs", generation_time)
        logging.info("Metadata generation ended")
        return 0
    except KeyboardInterrupt:
        console.print(f"\n{Fore.YELLOW}Metadata generation interrupted.{Style.RESET_ALL}")
        logging.warning("Metadata generation interrupted by user")
        return 130
    except Exception as exc:
        console.print(f"{Fore.RED}Metadata generation failed: {friendly_error(exc)}{Style.RESET_ALL}")
        logging.exception("Metadata generation failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
