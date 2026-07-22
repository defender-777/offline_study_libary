"""Generate thumbnails for videos indexed in videos.json."""

from __future__ import annotations

import argparse
import json
import logging
import shutil
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from colorama import Fore, Style, init as colorama_init
from PIL import Image, ImageDraw, ImageFont
from rich.console import Console
from rich.table import Table
from tqdm import tqdm

try:
    from utils import (
        LOG_DIR,
        PROJECT_ROOT,
        format_eta,
        friendly_error,
        safe_folder_name,
        setup_file_logging,
    )
except ModuleNotFoundError:
    from tools.utils import (
        LOG_DIR,
        PROJECT_ROOT,
        format_eta,
        friendly_error,
        safe_folder_name,
        setup_file_logging,
    )


VIDEOS_JSON_PATH = PROJECT_ROOT / "website" / "videos.json"
DOWNLOADS_DIR = PROJECT_ROOT / "downloads"
THUMBNAILS_DIR = PROJECT_ROOT / "thumbnails"
THUMBNAIL_LOG_PATH = LOG_DIR / "thumbnail_generator.log"
THUMBNAIL_SIZE = (320, 180)
JPEG_QUALITY = 85

console = Console()


@dataclass(frozen=True)
class IndexedVideo:
    """Minimal videos.json record required by the thumbnail generator."""

    id: str
    relative_path: str
    subject: str
    duration_seconds: float


@dataclass
class ThumbnailSummary:
    """Thumbnail generation counters."""

    videos_processed: int = 0
    generated: int = 0
    skipped: int = 0
    placeholders: int = 0
    failed: int = 0
    elapsed_seconds: float = 0.0


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""

    parser = argparse.ArgumentParser(description="Generate thumbnails from videos.json.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate thumbnails even when they already exist.",
    )
    return parser.parse_args()


def verify_binary(binary_name: str) -> bool:
    """Return True if a required FFmpeg binary exists on PATH."""

    if shutil.which(binary_name):
        return True
    console.print(f"{Fore.RED}{binary_name} was not found on PATH.{Style.RESET_ALL}")
    logging.error("Missing required binary: %s", binary_name)
    return False


def verify_environment() -> bool:
    """Validate required inputs and folders before generation starts."""

    if not VIDEOS_JSON_PATH.exists():
        console.print(f"{Fore.RED}Missing videos.json. Run the metadata generator first.{Style.RESET_ALL}")
        logging.error("Missing videos.json: %s", VIDEOS_JSON_PATH)
        return False

    if not DOWNLOADS_DIR.exists() or not DOWNLOADS_DIR.is_dir():
        console.print(f"{Fore.RED}Missing downloads folder.{Style.RESET_ALL}")
        logging.error("Missing downloads folder: %s", DOWNLOADS_DIR)
        return False

    try:
        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        LOG_DIR.mkdir(parents=True, exist_ok=True)
    except PermissionError as exc:
        console.print(f"{Fore.RED}Permission denied creating output folders.{Style.RESET_ALL}")
        logging.error("Permission denied creating output folders: %s", exc)
        return False
    except OSError as exc:
        console.print(f"{Fore.RED}Unable to create output folders: {exc}{Style.RESET_ALL}")
        logging.error("Unable to create output folders: %s", exc)
        return False

    ffmpeg_available = verify_binary("ffmpeg")
    ffprobe_available = verify_binary("ffprobe")
    return ffmpeg_available and ffprobe_available


def load_indexed_videos() -> list[IndexedVideo] | None:
    """Load all_videos from videos.json using only the required fields."""

    try:
        raw_data = json.loads(VIDEOS_JSON_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        console.print(f"{Fore.RED}videos.json is invalid JSON: {exc}{Style.RESET_ALL}")
        logging.error("Invalid videos.json: %s", exc)
        return None
    except OSError as exc:
        console.print(f"{Fore.RED}Unable to read videos.json: {exc}{Style.RESET_ALL}")
        logging.error("Unable to read videos.json: %s", exc)
        return None

    raw_videos = raw_data.get("all_videos")
    if not isinstance(raw_videos, list):
        console.print(f"{Fore.RED}videos.json must contain an all_videos list.{Style.RESET_ALL}")
        logging.error("videos.json all_videos is missing or invalid")
        return None

    videos: list[IndexedVideo] = []
    for index, item in enumerate(raw_videos, start=1):
        if not isinstance(item, dict):
            logging.warning("Skipped invalid all_videos item at index %s", index)
            continue

        try:
            video = IndexedVideo(
                id=str(item["id"]).strip(),
                relative_path=str(item["relative_path"]).strip(),
                subject=str(item["subject"]).strip(),
                duration_seconds=float(item.get("duration_seconds") or 0),
            )
        except (KeyError, TypeError, ValueError) as exc:
            logging.warning("Skipped malformed video record at index %s: %s", index, exc)
            continue

        if not video.id or not video.relative_path or not video.subject:
            logging.warning("Skipped incomplete video record at index %s", index)
            continue
        videos.append(video)

    return videos


def project_path(relative_path: str) -> Path | None:
    """Convert a project-relative videos.json path into a safe absolute Path."""

    candidate = (PROJECT_ROOT / Path(relative_path)).resolve()
    try:
        candidate.relative_to(PROJECT_ROOT)
    except ValueError:
        logging.warning("Skipped unsafe path outside project root: %s", relative_path)
        return None
    return candidate


def thumbnail_path(video: IndexedVideo) -> Path:
    """Return the thumbnail output path for an indexed video."""

    return THUMBNAILS_DIR / safe_folder_name(video.subject) / f"{video.id}.jpg"


def frame_timestamp(duration_seconds: float) -> float:
    """Choose thumbnail timestamp: 10 percent of duration or 30s, whichever is smaller."""

    if duration_seconds <= 0:
        return 2.0
    return max(0.0, min(duration_seconds * 0.10, 30.0))


def extract_frame(video_path: Path, output_path: Path, timestamp: float) -> bool:
    """Extract exactly one frame with FFmpeg."""

    command = [
        "ffmpeg",
        "-y",
        "-ss",
        f"{timestamp:.3f}",
        "-i",
        str(video_path),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        str(output_path),
    ]

    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
    except OSError as exc:
        logging.error("Unable to run FFmpeg for %s: %s", video_path, exc)
        return False

    if completed.returncode != 0 or not output_path.exists():
        logging.warning("FFmpeg failed for %s: %s", video_path, completed.stderr.strip())
        return False
    return True


def resize_and_save_jpeg(source_path: Path, thumbnail: Path) -> bool:
    """Resize an extracted frame to a progressive optimized JPEG thumbnail."""

    try:
        with Image.open(source_path) as image:
            image = image.convert("RGB")
            image.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
            canvas = Image.new("RGB", THUMBNAIL_SIZE, (32, 32, 32))
            offset = (
                (THUMBNAIL_SIZE[0] - image.width) // 2,
                (THUMBNAIL_SIZE[1] - image.height) // 2,
            )
            canvas.paste(image, offset)
            canvas.save(
                thumbnail,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )
        return True
    except OSError as exc:
        logging.error("Pillow failed processing %s: %s", source_path, exc)
        return False


def create_placeholder(thumbnail: Path) -> bool:
    """Create a deterministic placeholder thumbnail with Pillow."""

    try:
        image = Image.new("RGB", THUMBNAIL_SIZE, (84, 84, 84))
        draw = ImageDraw.Draw(image)
        center_x = THUMBNAIL_SIZE[0] // 2
        center_y = THUMBNAIL_SIZE[1] // 2
        triangle = [
            (center_x - 18, center_y - 34),
            (center_x - 18, center_y + 2),
            (center_x + 18, center_y - 16),
        ]
        draw.polygon(triangle, fill=(220, 220, 220))

        text = "Video Unavailable"
        font = ImageFont.load_default()
        text_box = draw.textbbox((0, 0), text, font=font)
        text_width = text_box[2] - text_box[0]
        text_height = text_box[3] - text_box[1]
        text_position = (
            (THUMBNAIL_SIZE[0] - text_width) // 2,
            center_y + 28 - text_height // 2,
        )
        draw.text(text_position, text, fill=(245, 245, 245), font=font)
        image.save(
            thumbnail,
            "JPEG",
            quality=JPEG_QUALITY,
            optimize=True,
            progressive=True,
        )
        return True
    except OSError as exc:
        logging.error("Failed to create placeholder %s: %s", thumbnail, exc)
        return False


def generate_one_thumbnail(video: IndexedVideo, force: bool) -> tuple[str, Path]:
    """Generate or skip one video thumbnail.

    Returns a status string: generated, skipped, placeholder, or failed.
    """

    thumbnail = thumbnail_path(video)

    if thumbnail.exists() and not force:
        logging.info("Skipped existing thumbnail: %s", thumbnail)
        return "skipped", thumbnail

    try:
        thumbnail.parent.mkdir(parents=True, exist_ok=True)
    except PermissionError as exc:
        logging.error("Permission denied creating thumbnail folder %s: %s", thumbnail.parent, exc)
        return "failed", thumbnail
    except OSError as exc:
        logging.error("Unable to create thumbnail folder %s: %s", thumbnail.parent, exc)
        return "failed", thumbnail

    video_path = project_path(video.relative_path)
    if video_path is None or not video_path.exists() or not video_path.is_file():
        logging.warning("Video missing; creating placeholder for %s", video.relative_path)
        return ("placeholder" if create_placeholder(thumbnail) else "failed"), thumbnail

    timestamp = frame_timestamp(video.duration_seconds)
    with tempfile.TemporaryDirectory(prefix="thumbnail_", dir=THUMBNAILS_DIR) as temp_dir:
        frame_path = Path(temp_dir) / f"{video.id}.jpg"
        if not extract_frame(video_path, frame_path, timestamp):
            logging.warning("Frame extraction failed; creating placeholder for %s", video.relative_path)
            return ("placeholder" if create_placeholder(thumbnail) else "failed"), thumbnail

        if not resize_and_save_jpeg(frame_path, thumbnail):
            logging.warning("Image processing failed; creating placeholder for %s", video.relative_path)
            return ("placeholder" if create_placeholder(thumbnail) else "failed"), thumbnail

    logging.info("Generated thumbnail: %s", thumbnail)
    return "generated", thumbnail


def generate_thumbnails(videos: list[IndexedVideo], force: bool) -> ThumbnailSummary:
    """Generate thumbnails for every indexed video."""

    summary = ThumbnailSummary()
    start_time = time.monotonic()

    progress = tqdm(
        videos,
        desc="Generating thumbnails",
        unit="video",
        dynamic_ncols=True,
    )
    for video in progress:
        progress.set_postfix(current=video.id[:12])
        summary.videos_processed += 1
        try:
            status, output_path = generate_one_thumbnail(video, force)
        except Exception as exc:
            logging.exception("Unexpected error processing video %s: %s", video.id, exc)
            summary.failed += 1
            continue

        if status == "generated":
            summary.generated += 1
            logging.info("Video processed: %s -> %s", video.id, output_path)
        elif status == "skipped":
            summary.skipped += 1
        elif status == "placeholder":
            summary.placeholders += 1
            logging.info("Placeholder created: %s", output_path)
        else:
            summary.failed += 1

    summary.elapsed_seconds = time.monotonic() - start_time
    return summary


def print_summary(summary: ThumbnailSummary) -> None:
    """Display final thumbnail generation summary."""

    table = Table(title="Thumbnail Generation Complete", show_header=False)
    table.add_column("Label", style="cyan")
    table.add_column("Value", style="white")
    table.add_row("Videos Processed", str(summary.videos_processed))
    table.add_row("Generated", str(summary.generated))
    table.add_row("Skipped", str(summary.skipped))
    table.add_row("Placeholders", str(summary.placeholders))
    table.add_row("Failed", str(summary.failed))
    table.add_row("Elapsed Time", format_eta(summary.elapsed_seconds))
    table.add_row("Output Folder", THUMBNAILS_DIR.relative_to(PROJECT_ROOT).as_posix())
    console.print(table)


def main() -> int:
    """CLI entry point."""

    colorama_init(autoreset=True)
    args = parse_args()
    setup_file_logging(THUMBNAIL_LOG_PATH)
    logging.info("Thumbnail generation started")

    try:
        if not verify_environment():
            return 1

        videos = load_indexed_videos()
        if videos is None:
            return 1

        summary = generate_thumbnails(videos, force=args.force)
        print_summary(summary)
        logging.info("Videos processed: %s", summary.videos_processed)
        logging.info("Generated: %s", summary.generated)
        logging.info("Skipped: %s", summary.skipped)
        logging.info("Placeholders: %s", summary.placeholders)
        logging.info("Failed: %s", summary.failed)
        logging.info("Elapsed time: %.2fs", summary.elapsed_seconds)
        logging.info("Thumbnail generation ended")
        return 0 if summary.failed == 0 else 1
    except KeyboardInterrupt:
        console.print(f"\n{Fore.YELLOW}Thumbnail generation interrupted.{Style.RESET_ALL}")
        logging.warning("Thumbnail generation interrupted by user")
        return 130
    except Exception as exc:
        console.print(f"{Fore.RED}Thumbnail generation failed: {friendly_error(exc)}{Style.RESET_ALL}")
        logging.exception("Thumbnail generation failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
