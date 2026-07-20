import { renderRoute, parseRoute, getRouteMeta, navigate } from "./router.js";
import { ROUTES, APP_NAME } from "./constants.js";
import { setState, subscribe, getState } from "./state.js";
import { renderSidebar, mountSidebar, initSidebar } from "./components/sidebar.js";
import { renderHeader, mountHeader } from "./components/header.js";
import { renderToastRegion } from "./components/toast.js";
import { renderModalRegion } from "./components/modal.js";
import { requiredElement } from "./utils/dom.js";
import { on } from "./utils/events.js";
import { loadLibrary } from "./api.js";
import { loadFavorites, saveFavorites } from "./storage.js";

const sidebar = requiredElement("#app-sidebar");
const header = requiredElement("#app-header");
const main = requiredElement("#app-main");
const toast = requiredElement("#app-toast");
const modal = requiredElement("#app-modal");

let lastSavedFavoritesSignature = "[]";

function normalizeFavoriteIds(favorites) {
  if (!Array.isArray(favorites)) {
    return [];
  }

  const seen = new Set();

  return favorites
    .map((favorite) => {
      if (favorite && typeof favorite === "object" && favorite.id != null) {
        return String(favorite.id);
      }

      return favorite == null ? "" : String(favorite);
    })
    .filter((favoriteId) => {
      if (!favoriteId) {
        return false;
      }

      if (seen.has(favoriteId)) {
        return false;
      }

      seen.add(favoriteId);
      return true;
    });
}

function toggleFavorite(videoId) {
  if (!videoId) {
    return;
  }

  const currentFavorites = normalizeFavoriteIds(getState().favorites);
  const favoriteId = String(videoId);
  const nextFavorites = currentFavorites.includes(favoriteId)
    ? currentFavorites.filter((id) => id !== favoriteId)
    : [...currentFavorites, favoriteId];

  setState({ favorites: nextFavorites });
}

/**
 * Renders application chrome and current route placeholder.
 */
function renderApp() {
  sidebar.innerHTML = renderSidebar();
  mountSidebar(sidebar);
  header.innerHTML = renderHeader();
  mountHeader(header);
  renderRoute(main);
  setDocumentTitle();
}

function setDocumentTitle() {
  const { pageLabel } = getRouteMeta();
  document.title = pageLabel && pageLabel !== APP_NAME
    ? `${pageLabel} | ${APP_NAME}`
    : APP_NAME;
}

function handleMainClick(event) {
  const favoriteButton = event.target.closest("[data-favorite-toggle]");
  if (favoriteButton) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(favoriteButton.dataset.videoId);
    return;
  }

  const card = event.target.closest(".video-card");
  if (!card || !card.dataset.videoId) {
    return;
  }

  const videoId = card.dataset.videoId;
  navigate(`${ROUTES.PLAYER}/${encodeURIComponent(videoId)}`);
}

/**
 * Initializes local-only scaffold state and event listeners.
 */
async function init() {
  // Apply persisted sidebar state before first render
  initSidebar();

  const persistedFavorites = normalizeFavoriteIds(loadFavorites());
  lastSavedFavoritesSignature = JSON.stringify(persistedFavorites);

  setState({
    loading: true,
    error: null,
    favorites: persistedFavorites,
    history: [],
    settings: {},
  });

  toast.innerHTML = renderToastRegion();
  modal.innerHTML = renderModalRegion();

  const updateRouteState = () => {
    const { route, params } = parseRoute();
    setState({
      currentPage: route,
      selectedSubject: params.subjectSlug || null,
      selectedVideo: params.videoId || null,
    });
  };

  updateRouteState();

  subscribe(() => {
    const favoriteIds = normalizeFavoriteIds(getState().favorites);
    const signature = JSON.stringify(favoriteIds);
    if (signature !== lastSavedFavoritesSignature) {
      saveFavorites(favoriteIds);
      lastSavedFavoritesSignature = signature;
    }

    renderApp();
  });

  renderApp();
  on(main, "click", handleMainClick);

  try {
    const library = await loadLibrary();
    setState({ library, loading: false });
  } catch (error) {
    setState({
      library: null,
      loading: false,
      error: error instanceof Error ? error.message : "Unable to load library.",
    });
  }

  on(window, "hashchange", () => {
    const { route, params } = parseRoute();
    const state = getState();

    if (
      state.currentPage !== route ||
      state.selectedSubject !== (params.subjectSlug || null) ||
      state.selectedVideo !== (params.videoId || null)
    ) {
      setState({
        currentPage: route,
        selectedSubject: params.subjectSlug || null,
        selectedVideo: params.videoId || null,
      });
    }
  });
}

init();
