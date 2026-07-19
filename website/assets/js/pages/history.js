import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getVideos } from "../api.js";

/**
 * Renders the history page.
 * @returns {string}
 */
export function render() {
  const hasVideos = getVideos().length > 0;

  return `
    <section class="page-view" aria-labelledby="history-title">
      ${renderPageHeader({
        eyebrow: "History",
        title: "History",
        description: "Your recently watched videos will appear here.",
      })}

      <section class="panel">
        ${renderSectionHeader({ title: "Recently watched" })}
        ${hasVideos
          ? renderEmptyState({
              title: "No history yet",
              message: "Videos you watch will be recorded here.",
            })
          : renderEmptyState({
              title: "Library not loaded",
              message: "Load your videos.json manifest to begin tracking history.",
            })}
      </section>
    </section>
  `;
}
