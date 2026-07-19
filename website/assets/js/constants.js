/**
 * Shared route and navigation constants for the frontend scaffold.
 * Future phases can extend these objects without changing component contracts.
 */
export const ROUTES = Object.freeze({
  HOME: "/",
  SUBJECT: "/subject",
  PLAYER: "/player",
  FAVORITES: "/favorites",
  HISTORY: "/history",
  SETTINGS: "/settings",
  SEARCH: "/search",
});

export const NAV_ITEMS = Object.freeze([
  {
    label: "Library",
    route: ROUTES.HOME,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 8h10M7 12h10M7 16h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
  {
    label: "Subject",
    route: ROUTES.SUBJECT,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 7h8M8 11h8M8 15h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
  {
    label: "Player",
    route: ROUTES.PLAYER,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  },
  {
    label: "Favorites",
    route: ROUTES.FAVORITES,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.5l-5.5 3 1.5-6.5L3 9.5l6.8-1L12 3l2.2 5.5 6.8 1-5 4.5 1.5 6.5z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  },
  {
    label: "History",
    route: ROUTES.HISTORY,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
  {
    label: "Settings",
    route: ROUTES.SETTINGS,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 1-2.1-.7 1.7 1.7 0 0 0-2.8 0 1.7 1.7 0 0 1-2.1.7 1.7 1.7 0 0 0-1.9.3l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 1-.7-2.1 1.7 1.7 0 0 0 0-2.8 1.7 1.7 0 0 1 .7-2.1 1.7 1.7 0 0 0 .3-1.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 1 2.1-.7 1.7 1.7 0 0 0 2.8 0 1.7 1.7 0 0 1 2.1.7h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 1 .7 2.1 1.7 1.7 0 0 0 0 2.8 1.7 1.7 0 0 1-.7 2.1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
  {
    label: "Search",
    route: ROUTES.SEARCH,
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16.5 16.5l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
]);

export const APP_NAME = "Offline Study Library";
