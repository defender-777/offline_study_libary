import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderStatCard } from "../components/stat-card.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { ROUTES } from "../constants.js";
import { getState } from "../state.js";
import { getVideos, getThumbnailUrl, getDurationLabel, getResolutionLabel } from "../api.js";

/**
 * Resolves favorite entries into video objects from the loaded library.
 * Favorites may be stored as IDs or as full video objects.
 * @returns {Array<object>}
 */
function getFavoriteVideos() {
  const { favorites } = getState();
  const videos = getVideos();

  if (!Array.isArray(favorites) || !favorites.length || !videos.length) {
    return [];
  }

  const byId = new Map(videos.map((video) => [String(video.id), video]));
  const seen = new Set();

  return favorites
    .map((favorite) => {
      if (favorite && typeof favorite === "object" && favorite.id != null) {
        return favorite;
      }

      return byId.get(String(favorite)) ?? null;
    })
    .filter((video) => {
      if (!video || video.id == null) {
        return false;
      }

      const key = String(video.id);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function renderFavoriteCard(video) {
  return renderVideoCard({
    title: video.title,
    subject: video.subject,
    duration: getDurationLabel(video),
    resolution: getResolutionLabel(video),
    thumbnail: getThumbnailUrl(video),
    description: video.display_title || video.filename,
    videoId: video.id,
  });
}

/**
 * Renders the favorites page with a compact, media-first layout.
 * @returns {string}
 */
export function render() {
  const favoriteVideos = getFavoriteVideos();
  const totalFavorites = favoriteVideos.length;
  const uniqueSubjects = new Set(favoriteVideos.map((video) => video.subject)).size;

  return `
    <section class="page-view" aria-labelledby="favorites-title">
      ${renderPageHeader({
        eyebrow: "Favorites",
        title: "Favorites",
        description: totalFavorites
          ? `${totalFavorites} saved video${totalFavorites !== 1 ? "s" : ""} organized for quick access.`
          : "Videos you mark as favorites will appear here for quick access.",
      })}

      ${totalFavorites
        ? `
          <div class="media-section">
            ${renderSectionHeader({
              title: "Saved videos",
              subtitle: `${totalFavorites} item${totalFavorites !== 1 ? "s" : ""}`,
            })}
            <div class="stats-grid">
              ${renderStatCard({
                label: "Saved",
                value: String(totalFavorites),
                helper: "Ready to open offline",
              })}
              ${renderStatCard({
                label: "Subjects",
                value: String(uniqueSubjects),
                helper: "Across your favorites",
              })}
            </div>
          </div>

          <div class="media-section">
            ${renderSectionHeader({
              title: "Your collection",
              subtitle: "Ordered by how you saved them",
            })}
            <div class="card-grid">
              ${favoriteVideos.map(renderFavoriteCard).join("")}
            </div>
          </div>
        `
        : renderEmptyState({
            title: "No favorites yet",
            message: "Mark videos as favorites to keep them handy for later.",
            action: `<a href="#${ROUTES.HOME}" class="button">Browse library</a>`,
          })}
    </section>
  `;
}
