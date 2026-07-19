import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getVideos } from "../api.js";

/**
 * Renders the history page with a placeholder experience.
 * @returns {string}
 */
export function render() {
  const hasVideos = getVideos().length > 0;

  return `
    <section class="page-view" aria-labelledby="history-title">
      ${renderPageHeader({
        eyebrow: "History",
        title: "Track your study sessions and timeline.",
        description: "History will reflect actual viewing progress in later phases.",
      })}

      <section class="panel">
        ${renderSectionHeader({ title: "Recent activity" })}
        ${hasVideos
          ? renderEmptyState({
              title: "History is coming soon",
              message: "Your video library is loaded, but session history is not implemented yet.",
            })
          : renderEmptyState({
              title: "No library loaded",
              message: "Load your videos.json manifest to begin tracking history.",
            })}
      </section>
    </section>
  `;
}
