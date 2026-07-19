/**
 * Renders a placeholder subject card for Phase 4.2.
 * @param {{title:string, subtitle:string, count:number, accent:string}} props
 * @returns {string}
 */
export function renderSubjectCard({ title, subtitle, count, accent }) {
  return `
  <article class="subject-card">
    <div class="subject-card__stripe" style="background: linear-gradient(180deg, ${accent} 0%, rgba(255,255,255,0.10) 100%);"></div>
    <div class="subject-card__content">
      <h4>${title}</h4>
      <p>${subtitle}</p>
      <span class="badge badge-pill">${count} videos</span>
    </div>
  </article>
  `;
}
