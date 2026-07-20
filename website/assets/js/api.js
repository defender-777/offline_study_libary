const LIBRARY_PATH = "../videos.json";
let libraryCache = null;

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`Library manifest must contain a valid ${label} array.`);
  }
  return value;
}

function safeValue(value, fallback) {
  return value == null ? fallback : value;
}

function resolveThumbnailUrl(thumbnail, videoId) {
  if (!thumbnail) {
    return null;
  }

  // The metadata generator (generate_metadata.py::build_thumbnail_path) writes
  // the thumbnail field as:
  //   thumbnails/<Subject>/<display_title>.jpg
  //
  // The thumbnail generator (generate_thumbnails.py::thumbnail_path) saves the
  // actual file as:
  //   thumbnails/<Subject>/<video_id_hash>.jpg
  //
  // The two use DIFFERENT naming conventions — the metadata path never exists on
  // disk.  The only reliable approach is to reconstruct the correct path from the
  // video ID hash and the subject directory that IS encoded in the metadata path.
  //
  // Strategy: keep the directory segments from the metadata field (they are
  // correct) and replace only the filename with the video ID.
  if (videoId) {
    const parts = String(thumbnail).replace(/^\/+/, "").split("/");
    // Replace the filename (last segment) with the ID-based filename.
    parts[parts.length - 1] = `${videoId}.jpg`;
    const encoded = parts
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `../${encoded}`;
  }

  // Fallback: encode the path as-is (no video ID available).
  const normalized = String(thumbnail).replace(/^\/+/, "");
  const encoded = normalized
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `../${encoded}`;
}

function normalizeLibrary(rawData) {
  if (!rawData || typeof rawData !== "object") {
    throw new Error("videos.json did not return an object.");
  }

  const subjects = assertArray(rawData.subjects, "subjects");
  const all_videos = assertArray(rawData.all_videos, "all_videos");

  return {
    ...rawData,
    subjects,
    all_videos,
  };
}

/**
 * Loads the library manifest once and caches the result.
 * @returns {Promise<object>}
 */
export async function loadLibrary() {
  if (libraryCache) {
    return libraryCache;
  }

  let response;

  try {
    response = await fetch(LIBRARY_PATH, {
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Unable to fetch videos.json. Please ensure the library manifest exists.");
  }

  if (!response.ok) {
    throw new Error(`Failed to load videos.json: ${response.status} ${response.statusText}`);
  }

  let raw;

  try {
    raw = await response.json();
  } catch (error) {
    throw new Error("videos.json contains invalid JSON.");
  }

  const library = normalizeLibrary(raw);
  libraryCache = library;
  return library;
}

/**
 * @returns {Array<object>}
 */
export function getSubjects() {
  return libraryCache?.subjects ?? [];
}

/**
 * @returns {Array<object>}
 */
export function getVideos() {
  return libraryCache?.all_videos ?? [];
}

/**
 * @param {string|number} id
 * @returns {object|null}
 */
export function getVideoById(id) {
  return getVideos().find((video) => String(video.id) === String(id)) ?? null;
}

/**
 * @param {string} subjectName
 * @returns {Array<object>}
 */
export function getVideosBySubject(subjectName) {
  if (!subjectName) {
    return [];
  }
  return getVideos().filter((video) => String(video.subject) === String(subjectName));
}

export function getSubjectSlug(subject) {
  if (!subject) {
    return "";
  }

  if (typeof subject.slug === "string" && subject.slug.trim()) {
    return subject.slug.trim();
  }

  if (typeof subject.name === "string") {
    return String(subject.name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  return "";
}

export function getSubjectBySlug(slug) {
  if (!slug) {
    return null;
  }
  return getSubjects().find((subject) => {
    const normalized = getSubjectSlug(subject);
    return normalized === String(slug).trim();
  }) ?? null;
}

/**
 * @returns {{totalSubjects:number,totalVideos:number,subjects:Array<object>}}
 */
export function getLibraryStats() {
  const subjects = getSubjects();
  const videos = getVideos();

  return {
    totalSubjects: subjects.length,
    totalVideos: videos.length,
    subjects: subjects.map((subject) => ({
      name: subject.name,
      count: Number(subject.video_count ?? subject.videos?.length ?? 0),
    })),
  };
}

/**
 * @param {object} video
 * @returns {string|null}
 */
export function getThumbnailUrl(video) {
  if (!video || !video.thumbnail) {
    return null;
  }

  // Pass the video ID so resolveThumbnailUrl can build the correct
  // ID-based filename that the thumbnail generator actually wrote to disk.
  return resolveThumbnailUrl(video.thumbnail, video.id);
}

/**
 * @param {object} video
 * @returns {string}
 */
export function getDurationLabel(video) {
  const raw = video?.duration_formatted || video?.duration;
  if (!raw) {
    return "Unknown";
  }
  const str = String(raw).trim();
  // Treat zero-value placeholders produced by the metadata generator as unknown.
  if (str === "00:00" || str === "0" || str === "0:00" || str === "0.0") {
    return "Unknown";
  }
  return str;
}

/**
 * Extracts a resolution label like "360p" from the video title when the
 * structured metadata contains zero-value dimensions.
 * @param {string} title
 * @returns {string|null}
 */
function parseResolutionFromTitle(title) {
  if (!title) {
    return null;
  }
  const match = String(title).match(/\b(\d{3,4}p)\b/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * @param {object} video
 * @returns {string}
 */
export function getResolutionLabel(video) {
  const resolution = video?.resolution;

  if (typeof resolution === "string" && resolution.trim()) {
    return resolution.trim();
  }

  if (resolution && typeof resolution === "object") {
    const width = Number(resolution.width);
    const height = Number(resolution.height);
    if (width > 0 && height > 0) {
      return `${height}p`;
    }
  }

  // Structured metadata is missing or zero — try parsing from the display title.
  const fromTitle = parseResolutionFromTitle(video?.title || video?.display_title || video?.filename);
  if (fromTitle) {
    return fromTitle;
  }

  return "Unknown";
}
