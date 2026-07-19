import { getState, setState } from "../state.js";

const DURATION_BUCKETS = [
  { key: "under-10", label: "<10 min", min: 0, max: 600 },
  { key: "10-30", label: "10–30 min", min: 600, max: 1800 },
  { key: "30-60", label: "30–60 min", min: 1800, max: 3600 },
  { key: "60-plus", label: "60+ min", min: 3600, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "title", label: "Title" },
  { value: "duration", label: "Duration" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "resolution", label: "Resolution" },
  { value: "subject", label: "Subject" },
];

const DISCOVERY_STATE = {
  filters: {
    subject: "All",
    resolution: "All",
    duration: "All",
    fileType: "All",
  },
  sort: {
    by: "relevance",
    order: "desc",
  },
  selectedIndex: 0,
  history: [],
};

function normalizeText(value = "") {
  return String(value).trim().toLowerCase();
}

function normalizeQuery(value = "") {
  return normalizeText(String(value).replace(/\s+/g, " ")).trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFileExtension(video = {}) {
  const path = String(video.relative_path || video.filename || "");
  const parts = path.split(".");
  if (parts.length < 2) {
    return "Unknown";
  }
  return parts.pop().toLowerCase();
}

function getDurationSeconds(video = {}) {
  const duration = video.duration ?? video.duration_formatted ?? "";
  if (typeof duration === "number" && Number.isFinite(duration)) {
    return Math.max(0, duration);
  }

  const value = String(duration).trim();
  if (!value) {
    return 0;
  }

  const parts = value.split(":").map((segment) => Number(segment));
  if (parts.some((segment) => Number.isNaN(segment))) {
    const numeric = Number(String(value).replace(/[^0-9]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return parts[0] || 0;
}

function getResolutionText(video = {}) {
  const resolution = video.resolution;
  if (typeof resolution === "string" && resolution.trim()) {
    return resolution.trim();
  }

  if (resolution && typeof resolution === "object") {
    const width = Number(resolution.width) || 0;
    const height = Number(resolution.height) || 0;
    if (width > 0 && height > 0) {
      return `${height}p`;
    }
  }

  return "Unknown";
}

function getDurationCategory(video) {
  const seconds = getDurationSeconds(video);
  const bucket = DURATION_BUCKETS.find((candidate) => seconds >= candidate.min && seconds < candidate.max);
  return bucket ? bucket.label : "Unknown";
}

function getSearchTokens(query) {
  return normalizeQuery(query)
    .split(" ")
    .filter(Boolean);
}

function isSubsequence(query, target) {
  let qi = 0;
  let ti = 0;
  while (qi < query.length && ti < target.length) {
    if (query[qi] === target[ti]) {
      qi += 1;
    }
    ti += 1;
  }
  return qi === query.length;
}

function fuzzyScore(value = "", query = "") {
  const normalizedValue = normalizeText(value);
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedValue || !normalizedQuery) {
    return 0;
  }

  if (normalizedValue === normalizedQuery) {
    return 1;
  }

  if (normalizedValue.startsWith(normalizedQuery)) {
    return 0.92;
  }

  const tokens = normalizedValue.split(/\s+/);
  if (tokens.some((token) => token.startsWith(normalizedQuery))) {
    return 0.82;
  }

  if (normalizedValue.includes(normalizedQuery)) {
    return 0.7;
  }

  if (isSubsequence(normalizedQuery, normalizedValue)) {
    return 0.45 + Math.min(0.25, normalizedQuery.length / Math.max(8, normalizedValue.length));
  }

  return 0;
}

function buildHighlightRanges(text, query) {
  const normalizedText = normalizeText(text);
  const tokens = getSearchTokens(query);
  if (!tokens.length || !normalizedText) {
    return [];
  }

  const ranges = [];
  for (const token of tokens) {
    let start = 0;
    while (start < normalizedText.length) {
      const index = normalizedText.indexOf(token, start);
      if (index === -1) {
        break;
      }
      ranges.push({ start: index, end: index + token.length });
      start = index + token.length;
    }
  }

  if (!ranges.length) {
    return [];
  }

  ranges.sort((a, b) => a.start - b.start);
  const merged = [ranges[0]];
  for (let i = 1; i < ranges.length; i += 1) {
    const current = ranges[i];
    const last = merged[merged.length - 1];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

function highlightText(text, query) {
  const safeText = String(text);
  const ranges = buildHighlightRanges(safeText, query);
  if (!ranges.length) {
    return escapeHtml(safeText);
  }

  let result = "";
  let lastIndex = 0;

  ranges.forEach((range) => {
    result += escapeHtml(safeText.slice(lastIndex, range.start));
    result += `<mark>${escapeHtml(safeText.slice(range.start, range.end))}</mark>`;
    lastIndex = range.end;
  });

  result += escapeHtml(safeText.slice(lastIndex));
  return result;
}

function getNormalizedVideoText(video) {
  return [
    video.title,
    video.subject,
    video.filename,
    video.description,
    Array.isArray(video.tags) ? video.tags.join(" ") : video.tags,
  ]
    .filter(Boolean)
    .map(normalizeText)
    .join(" ");
}

function getVideoScore(video, query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return 0;
  }

  const titleScore = fuzzyScore(video.title, normalizedQuery) * 1200;
  const subjectScore = fuzzyScore(video.subject, normalizedQuery) * 600;
  const filenameScore = fuzzyScore(video.filename, normalizedQuery) * 350;
  const descriptionScore = fuzzyScore(video.description, normalizedQuery) * 250;
  const tagScore = fuzzyScore(Array.isArray(video.tags) ? video.tags.join(" ") : video.tags, normalizedQuery) * 300;

  const exactTitle = normalizeText(video.title) === normalizedQuery;
  const exactSubject = normalizeText(video.subject) === normalizedQuery;

  return (
    titleScore +
    subjectScore +
    filenameScore +
    descriptionScore +
    tagScore +
    (exactTitle ? 280 : 0) +
    (exactSubject ? 140 : 0)
  );
}

function matchesQuery(video, query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return true;
  }

  return [
    video.title,
    video.subject,
    video.filename,
    video.description,
    Array.isArray(video.tags) ? video.tags.join(" ") : video.tags,
  ]
    .filter(Boolean)
    .some((field) => normalizeText(field).includes(normalizedQuery) || isSubsequence(normalizedQuery, normalizeText(field)));
}

function applyFilters(videos, filters) {
  return videos.filter((video) => {
    if (filters.subject && filters.subject !== "All" && normalizeText(video.subject) !== normalizeText(filters.subject)) {
      return false;
    }

    if (filters.resolution && filters.resolution !== "All" && getResolutionText(video) !== filters.resolution) {
      return false;
    }

    if (filters.duration && filters.duration !== "All" && getDurationCategory(video) !== filters.duration) {
      return false;
    }

    if (filters.fileType && filters.fileType !== "All" && getFileExtension(video) !== filters.fileType.toLowerCase()) {
      return false;
    }

    return true;
  });
}

function sortVideos(scoredVideos, sort) {
  const direction = sort.order === "asc" ? 1 : -1;
  return [...scoredVideos].sort((left, right) => {
    if (sort.by === "relevance") {
      return direction * (right.score - left.score) || direction * (right.score - left.score);
    }

    if (sort.by === "title") {
      return direction * (String(left.video.title || "").localeCompare(String(right.video.title || ""), undefined, { numeric: true, sensitivity: "base" }));
    }

    if (sort.by === "duration") {
      return direction * (getDurationSeconds(left.video) - getDurationSeconds(right.video));
    }

    if (sort.by === "newest" || sort.by === "oldest") {
      const leftTimestamp = Date.parse(left.video.created_time || left.video.last_modified || "") || 0;
      const rightTimestamp = Date.parse(right.video.created_time || right.video.last_modified || "") || 0;
      return (sort.by === "newest" ? -1 : 1) * (leftTimestamp - rightTimestamp) * direction;
    }

    if (sort.by === "resolution") {
      const leftRes = Number(String(getResolutionText(left.video)).replace(/[^0-9]/g, "")) || 0;
      const rightRes = Number(String(getResolutionText(right.video)).replace(/[^0-9]/g, "")) || 0;
      return direction * (leftRes - rightRes);
    }

    if (sort.by === "subject") {
      return direction * String(left.video.subject || "").localeCompare(String(right.video.subject || ""), undefined, { sensitivity: "base" });
    }

    return 0;
  });
}

export function getDefaultFilters() {
  return { ...DISCOVERY_STATE.filters };
}

export function getSortOptions() {
  return SORT_OPTIONS;
}

export function getDiscoveryState() {
  return {
    filters: { ...DISCOVERY_STATE.filters },
    sort: { ...DISCOVERY_STATE.sort },
    selectedIndex: DISCOVERY_STATE.selectedIndex,
    history: [...DISCOVERY_STATE.history],
  };
}

export function updateFilter(filterKey, value) {
  if (!Object.prototype.hasOwnProperty.call(DISCOVERY_STATE.filters, filterKey)) {
    return;
  }

  DISCOVERY_STATE.filters[filterKey] = value || "All";
  DISCOVERY_STATE.selectedIndex = 0;
  setState({});
}

export function updateSort(by, order) {
  DISCOVERY_STATE.sort.by = by || "relevance";
  DISCOVERY_STATE.sort.order = order === "asc" ? "asc" : "desc";
  DISCOVERY_STATE.selectedIndex = 0;
  setState({});
}

export function setSelectedIndex(index) {
  DISCOVERY_STATE.selectedIndex = Number.isFinite(index) ? index : 0;
  setState({});
}

export function resetSelectedIndex() {
  DISCOVERY_STATE.selectedIndex = 0;
}

export function recordSearchQuery(query) {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return;
  }

  const existingIndex = DISCOVERY_STATE.history.findIndex((entry) => entry === normalized);
  if (existingIndex !== -1) {
    DISCOVERY_STATE.history.splice(existingIndex, 1);
  }

  DISCOVERY_STATE.history.unshift(normalized);
  if (DISCOVERY_STATE.history.length > 10) {
    DISCOVERY_STATE.history.length = 10;
  }
}

export function clearSearchHistory() {
  DISCOVERY_STATE.history.length = 0;
  setState({});
}

export function getSearchHistory() {
  return [...DISCOVERY_STATE.history];
}

export function getFilterOptions(videos = []) {
  const subjects = new Set();
  const resolutions = new Set();
  const durations = new Set();
  const fileTypes = new Set();

  videos.forEach((video) => {
    if (video.subject) {
      subjects.add(video.subject);
    }
    const resolution = getResolutionText(video);
    if (resolution) {
      resolutions.add(resolution);
    }
    const duration = getDurationCategory(video);
    if (duration) {
      durations.add(duration);
    }
    const fileType = getFileExtension(video);
    if (fileType && fileType !== "Unknown") {
      fileTypes.add(fileType);
    }
  });

  return {
    subjects: ["All", ...Array.from(subjects).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))],
    resolutions: ["All", ...Array.from(resolutions).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))],
    durations: ["All", ...DURATION_BUCKETS.map((bucket) => bucket.label).filter((label, index, values) => values.indexOf(label) === index)],
    fileTypes: ["All", ...Array.from(fileTypes).sort()],
  };
}

export function getDiscoveryResults(videos = [], query = "") {
  if (!Array.isArray(videos)) {
    return [];
  }

  const filters = { ...DISCOVERY_STATE.filters };
  const sort = { ...DISCOVERY_STATE.sort };
  const filtered = applyFilters(videos, filters);
  const scored = filtered
    .filter((video) => matchesQuery(video, query))
    .map((video) => ({
      video,
      score: getVideoScore(video, query),
      highlight: {
        title: highlightText(video.title || video.filename || "Untitled video", query),
        description: highlightText(video.description || video.filename || "", query),
        subject: highlightText(video.subject || "", query),
      },
    }));

  return sortVideos(scored, sort);
}

export function getDiscoverySummary(videos = [], query = "") {
  const filtered = applyFilters(videos, DISCOVERY_STATE.filters);
  const results = filtered.filter((video) => matchesQuery(video, query));
  const subjectSet = new Set(videos.map((video) => normalizeText(video.subject)).filter(Boolean));

  const activeFilters = Object.entries(DISCOVERY_STATE.filters).filter(([, value]) => value && value !== "All");

  return {
    totalVideos: videos.length,
    totalSubjects: subjectSet.size,
    filteredVideos: results.length,
    activeFilters: activeFilters.map(([key, value]) => ({ key, value })),
    sortLabel: SORT_OPTIONS.find((option) => option.value === DISCOVERY_STATE.sort.by)?.label || "Relevance",
    sortOrder: DISCOVERY_STATE.sort.order,
    selectedIndex: DISCOVERY_STATE.selectedIndex,
  };
}

export function getRelatedVideos(video, videos = [], limit = 4) {
  if (!video || !Array.isArray(videos) || videos.length === 0) {
    return [];
  }

  const candidates = videos
    .filter((candidate) => String(candidate.id) !== String(video.id))
    .map((candidate) => {
      const subjectBonus = normalizeText(candidate.subject) === normalizeText(video.subject) ? 150 : 0;
      const resolutionBonus = getResolutionText(candidate) === getResolutionText(video) ? 50 : 0;
      const filenameBonus = normalizeText(candidate.filename || "") === normalizeText(video.filename || "") ? 30 : 0;
      return {
        video: candidate,
        score: getVideoScore(candidate, video.title || "") + subjectBonus + resolutionBonus + filenameBonus,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.video);

  return candidates;
}

export function getRecentVideos(videos = [], limit = 4) {
  return [...videos]
    .sort((a, b) => {
      const aTime = Date.parse(a.created_time || a.last_modified || "") || 0;
      const bTime = Date.parse(b.created_time || b.last_modified || "") || 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export function getNewestVideos(videos = [], limit = 4) {
  return getRecentVideos(videos, limit);
}

export function getSubjectSummaries(videos = [], limit = 5) {
  const summary = videos.reduce((acc, video) => {
    const subject = video.subject || "Unknown";
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(summary)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" }))
    .slice(0, limit);
}

export function getSubjectVideos(videos = [], subjectName) {
  if (!subjectName) {
    return [];
  }
  return videos.filter((video) => normalizeText(video.subject) === normalizeText(subjectName));
}

export function getFeaturedVideos(videos = [], limit = 6) {
  return [...videos].slice(0, limit);
}

export function getFilterLabelForKey(key) {
  if (key === "subject") return "Subject";
  if (key === "resolution") return "Resolution";
  if (key === "duration") return "Duration";
  if (key === "fileType") return "File Type";
  return key;
}

export function getSelectedFilters() {
  return { ...DISCOVERY_STATE.filters };
}

export function getSortState() {
  return { ...DISCOVERY_STATE.sort };
}

export function resetFilters() {
  DISCOVERY_STATE.filters = getDefaultFilters();
  DISCOVERY_STATE.selectedIndex = 0;
  setState({});
}

export function clearSearch() {
  setState({ searchQuery: "" });
  DISCOVERY_STATE.selectedIndex = 0;
}
