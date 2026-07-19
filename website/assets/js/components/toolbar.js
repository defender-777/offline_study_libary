/**
 * Renders a toolbar with optional action placeholders.
 * @param {{content:string}} props
 * @returns {string}
 */
export function renderToolbar({ content }) {
  return `
  <div class="toolbar">
    ${content}
  </div>
  `;
}
