/**
 * Renders a reusable page-level header with title and description.
 * @param {{eyebrow: string, title: string, description: string, action?: string}} options
 * @returns {string}
 */
export function renderPageHeader({ eyebrow, title, description, action }) {
  return `
  <div class="page-header">
    <div>
      <span class="eyebrow">${eyebrow}</span>
      <h2 class="page-title">${title}</h2>
      <p class="page-copy">${description}</p>
    </div>
    ${action ? `<div class="page-header-action">${action}</div>` : ""}
  </div>
  `;
}
