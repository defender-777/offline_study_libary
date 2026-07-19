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
        title: "Your saved lectures will appear here.",
        description: "Placeholder only — favorites behavior is deferred.",
      })}
      ${renderEmptyState({
        title: "No favorites yet",
        message: "Mark videos as favorites to keep them handy for later.",
        action: "Feature placeholder — coming soon",
      })}
    </section>
  `;
}
