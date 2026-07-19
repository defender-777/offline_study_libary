/**
 * Creates a debounced function wrapper for future interactive controls.
 * @param {Function} callback
 * @param {number} delay
 * @returns {(...args: Array<unknown>) => void}
 */
export function debounce(callback, delay = 180) {
  let timerId;
  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => callback(...args), delay);
  };
}
