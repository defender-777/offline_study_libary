/**
 * Renders a subject card as a cover tile.
 *
 * The accent colour is used as the dominant background gradient.
 * Text is rendered over a darkening scrim for legibility.
 *
 * @param {{title:string, subtitle:string, count:number, accent:string, href?:string}} props
 * @returns {string}
 */
export function renderSubjectCard({ title, subtitle, count, accent, href = "" }) {
  // Build a rich gradient from the accent colour
  const coverGradient = `linear-gradient(
    135deg,
    ${accent}55 0%,
    ${accent}22 40%,
    rgba(15, 21, 32, 0.6) 100%
  )`;

  const inner = `
    <div class="subject-card__cover" aria-hidden="true"
         style="background: ${coverGradient};"></div>
    <div class="subject-card__scrim" aria-hidden="true"></div>
    <div class="subject-card__content">
      <h4>${title}</h4>
      <p>${count} video${count !== 1 ? "s" : ""}</p>
    </div>
  `;

  if (href) {
    return `<a class="subject-card" href="${href}" aria-label="Browse ${title}">${inner}</a>`;
  }

  return `<article class="subject-card">${inner}</article>`;
}
