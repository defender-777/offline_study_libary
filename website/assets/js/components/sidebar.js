import { APP_NAME, NAV_ITEMS, ROUTES } from "../constants.js";
import { getState } from "../state.js";
import { getSubjects, getSubjectSlug } from "../api.js";

/**
 * Renders the persistent application sidebar.
 * @returns {string}
 */
export function renderSidebar() {
  const { currentPage, selectedSubject } = getState();
  const subjects = getSubjects();
  const links = NAV_ITEMS.map((item) => {
    const current = item.route === currentPage ? ' aria-current="page"' : "";
    return `
      <li>
        <a class="nav-link" href="#${item.route}"${current}>
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      </li>
    `;
  }).join("");

  const subjectLinks = subjects.length
    ? subjects.map((subject) => {
        const subjectSlug = getSubjectSlug(subject);
        const current = selectedSubject === subjectSlug ? ' aria-current="page"' : "";
        return `
          <li>
            <a class="nav-link nav-link--nested" href="#${ROUTES.SUBJECT}/${subjectSlug}"${current}>
              ${subject.name}
            </a>
          </li>
        `;
      }).join("")
    : "";

  return `
    <div class="sidebar-inner" data-sidebar="default">
      <div class="brand-lockup">
        <strong class="brand-title">${APP_NAME}</strong>
        <span class="brand-subtitle">Offline study library</span>
      </div>
      <nav aria-label="Primary">
        <ul class="nav-list">${links}</ul>
        ${subjectLinks ? `
          <details class="sidebar-section" open>
            <summary class="sidebar-section__title">Subjects</summary>
            <ul class="nav-list nav-list--nested">${subjectLinks}</ul>
          </details>
        ` : ""}
      </nav>
      <div class="sidebar-status" role="status" aria-live="polite">
        <strong>Ready</strong> · Visual shell active
      </div>
    </div>
  `;
}
