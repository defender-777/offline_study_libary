import { getState } from "../state.js";

/**
 * Renders a video card.
 *
 * Default: vertical poster card with 16:9 thumbnail (YouTube style).
 * Duration badge is overlaid on the thumbnail bottom-right corner.
 *
 * Pass `layout="list"` for the compact horizontal row used in search
 * results and the player related-videos panel.
 *
 * @param {{
 *   title: string,
 *   titleHtml?: string,
 *   subject: string,
 *   subjectHtml?: string,
 *   duration: string,
 *   resolution: string,
 *   thumbnail?: string|null,
 *   progress?: number,
 *   isNew?: boolean,
 *   description?: string,
 *   descriptionHtml?: string,
 *   videoId?: string|number|null,
 *   selected?: boolean,
 *   layout?: "poster"|"list"
 * }} props
 * @returns {string}
 */

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isFavorited(videoId) {
  if (videoId == null) {
    return false;
  }

  const favorites = getState().favorites;
  if (!Array.isArray(favorites) || !favorites.length) {
    return false;
  }

  const targetId = String(videoId);
  return favorites.some((favorite) => {
    const favoriteId = favorite && typeof favorite === "object" && favorite.id != null
      ? String(favorite.id)
      : String(favorite);
    return favoriteId === targetId;
  });
}

export function renderVideoCard({
  title,
  titleHtml,
  subject,
  subjectHtml,
  duration,
  resolution,
  thumbnail = null,
  progress = 0,
  isNew = false,
  description = "",
  descriptionHtml,
  videoId = null,
  selected = false,
  layout = "poster",
}) {
  const videoIdAttr = videoId
    ? ` data-video-id="${String(videoId).replace(/"/g, "&quot;")}"`
    : "";
  const selectedClass = selected ? " video-card--selected" : "";
  const layoutClass   = layout === "list" ? " video-card--list" : "";
  const favoriteId = videoId != null ? String(videoId) : "";
  const favorited = isFavorited(videoId);

  const displayTitle       = titleHtml       || title       || "Untitled";
  const displaySubject     = subjectHtml     || subject     || "";
  const displayDescription = descriptionHtml || description || "";

  const hasDuration   = duration   && duration   !== "Unknown";
  const hasResolution = resolution && resolution !== "Unknown";

  // ── Play button ──
  const playBtn = `
    <div class="video-card__play-overlay">
      <div class="video-card__play-btn" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.14v14l11-7-11-7z"/>
        </svg>
      </div>
    </div>`;

  const favoriteBtn = videoId != null
    ? `
    <button
      type="button"
      class="video-card__favorite${favorited ? " video-card__favorite--active" : ""}"
      data-favorite-toggle
      data-video-id="${escapeHtml(favoriteId)}"
      aria-pressed="${favorited ? "true" : "false"}"
      aria-label="${escapeHtml(favorited ? `Remove ${displayTitle} from favorites` : `Add ${displayTitle} to favorites`)}">
      <svg class="video-card__favorite-icon video-card__favorite-icon--off" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 17.5l-5.5 3 1.5-6.5L3 9.5l6.8-1L12 3l2.2 5.5 6.8 1-5 4.5 1.5 6.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <svg class="video-card__favorite-icon video-card__favorite-icon--on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 17.5l-5.5 3 1.5-6.5L3 9.5l6.8-1L12 3l2.2 5.5 6.8 1-5 4.5 1.5 6.5z"/>
      </svg>
    </button>`
    : "";

  // ── Thumbnail ──
  const thumbContent = thumbnail
    ? `<img
         class="video-card__image"
         src="${thumbnail}"
         alt="${(title || "Video").replace(/"/g, "&quot;")} thumbnail"
         loading="lazy"
         decoding="async"
       />`
    : `<div class="video-card__placeholder" aria-hidden="true">
         <svg class="video-card__placeholder-icon" viewBox="0 0 24 24" fill="none">
           <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
           <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
         </svg>
       </div>`;

  // Duration badge pinned to thumbnail
  const durationBadge = hasDuration
    ? `<span class="video-card__duration"><span class="badge badge-duration">${duration}</span></span>`
    : "";

  // Progress bar inside thumbnail
  const progressBar = progress > 0
    ? `<div
         class="progress-bar"
         role="progressbar"
         aria-valuenow="${progress}"
         aria-valuemin="0"
         aria-valuemax="100"
         aria-label="Progress ${progress}%">
         <div class="progress-bar__fill" style="width:${progress}%"></div>
       </div>`
    : "";

  // ── Body ──
  const subjectBadge = displaySubject
    ? `<span class="badge badge-pill">${displaySubject}</span>`
    : "";

  const newBadge = isNew
    ? `<span class="badge badge-new">New</span>`
    : "";

  const resolutionBadge = hasResolution
    ? `<span class="badge badge-resolution">${resolution}</span>`
    : "";

  return `
<article
  class="video-card${selectedClass}${layoutClass}"
  ${videoIdAttr}
  tabindex="0"
  role="button"
  aria-label="Play ${(title || "video").replace(/"/g, "&quot;")}">
  <div class="video-card__thumbnail">
    ${thumbContent}
    ${playBtn}
    ${favoriteBtn}
    ${durationBadge}
    ${progressBar}
  </div>
  <div class="video-card__body">
    ${subjectBadge || newBadge ? `
    <div class="video-card__meta">
      ${subjectBadge}
      ${newBadge}
    </div>` : ""}
    <h4 class="video-card__title">${displayTitle}</h4>
    ${displayDescription
      ? `<p class="video-card__description">${displayDescription}</p>`
      : ""}
    ${resolutionBadge
      ? `<div class="video-card__footer">${resolutionBadge}</div>`
      : ""}
  </div>
</article>`.trim();
}
