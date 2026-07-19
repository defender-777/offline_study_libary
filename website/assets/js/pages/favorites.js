import { renderPageHeader } from "../components/page-header.js";
import { renderEmptyState } from "../components/empty-state.js";

/**
 * Renders the favorites page with a beautiful empty state.
 * @returns {string}
 */
export function render() {
  return `
    <section class="page-view" aria-labelledby="favorites-title">
      ${renderPageHeader({
        eyebrow: "Favorites",
        title: "Favorites",
        description: "Videos you have marked as favorites will appear here.",
      })}
      ${renderEmptyState({
        title: "No favorites yet",
        message: "Mark videos as favorites to keep them handy for later.",
      })}
    </section>
  `;
}
