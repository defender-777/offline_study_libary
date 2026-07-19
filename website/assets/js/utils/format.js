/**
 * Formats a count for quiet placeholder UI copy.
 * @param {number} value
 * @param {string} noun
 * @returns {string}
 */
export function formatCount(value, noun) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}
