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
  <div class="video-card__thumbnail" aria-hidden="true">
    ${thumbContent}
    ${playBtn}
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
