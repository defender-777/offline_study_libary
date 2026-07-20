import { APP_NAME, ROUTES } from "../constants.js";
import { getState, setState, AppState } from "../state.js";
import { renderBreadcrumb } from "./breadcrumb.js";
import { renderActionButton } from "./action-button.js";
import { getRouteMeta, navigate, renderRoute } from "../router.js";
import { toggleSidebar } from "./sidebar.js";

let _headerSearchCleanup = null;

/**
 * Attaches the global search input listener.
 * Called once after the header HTML is inserted into the DOM.
 * @param {HTMLElement} headerEl
 */
export function mountHeader(headerEl) {
  if (_headerSearchCleanup) {
    _headerSearchCleanup();
    _headerSearchCleanup = null;
  }

  const input = headerEl.querySelector("#global-library-search");
  const hamburger = headerEl.querySelector("[data-header-hamburger]");

  const handleInput = (event) => {
    const value = event.target.value;

    // ── Search input bug fix ─────────────────────────────────
    // Root cause: calling setState({ searchQuery }) notifies all subscribers,
    // which triggers renderApp() → header.innerHTML = renderHeader() → the
    // entire header is replaced with a new DOM node.  The old <input> is
    // destroyed mid-keystroke.  The new one is freshly rendered with the full
    // value, and type="search" inputs auto-select their content when first
    // focused — so the first character is always selected and the next
    // keystroke replaces it instead of appending.
    //
    // Fix: write searchQuery directly into AppState (silent, no subscriber
    // notification) and update only the main content area via renderRoute().
    // The header is NEVER re-rendered during active typing.
    // Full renderApp() continues to be triggered by all other state changes
    // (navigation, library load, etc.) where the input is not focused.
    AppState.searchQuery = value;

    const { currentPage } = getState();
    if (currentPage !== ROUTES.SEARCH) {
      // Navigate to search — this triggers a hashchange → setState →
      // renderApp() once.  At that point the input element is replaced but
      // immediately receives focus again because it is the same logical
      // element the user was interacting with.  After this single transition
      // all subsequent keystrokes stay on the search page and never trigger
      // a header re-render.
      navigate(ROUTES.SEARCH);
    } else {
      // Already on search page — update only the main content area.
      // The header keeps its existing DOM node; no cursor disruption.
      const main = document.getElementById("app-main");
      if (main) {
        renderRoute(main);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      input.value = "";
      // Escape is an intentional user action; a full re-render is acceptable.
      setState({ searchQuery: "" });
    }
  };

  const handleHamburger = () => toggleSidebar();

  const cleanups = [];

  if (input) {
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeyDown);
    cleanups.push(() => {
      input.removeEventListener("input", handleInput);
      input.removeEventListener("keydown", handleKeyDown);
    });
  }

  if (hamburger) {
    hamburger.addEventListener("click", handleHamburger);
    cleanups.push(() => hamburger.removeEventListener("click", handleHamburger));
  }

  _headerSearchCleanup = () => cleanups.forEach((fn) => fn());
}

/**
 * Renders the top application header.
 * @returns {string}
 */
export function renderHeader() {
  const { searchQuery } = getState();
  const { breadcrumbs } = getRouteMeta();
  const escapedQuery = String(searchQuery || "").replace(/"/g, "&quot;");

  // Settings icon SVG
  const settingsIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 1-2.51-1.44v-.09a1.65 1.65 0 0 0-1.1-1.55 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 12a1.65 1.65 0 0 1-1.44-2.51h.09A1.65 1.65 0 0 0 4.8 8.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9.12 4a1.65 1.65 0 0 1 2.51-1.44v.09a1.65 1.65 0 0 0 1.1 1.55 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 1 1.44 2.51h-.09a1.65 1.65 0 0 0-1.55 1.1z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  // Hamburger (mobile only)
  const hamburgerHtml = `
    <button class="header-hamburger" type="button" aria-label="Open navigation" data-header-hamburger>
      <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" width="18" height="18">
        <rect x="2" y="4"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="8"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="12" width="14" height="1.5" rx="0.75" fill="currentColor"/>
      </svg>
    </button>
  `;

  return `
    ${hamburgerHtml}

    <div class="header-breadcrumb">
      ${renderBreadcrumb({ items: breadcrumbs })}
    </div>

    <div class="header-spacer"></div>

    <div class="header-search">
      <div class="search-box">
        <label class="search-box__label" for="global-library-search">
          <span class="visually-hidden">Search videos, subjects, files</span>
          <input
            id="global-library-search"
            class="search-box__input"
            type="search"
            value="${escapedQuery}"
            placeholder="Search…"
            autocomplete="off"
            spellcheck="false"
            aria-label="Global library search"
          />
        </label>
      </div>
    </div>

    <div class="header-controls" role="toolbar" aria-label="Header controls">
      ${renderActionButton({
        icon: settingsIcon,
        label: "Settings",
      })}
    </div>
  `;
}
