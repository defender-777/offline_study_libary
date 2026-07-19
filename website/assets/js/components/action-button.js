/**
 * Renders a reusable icon action button.
 * @param {{icon:string,label:string,badge?:string}} props
 * @returns {string}
 */
export function renderActionButton({ icon, label, badge = "" }) {
  return `
  <button class="action-button" type="button" aria-label="${label}">
    <span class="action-button__icon">${icon}</span>
    ${badge ? `<span class="action-button__badge">${badge}</span>` : ""}
  </button>
  `;
}
