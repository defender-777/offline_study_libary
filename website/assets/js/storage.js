const FAVORITES_KEY = "offline-study:favorites";
const HISTORY_KEY = "offline-study:history";
const SETTINGS_KEY = "offline-study:settings";

/**
 * Reads JSON from localStorage with a fallback.
 * TODO: Add schema validation before using persisted values in features.
 * @param {string} key
 * @param {unknown} fallback
 * @returns {unknown}
 */
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Writes JSON to localStorage.
 * TODO: Surface quota and privacy errors through the toast system.
 * @param {string} key
 * @param {unknown} value
 */
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadFavorites = () => readJson(FAVORITES_KEY, []);
export const saveFavorites = (favorites) => writeJson(FAVORITES_KEY, favorites);
export const loadHistory = () => readJson(HISTORY_KEY, []);
export const saveHistory = (history) => writeJson(HISTORY_KEY, history);
export const loadSettings = () => readJson(SETTINGS_KEY, {});
export const saveSettings = (settings) => writeJson(SETTINGS_KEY, settings);
