/**
 * Renders a video card with optional thumbnail support.
 * @param {{title:string, subject:string, duration:string, resolution:string, thumbnail?:string, progress?:number, isNew?:boolean, description?:string}} props
 * @returns {string}
 */
export function renderVideoCard({ title, titleHtml, subject, subjectHtml, duration, resolution, thumbnail = null, progress = 0, isNew = false, description = "", descriptionHtml, videoId = null, selected = false }) {
  const videoIdAttr = videoId ? ` data-video-id="${String(videoId).replace(/"/g, "&quot;")}"` : "";
  const selectedClass = selected ? " video-card--selected" : "";

  return `
  <article class="video-card${selectedClass}"${videoIdAttr}>
    <div class="video-card__thumbnail" aria-hidden="true">
      ${thumbnail ? `<img class="video-card__image" src="${thumbnail}" alt="${title} thumbnail" loading="lazy" />` : `<span class="video-card__placeholder">No image</span>`}
    </div>
    <div class="video-card__body">
      <div class="video-card__meta">
        <span class="badge badge-pill">${subjectHtml || subject}</span>
        ${isNew ? `<span class="badge badge-new">New</span>` : ""}
      </div>
      <h4 class="video-card__title">${titleHtml || title}</h4>
      <p class="video-card__description">${descriptionHtml || description}</p>
      <div class="video-card__footer">
        <span class="badge badge-duration">${duration}</span>
        <span class="badge badge-resolution">${resolution}</span>
      </div>
      ${progress > 0 ? `
        <div class="progress-bar" aria-label="Progress ${progress} percent">
          <div class="progress-bar__fill" style="width: ${progress}%;"></div>
        </div>
      ` : ""}
    </div>
  </article>
  `;
}
