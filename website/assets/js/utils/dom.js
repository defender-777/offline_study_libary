/**
 * Queries for a required element and throws if it is missing.
 * @param {string} selector
 * @param {ParentNode} root
 * @returns {HTMLElement}
 */
export function requiredElement(selector, root = document) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return element;
}

/**
 * Escapes unsafe text before inserting it into HTML strings.
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[match]);
}
