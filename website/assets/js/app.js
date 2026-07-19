import { renderRoute, parseRoute, getRouteMeta, navigate } from "./router.js";
import { ROUTES, APP_NAME } from "./constants.js";
import { setState, subscribe, getState } from "./state.js";
import { renderSidebar } from "./components/sidebar.js";
import { renderHeader } from "./components/header.js";
import { renderToastRegion } from "./components/toast.js";
import { renderModalRegion } from "./components/modal.js";
import { requiredElement } from "./utils/dom.js";
import { on } from "./utils/events.js";
import { loadLibrary } from "./api.js";

const sidebar = requiredElement("#app-sidebar");
const header = requiredElement("#app-header");
const main = requiredElement("#app-main");
const toast = requiredElement("#app-toast");
const modal = requiredElement("#app-modal");

/**
 * Renders application chrome and current route placeholder.
 */
function renderApp() {
  sidebar.innerHTML = renderSidebar();
  header.innerHTML = renderHeader();
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
  setState({
    loading: true,
    error: null,
    favorites: [],
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
