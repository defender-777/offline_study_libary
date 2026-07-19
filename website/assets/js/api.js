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

function resolveThumbnailUrl(thumbnail) {
  if (!thumbnail) {
    return null;
  }

  const normalized = String(thumbnail).replace(/^\/+/, "");
  return `../${encodeURI(normalized)}`;
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

  return resolveThumbnailUrl(video.thumbnail);
}

/**
 * @param {object} video
 * @returns {string}
 */
export function getDurationLabel(video) {
  return String(video?.duration_formatted || video?.duration || "Unknown");
}

/**
 * @param {object} video
 * @returns {string}
 */
export function getResolutionLabel(video) {
  const resolution = video?.resolution;

  if (typeof resolution === "string") {
    return resolution;
  }

  if (resolution && typeof resolution === "object") {
    const width = Number(resolution.width);
    const height = Number(resolution.height);
    if (width > 0 && height > 0) {
      return `${height}p`;
    }
  }

  return "Unknown";
}
