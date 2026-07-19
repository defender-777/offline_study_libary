/**
 * Creates accessible loading markup for future async views.
 * @param {string} message
 * @returns {string}
 */
export function renderLoading(message = "Loading study library") {
  return `<div class="panel" role="status" aria-live="polite">${message}</div>`;
}
