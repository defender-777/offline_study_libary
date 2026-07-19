/**
 * Renders a compact stat item — intentionally lightweight so it
 * doesn't compete with media content on the page.
 * @param {{label:string, value:string, helper:string}} props
 * @returns {string}
 */
export function renderStatCard({ label, value, helper }) {
  return `
<article class="stat-card">
  <span class="card-meta">${label}</span>
  <strong class="stat-value">${value}</strong>
  <p class="card-copy">${helper}</p>
</article>`.trim();
}
