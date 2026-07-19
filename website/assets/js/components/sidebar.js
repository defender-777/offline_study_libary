import { APP_NAME, NAV_ITEMS, ROUTES } from "../constants.js";
import { getState } from "../state.js";
import { getSubjects, getSubjectSlug } from "../api.js";

const STORAGE_KEY = "sidebar-expanded";

/** Read persisted sidebar state. Returns true if expanded. */
function getSidebarExpanded() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persist sidebar state. */
function setSidebarExpanded(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
  document.documentElement.dataset.sidebarExpanded = String(value);
}

/** Initialise sidebar state from localStorage on first load. */
export function initSidebar() {
  document.documentElement.dataset.sidebarExpanded = String(getSidebarExpanded());
}

/** Toggle sidebar expanded/collapsed. */
export function toggleSidebar() {
  const current = document.documentElement.dataset.sidebarExpanded === "true";
  setSidebarExpanded(!current);
}

/**
 * Renders the application sidebar.
 * @returns {string}
 */
export function renderSidebar() {
  const { currentPage, selectedSubject } = getState();
  const subjects = getSubjects();

  const navLinks = NAV_ITEMS.map((item) => {
    const isCurrent = item.route === currentPage;
    const current = isCurrent ? ' aria-current="page"' : "";
    return `
      <li>
        <a class="nav-link" href="#${item.route}"${current} data-tooltip="${item.label}">
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      </li>
    `;
  }).join("");

  const subjectLinks = subjects.length
    ? subjects.map((subject) => {
        const subjectSlug = getSubjectSlug(subject);
        const isCurrent = selectedSubject === subjectSlug;
        const current = isCurrent ? ' aria-current="page"' : "";
        return `
          <li>
            <a class="nav-link nav-link--nested" href="#${ROUTES.SUBJECT}/${subjectSlug}"${current}>
              <span class="nav-label">${subject.name}</span>
            </a>
          </li>
        `;
      }).join("")
    : "";

  return `
    <button
      class="sidebar-toggle"
      type="button"
      aria-label="Toggle navigation"
      data-sidebar-toggle
    >
      <svg class="sidebar-toggle__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="4"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="8"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="12" width="14" height="1.5" rx="0.75" fill="currentColor"/>
      </svg>
    </button>

    <nav class="sidebar-nav" aria-label="Primary navigation">
      <ul class="nav-list" role="list">
        ${navLinks}
      </ul>

      ${subjectLinks ? `
        <details class="sidebar-section" open>
          <summary class="sidebar-section__title">Subjects</summary>
          <ul class="nav-list nav-list--nested" role="list">
            ${subjectLinks}
          </ul>
        </details>
      ` : ""}
    </nav>

    <div class="sidebar-status" role="status" aria-live="polite" aria-atomic="true">
      ${subjects.length
        ? `${subjects.length} subject${subjects.length !== 1 ? "s" : ""} · ${getState().library?.total_videos ?? 0} videos`
        : "Loading library…"}
    </div>
  `;
}

/**
 * Mounts the sidebar toggle button click handler.
 * Must be called after renderSidebar() has populated the DOM.
 * @param {HTMLElement} sidebarEl
 */
export function mountSidebar(sidebarEl) {
  const toggleBtn = sidebarEl.querySelector("[data-sidebar-toggle]");
  if (!toggleBtn) {
    return;
  }

  // Replace to avoid stacking listeners
  const handler = () => toggleSidebar();
  toggleBtn.addEventListener("click", handler);
}
