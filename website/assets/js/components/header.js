import { APP_NAME } from "../constants.js";
import { getState } from "../state.js";
import { renderBreadcrumb } from "./breadcrumb.js";
import { renderSearchBox } from "./search-box.js";
import { renderActionButton } from "./action-button.js";
import { getRouteMeta } from "../router.js";

/**
 * Renders the top application header.
 * @returns {string}
 */
export function renderHeader() {
  const { loading } = getState();
  const { pageLabel, breadcrumbs } = getRouteMeta();
  const contextLabel = loading ? "Preparing library" : "Library ready";

  return `
    <div class="header-inner">
      <div class="header-stack">
        ${renderBreadcrumb({ items: breadcrumbs })}
        <div class="header-context">
          <span class="eyebrow">${contextLabel}</span>
          <h1 class="header-title">${pageLabel}</h1>
        </div>
      </div>
      <div class="header-actions" aria-label="Global actions">
        <div class="header-search">${renderSearchBox({ id: "global-library-search", placeholder: "Search videos, subjects, files", ariaLabel: "Global library search" })}</div>
        <div class="header-controls">
          ${renderActionButton({ icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`, label: "Notifications" })}
          ${renderActionButton({ icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 12h-4V8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, label: "Theme" })}
          ${renderActionButton({ icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19 12h2M3 12H1M12 5V3M12 21v-2M16.95 7.05l1.41-1.41M5.64 18.36l-1.41 1.41M7.05 7.05L5.64 5.64M18.36 18.36l1.41 1.41" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, label: "Theme settings" })}
        </div>
      </div>
    </div>
  `;
}
