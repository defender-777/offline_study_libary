/**
 * Adds an event listener and returns a cleanup function.
 * @param {EventTarget} target
 * @param {string} type
 * @param {EventListener} listener
 * @param {AddEventListenerOptions} [options]
 * @returns {() => void}
 */
export function on(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener, options);
}
