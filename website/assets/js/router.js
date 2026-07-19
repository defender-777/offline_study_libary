import { ROUTES, APP_NAME } from "./constants.js";
import { getState } from "./state.js";
import { getSubjectBySlug, getVideoById } from "./api.js";
import { render as renderHome } from "./pages/home.js";
import { render as renderSubject } from "./pages/subject.js";
import { render as renderPlayer, mountPlayerView, cleanupPlayerView } from "./pages/player.js";
import { render as renderFavorites } from "./pages/favorites.js";
import { render as renderHistory } from "./pages/history.js";
import { render as renderSettings } from "./pages/settings.js";
import { render as renderSearch, mountSearchView, cleanupSearchView } from "./pages/search.js";
import { renderLoading } from "./components/loading.js";

const routeRenderers = new Map([
  [ROUTES.HOME, renderHome],
  [ROUTES.SUBJECT, renderSubject],
  [ROUTES.PLAYER, renderPlayer],
  [ROUTES.FAVORITES, renderFavorites],
  [ROUTES.HISTORY, renderHistory],
  [ROUTES.SETTINGS, renderSettings],
  [ROUTES.SEARCH, renderSearch],
]);

const routeLabels = new Map([
  [ROUTES.HOME, APP_NAME],
  [ROUTES.SUBJECT, "Subjects"],
  [ROUTES.PLAYER, "Player"],
  [ROUTES.FAVORITES, "Favorites"],
  [ROUTES.HISTORY, "History"],
  [ROUTES.SETTINGS, "Settings"],
  [ROUTES.SEARCH, "Search"],
]);

const PARAM_REGEX = {
  subject: /^\/subject\/([^/]+)$/,
  player: /^\/player\/([^/]+)$/,
};

/**
 * Normalizes hash-based routes into supported application routes.
 * @returns {{route:string, params:Record<string,string>}}
 */
export function parseRoute() {
  const raw = window.location.hash.replace(/^#/, "") || ROUTES.HOME;

  if (raw === ROUTES.HOME) {
    return { route: ROUTES.HOME, params: {} };
  }

  if (PARAM_REGEX.subject.test(raw)) {
    return {
      route: ROUTES.SUBJECT,
      params: { subjectSlug: decodeURIComponent(raw.match(PARAM_REGEX.subject)[1]) },
    };
  }

  if (PARAM_REGEX.player.test(raw)) {
    return {
      route: ROUTES.PLAYER,
      params: { videoId: decodeURIComponent(raw.match(PARAM_REGEX.player)[1]) },
    };
  }

  if (routeRenderers.has(raw)) {
    return { route: raw, params: {} };
  }

  return { route: "404", params: {} };
}

/**
 * Returns the current effective route.
 * @returns {string}
 */
export function getCurrentRoute() {
  return parseRoute().route;
}

export function getRouteMeta() {
  const { route, params } = parseRoute();
  const { library, loading } = getState();
  const pageLabel = routeLabels.get(route) || APP_NAME;

  if (route === ROUTES.HOME) {
    return { pageLabel: APP_NAME, breadcrumbs: [{ label: APP_NAME }] };
  }

  if (route === ROUTES.SUBJECT) {
    const subjectSlug = params.subjectSlug || null;

    if (!subjectSlug || loading || !library) {
      return {
        pageLabel: "Subjects",
        breadcrumbs: [
          { label: APP_NAME, route: ROUTES.HOME },
          { label: "Subjects" },
        ],
      };
    }

    const subject = getSubjectBySlug(subjectSlug);

    return {
      pageLabel: subject ? subject.name : "Subject not found",
      breadcrumbs: [
        { label: APP_NAME, route: ROUTES.HOME },
        { label: "Subjects", route: ROUTES.SUBJECT },
        { label: subject ? subject.name : "Not found" },
      ],
    };
  }

  if (route === ROUTES.PLAYER) {
    const videoId = params.videoId || null;

    if (loading || !library) {
      return {
        pageLabel: "Player",
        breadcrumbs: [
          { label: APP_NAME, route: ROUTES.HOME },
          { label: "Player" },
        ],
      };
    }

    if (!videoId) {
      return {
        pageLabel: "Player",
        breadcrumbs: [
          { label: APP_NAME, route: ROUTES.HOME },
          { label: "Player" },
        ],
      };
    }

    const video = getVideoById(videoId);

    return {
      pageLabel: video ? video.title : "Video not found",
      breadcrumbs: [
        { label: APP_NAME, route: ROUTES.HOME },
        { label: "Player", route: ROUTES.PLAYER },
        { label: video ? video.title : "Not found" },
      ],
    };
  }

  if (route === "404") {
    return {
      pageLabel: "Page not found",
      breadcrumbs: [
        { label: APP_NAME, route: ROUTES.HOME },
        { label: "Page not found" },
      ],
    };
  }

  return {
    pageLabel,
    breadcrumbs: [
      { label: APP_NAME, route: ROUTES.HOME },
      { label: pageLabel },
    ],
  };
}

/**
 * Navigates to a route by updating the location hash.
 * @param {string} route
 */
export function navigate(route) {
  window.location.hash = route;
}

/**
 * Renders the current route into a target container.
 * @param {HTMLElement} target
 * @returns {string}
 */
export function renderRoute(target) {
  const { loading, error } = getState();
  const { route, params } = parseRoute();
  const renderer = routeRenderers.get(route) || null;

  if (loading) {
    target.innerHTML = renderLoading();
    target.focus({ preventScroll: true });
    return route;
  }

  if (error) {
    cleanupPlayerView();
    cleanupSearchView();
    target.innerHTML = `
      <section class="page-view page-error">
        <div class="panel">
          <h2>Unable to load library</h2>
          <p>${error}</p>
        </div>
      </section>
    `;
    target.focus({ preventScroll: true });
    return route;
  }

  cleanupPlayerView();
  cleanupSearchView();

  if (!renderer) {
    target.innerHTML = `
      <section class="page-view page-error">
        <div class="panel">
          <h2>Page not found</h2>
          <p>The page you requested does not exist.</p>
        </div>
      </section>
    `;
    target.focus({ preventScroll: true });
    return route;
  }

  target.innerHTML = renderer(params);
  target.focus({ preventScroll: true });

  if (route === ROUTES.PLAYER) {
    mountPlayerView(target);
  }

  if (route === ROUTES.SEARCH) {
    mountSearchView(target);
  }

  return route;
}
