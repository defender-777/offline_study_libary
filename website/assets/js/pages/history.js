import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderStatCard } from "../components/stat-card.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { ROUTES } from "../constants.js";
import { getState } from "../state.js";
import { getVideos, getThumbnailUrl, getDurationLabel, getResolutionLabel } from "../api.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const totalSeconds = Math.round(seconds);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function parseDurationToSeconds(video) {
  const raw = getDurationLabel(video);
  if (!raw || raw === "Unknown") {
    return 0;
  }

  const compact = String(raw).trim().toLowerCase();
  const timeMatch = compact.match(/^(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?$/);
  if (timeMatch && (timeMatch[1] || timeMatch[2] || timeMatch[3])) {
    const hours = Number(timeMatch[1] || 0);
    const minutes = Number(timeMatch[2] || 0);
    const seconds = Number(timeMatch[3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const colonParts = compact.split(":").map((part) => Number(part));
  if (colonParts.every((part) => Number.isFinite(part))) {
    if (colonParts.length === 3) {
      return colonParts[0] * 3600 + colonParts[1] * 60 + colonParts[2];
    }
    if (colonParts.length === 2) {
      return colonParts[0] * 60 + colonParts[1];
    }
  }

  return 0;
}

function formatWatchedLabel(value) {
  if (!value) {
    return "Recently watched";
  }

  if (typeof value === "string") {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(date);
}

function getHistorySource() {
  const state = getState();
  const history = Array.isArray(state.history) ? state.history : [];
  const continueWatching = Array.isArray(state.continueWatching) ? state.continueWatching : [];

  return [...history, ...continueWatching];
}

function resolveHistoryEntries() {
  const videos = getVideos();
  const videosById = new Map(videos.map((video) => [String(video.id), video]));
  const seen = new Set();

  return getHistorySource()
    .map((entry, index) => {
      const source = entry && typeof entry === "object" ? entry : null;
      const videoId = source?.videoId ?? source?.id ?? source?.video_id ?? null;
      const video = videoId != null ? videosById.get(String(videoId)) ?? null : null;

      const title = video?.title || source?.title || "Untitled";
      const subject = video?.subject || source?.subject || "";
      const progressValue = Number(
        source?.progress ?? source?.watchProgress ?? source?.watchedPercent ?? source?.percent ?? 0,
      );
      const progress = Number.isFinite(progressValue) ? Math.max(0, Math.min(100, progressValue)) : 0;
      const watchedLabel = formatWatchedLabel(
        source?.watchedAt || source?.lastWatched || source?.timestamp || source?.time || source?.updatedAt,
      );
      const completed = Boolean(source?.completed || progress >= 99.5);
      const watchSeconds = Number(
        source?.watchTimeSeconds
        ?? source?.watchedSeconds
        ?? source?.progressSeconds
        ?? (progress && video ? (progress / 100) * parseDurationToSeconds(video) : 0),
      );

      const key = String(videoId ?? `${title}-${watchedLabel}-${index}`);
      if (seen.has(key)) {
        return null;
      }
      seen.add(key);

      return {
        key,
        video,
        title,
        subject,
        videoId,
        watchedLabel,
        progress,
        completed,
        watchSeconds: Number.isFinite(watchSeconds) ? Math.max(0, watchSeconds) : 0,
        note: source?.note || source?.description || source?.time || "",
      };
    })
    .filter(Boolean);
}

function renderHistoryCard(entry) {
  const card = renderVideoCard({
    title: entry.title,
    subject: entry.subject,
    duration: entry.video ? getDurationLabel(entry.video) : "Unknown",
    resolution: entry.video ? getResolutionLabel(entry.video) : "Unknown",
    thumbnail: entry.video ? getThumbnailUrl(entry.video) : null,
    description: entry.video?.display_title || entry.video?.filename || entry.note || "Previously watched video",
    videoId: entry.videoId,
    progress: entry.progress,
  });

  const progressBadge = entry.completed
    ? `<span class="badge badge-new">Completed</span>`
    : entry.progress > 0
      ? `<span class="badge badge-pill">${Math.round(entry.progress)}% watched</span>`
      : "";

  return `
    <article class="history-item">
      ${card}
      <div class="history-item__meta">
        <span class="badge badge-pill">Last watched ${escapeHtml(entry.watchedLabel)}</span>
        ${progressBadge}
      </div>
    </article>
  `;
}

function getWatchTimeLabel(entries) {
  const totalSeconds = entries.reduce((sum, entry) => sum + (entry.watchSeconds || 0), 0);
  const label = formatDuration(totalSeconds);
  return label || "Not tracked";
}

/**
 * Renders the history page.
 * @returns {string}
 */
export function render() {
  const historyEntries = resolveHistoryEntries();
  const watchedTitles = historyEntries.slice(0, 3).map((entry) => entry.title);
  const totalWatched = historyEntries.length;
  const totalWatchTime = getWatchTimeLabel(historyEntries);

  return `
    <section class="page-view" aria-labelledby="history-title">
      ${renderPageHeader({
        eyebrow: "History",
        title: "Watch History",
        description: totalWatched
          ? "Everything you have watched, ordered by the most recent activity."
          : "Everything you have watched will appear here once playback starts.",
      })}

      ${historyEntries.length
        ? `
          <section class="media-section">
            ${renderSectionHeader({
              title: "Overview",
              subtitle: `${totalWatched} watched video${totalWatched !== 1 ? "s" : ""}`,
            })}
            <div class="stats-grid history-stats-grid">
              ${renderStatCard({
                label: "Watched",
                value: String(totalWatched),
                helper: "Saved locally in your watch history",
              })}
              ${renderStatCard({
                label: "Watch time",
                value: totalWatchTime,
                helper: totalWatchTime === "Not tracked" ? "Progress data not available yet" : "Approximate total playback time",
              })}
              ${renderStatCard({
                label: "Recent",
                value: watchedTitles[0] ? "Latest" : "—",
                helper: watchedTitles[0] || "No recent playback yet",
              })}
            </div>
          </section>

          <section class="media-section">
            ${renderSectionHeader({
              title: "Recently watched",
              subtitle: watchedTitles.length ? watchedTitles.join(" · ") : "Latest playback sessions",
            })}
            <div class="history-grid">
              ${historyEntries.map(renderHistoryCard).join("")}
            </div>
          </section>
        `
        : renderEmptyState({
            title: "No watch history yet",
            message: "Playback activity will appear here after you open a video from the library.",
            action: `<a href="#${ROUTES.HOME}" class="button">Browse library</a>`,
          })}
    </section>
  `;
}
