import { ROUTES } from "../constants.js";
import { getState, setState } from "../state.js";
import { on } from "../utils/events.js";
import { debounce } from "../utils/debounce.js";
import { getVideos, getThumbnailUrl, getDurationLabel, getResolutionLabel } from "../api.js";
import { renderPageHeader } from "../components/page-header.js";
import { renderSearchBox } from "../components/search-box.js";
import { renderToolbar } from "../components/toolbar.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import {
  getDiscoveryResults,
  getDiscoverySummary,
  getFilterOptions,
  getSortOptions,
  updateFilter,
  updateSort,
  setSelectedIndex,
  resetSelectedIndex,
  recordSearchQuery,
  getSelectedFilters,
  getSortState,
  getSearchHistory,
  clearSearch,
  getFilterLabelForKey,
  getDiscoveryState,
} from "../services/discovery.js";
import { navigate } from "../router.js";

let searchContext = null;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFilterOptions(options, selected) {
  return options
    .map((option) => `<option value="${escapeHtml(option)}"${option === selected ? " selected" : ""}>${escapeHtml(option)}</option>`)
    .join("");
}

function renderFilterRow(filters, filterOptions) {
  return `
    <div class="search-toolbar__fields">
      <label class="form-field">
        <span class="control-label">Subject</span>
        <select id="search-filter-subject">${renderFilterOptions(filterOptions.subjects, filters.subject)}</select>
      </label>
      <label class="form-field">
        <span class="control-label">Resolution</span>
        <select id="search-filter-resolution">${renderFilterOptions(filterOptions.resolutions, filters.resolution)}</select>
      </label>
      <label class="form-field">
        <span class="control-label">Duration</span>
        <select id="search-filter-duration">${renderFilterOptions(filterOptions.durations, filters.duration)}</select>
      </label>
      <label class="form-field">
        <span class="control-label">File type</span>
        <select id="search-filter-fileType">${renderFilterOptions(filterOptions.fileTypes, filters.fileType)}</select>
      </label>
    </div>
  `;
}

function renderSortRow(sortOptions, sortState) {
  return `
    <div class="search-toolbar__sort">
      <label class="form-field">
        <span class="control-label">Sort by</span>
        <select id="search-sort-by">
          ${sortOptions
            .map((option) => `<option value="${escapeHtml(option.value)}"${option.value === sortState.by ? " selected" : ""}>${escapeHtml(option.label)}</option>`)
            .join("")}
        </select>
      </label>
      <label class="form-field">
        <span class="control-label">Order</span>
        <select id="search-sort-order">
          <option value="desc"${sortState.order === "desc" ? " selected" : ""}>Descending</option>
          <option value="asc"${sortState.order === "asc" ? " selected" : ""}>Ascending</option>
        </select>
      </label>
    </div>
  `;
}

function renderActiveFilters(filters) {
  const active = Object.entries(filters).filter(([, value]) => value && value !== "All");
  if (!active.length) {
    return `<span class="search-summary__filter-pill">All filters</span>`;
  }

  return active
    .map(([key, value]) => `<span class="search-summary__filter-pill">${escapeHtml(getFilterLabelForKey(key))}: ${escapeHtml(value)}</span>`)
    .join("");
}

function renderSearchHistory(history) {
  if (!history.length) {
    return "";
  }

  return `
    <div class="search-history">
      <h3>Recent searches</h3>
      <div class="search-history__chips">
        ${history.map((entry) => `<button type="button" class="chip" data-search-history="${escapeHtml(entry)}">${escapeHtml(entry)}</button>`).join("")}
      </div>
    </div>
  `;
}

export function mountSearchView(container) {
  if (!container) {
    return;
  }

  const input = container.querySelector("#search-query-input");
  const subjectSelect = container.querySelector("#search-filter-subject");
  const resolutionSelect = container.querySelector("#search-filter-resolution");
  const durationSelect = container.querySelector("#search-filter-duration");
  const fileTypeSelect = container.querySelector("#search-filter-fileType");
  const sortBySelect = container.querySelector("#search-sort-by");
  const sortOrderSelect = container.querySelector("#search-sort-order");
  const clearButton = container.querySelector("[data-search-clear]");
  const historyContainer = container.querySelector(".search-history__chips");

  const cleanup = [];
  const state = getDiscoveryState();

  const searchHandler = debounce((value) => {
    setState({ searchQuery: String(value || "") });
    if (String(value || "").trim()) {
      recordSearchQuery(value);
    }
    resetSelectedIndex();
  }, 200);

  const handleInput = (event) => {
    searchHandler(event.target.value);
  };

  const handleFilterChange = (event) => {
    const target = event.target;
    const filterKey = target.id.replace("search-filter-", "");
    updateFilter(filterKey, target.value);
  };

  const handleSortChange = () => {
    updateSort(sortBySelect.value, sortOrderSelect.value);
  };

  const handleClearSearch = () => {
    clearSearch();
    resetSelectedIndex();
    updateFilter("subject", "All");
    updateFilter("resolution", "All");
    updateFilter("duration", "All");
    updateFilter("fileType", "All");
    if (input) {
      input.value = "";
      input.focus();
    }
  };

  const handleGlobalKeyDown = (event) => {
    if (event.key === "/") {
      if (document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleClearSearch();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = Math.min((getDiscoveryState().selectedIndex || 0) + 1, getDiscoveryResults(getVideos(), getState().searchQuery).length - 1);
      setSelectedIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = Math.max((getDiscoveryState().selectedIndex || 0) - 1, 0);
      setSelectedIndex(prevIndex);
      return;
    }

    if (event.key === "Enter" && document.activeElement === input) {
      const results = getDiscoveryResults(getVideos(), getState().searchQuery);
      const selectedIndex = getDiscoveryState().selectedIndex || 0;
      if (results[selectedIndex]) {
        event.preventDefault();
        navigate(`${ROUTES.PLAYER}/${encodeURIComponent(results[selectedIndex].video.id)}`);
      }
    }
  };

  if (input) {
    cleanup.push(on(input, "input", handleInput));
    cleanup.push(on(input, "keydown", (event) => event.stopPropagation()));
  }

  if (subjectSelect) {
    cleanup.push(on(subjectSelect, "change", handleFilterChange));
  }
  if (resolutionSelect) {
    cleanup.push(on(resolutionSelect, "change", handleFilterChange));
  }
  if (durationSelect) {
    cleanup.push(on(durationSelect, "change", handleFilterChange));
  }
  if (fileTypeSelect) {
    cleanup.push(on(fileTypeSelect, "change", handleFilterChange));
  }
  if (sortBySelect) {
    cleanup.push(on(sortBySelect, "change", handleSortChange));
  }
  if (sortOrderSelect) {
    cleanup.push(on(sortOrderSelect, "change", handleSortChange));
  }
  if (clearButton) {
    cleanup.push(on(clearButton, "click", handleClearSearch));
  }
  if (historyContainer) {
    cleanup.push(on(historyContainer, "click", (event) => {
      const button = event.target.closest("[data-search-history]");
      if (!button) {
        return;
      }
      const query = button.dataset.searchHistory;
      if (query) {
        setState({ searchQuery: query });
        resetSelectedIndex();
      }
    }));
  }

  cleanup.push(on(window, "keydown", handleGlobalKeyDown));
  searchContext = cleanup;

  if (input) {
    input.focus({ preventScroll: true });

    const end = String(input.value || "").length;
    try {
      input.setSelectionRange(end, end);
    } catch {
      // Some browsers may restrict selection APIs on search inputs.
      // Falling back to focus alone still preserves typing behavior.
    }
  }
}

export function cleanupSearchView() {
  if (!searchContext) {
    return;
  }

  searchContext.forEach((dispose) => dispose());
  searchContext = null;
}

export function render() {
  const { searchQuery } = getState();
  const videos = getVideos();
  const filterOptions = getFilterOptions(videos);
  const sortOptions = getSortOptions();
  const filters = getSelectedFilters();
  const sortState = getSortState();
  const results = getDiscoveryResults(videos, searchQuery);
  const summary = getDiscoverySummary(videos, searchQuery);
  const history = getSearchHistory();

  return `
    <section class="page-view" aria-labelledby="search-title">
      ${renderPageHeader({
        eyebrow: "Search",
        title: "Find videos with instant discovery.",
        description: "Search across title, subject, filename, description, and tags with fuzzy matching.",
      })}

      <section class="panel search-toolbar-panel">
        ${renderToolbar({
          content: `
            ${renderSearchBox({
              id: "search-query-input",
              placeholder: "Search videos, subjects, titles…",
              value: searchQuery,
              ariaLabel: "Library search",
            })}
            ${renderFilterRow(filters, filterOptions)}
            ${renderSortRow(sortOptions, sortState)}
            <div class="search-toolbar__actions">
              <button type="button" class="button button-secondary" data-search-clear>Clear search</button>
            </div>
          `,
        })}
      </section>

      <section class="panel search-summary-panel">
        <div class="search-summary-grid">
          <div>
            <p class="eyebrow">Library</p>
            <strong>${summary.totalVideos} Videos</strong>
          </div>
          <div>
            <p class="eyebrow">Subjects</p>
            <strong>${summary.totalSubjects} Subjects</strong>
          </div>
          <div>
            <p class="eyebrow">Results</p>
            <strong>${summary.filteredVideos} matching videos</strong>
          </div>
          <div>
            <p class="eyebrow">Sort</p>
            <strong>${summary.sortLabel} · ${summary.sortOrder}</strong>
          </div>
        </div>
        <div class="search-summary-filters" aria-live="polite">
          ${renderActiveFilters(filters)}
        </div>
      </section>

      ${!searchQuery ? renderSearchHistory(history) : ""}

      <section class="panel">
        ${results.length
          ? `
            <div class="card-grid" id="search-results">
              ${results
                .map((entry, index) => renderVideoCard({
                  title: entry.video.title,
                  titleHtml: entry.highlight.title,
                  subject: entry.video.subject,
                  subjectHtml: entry.highlight.subject,
                  duration: getDurationLabel(entry.video),
                  resolution: getResolutionLabel(entry.video),
                  thumbnail: getThumbnailUrl(entry.video),
                  descriptionHtml: entry.highlight.description,
                  videoId: entry.video.id,
                  selected: index === summary.selectedIndex,
                }))
                .join("")}
            </div>
          `
          : renderEmptyState({
              title: "No matching videos found",
              message: "Try clearing filters, changing the query, or returning to the library.",
              action: `<a href="#${ROUTES.HOME}">Return to library</a>`,
            })}
      </section>
    </section>
  `;
}
