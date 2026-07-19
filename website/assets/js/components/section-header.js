/**
 * Renders a reusable section header with optional trailing action.
 * @param {{title: string, subtitle?: string, action?: string}} options
 * @returns {string}
 */
export function renderSectionHeader({ title, subtitle = "", action = "" }) {
  return `
  <div class="section-header">
    <div>
      <h3>${title}</h3>
      ${subtitle ? `<p class="section-copy">${subtitle}</p>` : ""}
    </div>
    ${action ? `<div class="section-action">${action}</div>` : ""}
  </div>
  `;
}
