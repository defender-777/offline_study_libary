/**
 * Renders an empty state panel for vacant feature views.
 * @param {{title:string,message:string,action?:string}} props
 * @returns {string}
 */
export function renderEmptyState({ title, message, action = "" }) {
  return `
  <section class="empty-state" role="status" aria-live="polite">
    <div class="empty-state__art" aria-hidden="true">
      <span>☆</span>
    </div>
    <div class="empty-state__content">
      <h3>${title}</h3>
      <p>${message}</p>
      ${action ? `<div class="empty-state__action">${action}</div>` : ""}
    </div>
  </section>
  `;
}
