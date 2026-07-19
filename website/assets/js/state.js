import { ROUTES } from "./constants.js";

/**
 * Central application state shape for Phase 4.1.
 * Keep this structure stable so later feature phases have predictable anchors.
 */
export const AppState = {
  library: null,
  currentPage: ROUTES.HOME,
  selectedSubject: null,
  selectedVideo: null,
  searchQuery: "",
  favorites: [],
  history: [],
  continueWatching: [],
  settings: {},
  loading: false,
  error: null,
};

const listeners = new Set();

/**
 * Returns a read-only snapshot reference for current state consumers.
 * @returns {typeof AppState}
 */
export function getState() {
  return AppState;
}

/**
 * Applies a shallow state patch and notifies subscribers.
 * @param {Partial<typeof AppState>} patch
 * @returns {typeof AppState}
 */
export function setState(patch) {
  Object.assign(AppState, patch);
  listeners.forEach((listener) => listener(AppState));
  return AppState;
}

/**
 * Subscribes to state updates.
 * @param {(state: typeof AppState) => void} listener
 * @returns {() => void}
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
