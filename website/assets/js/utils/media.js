const VIDEO_MIME_TYPES = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

const SUBTITLE_EXTENSIONS = [".vtt", ".srt"];

function resolveAssetUrl(relativePath) {
  if (!relativePath) {
    return null;
  }

  const normalized = String(relativePath).replace(/^\/+/, "");
  return `../${encodeURI(normalized)}`;
}

export function getVideoSourceUrl(video) {
  if (!video || !video.relative_path) {
    return null;
  }

  return resolveAssetUrl(video.relative_path);
}

export function getVideoMimeType(video) {
  if (!video || !video.relative_path) {
    return "video/mp4";
  }

  const extension = String(video.relative_path)
    .split(".")
    .pop()
    .toLowerCase();

  return VIDEO_MIME_TYPES[extension] || "video/mp4";
}

export function getSubtitleCandidateUrls(video) {
  if (!video || !video.relative_path) {
    return [];
  }

  const base = String(video.relative_path).replace(/\.[^/.]+$/, "");
  return SUBTITLE_EXTENSIONS.map((extension) => ({
    url: resolveAssetUrl(`${base}${extension}`),
    extension,
  }));
}

export async function checkUrlExists(url) {
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function discoverSubtitleTracks(video) {
  const candidates = getSubtitleCandidateUrls(video);
  const available = [];

  await Promise.all(candidates.map(async (candidate) => {
    if (!candidate.url) {
      return;
    }

    const exists = await checkUrlExists(candidate.url);
    if (!exists) {
      return;
    }

    available.push({
      src: candidate.url,
      kind: "subtitles",
      srclang: candidate.extension === ".srt" ? "en" : "en",
      label: candidate.extension === ".vtt" ? "Subtitles" : "Subtitles",
    });
  }));

  return available;
}

export function formatFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes) || bytes < 0) {
    return "Unknown";
  }

  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  }

  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  if (bytes >= 1_000) {
    return `${Math.round(bytes / 1_000)} KB`;
  }

  return `${bytes} B`;
}

export function formatTechnicalLabel(video) {
  const parts = [];

  if (video?.resolution) {
    if (typeof video.resolution === "string") {
      parts.push(video.resolution);
    } else if (video.resolution.width && video.resolution.height) {
      parts.push(`${video.resolution.width}×${video.resolution.height}`);
    }
  }

  if (video?.video_codec) {
    parts.push(video.video_codec);
  }

  if (video?.fps) {
    parts.push(`${video.fps} fps`);
  }

  if (video?.bitrate) {
    parts.push(`${video.bitrate} kbps`);
  }

  return parts.length ? parts.join(" · ") : "Unknown";
}
