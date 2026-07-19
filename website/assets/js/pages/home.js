import { renderSectionHeader } from "../components/section-header.js";
import { renderStatCard } from "../components/stat-card.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderSubjectCard } from "../components/subject-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getSubjects, getVideos, getThumbnailUrl, getDurationLabel, getResolutionLabel, getLibraryStats, getSubjectSlug } from "../api.js";
import { getRecentVideos, getSubjectSummaries, getFeaturedVideos } from "../services/discovery.js";
import { ROUTES } from "../constants.js";

const SUBJECT_ACCENTS = [
  "#70b4ff",
  "#9bd57e",
  "#ffb86c",
  "#8f94ff",
  "#69d4c6",
  "#ff8fc7",
];

function getAccent(index) {
  return SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length];
}

/**
 * @param {object} video
 * @returns {string}
 */
function videoCard(video) {
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
 * Renders the library home page.
 * @returns {string}
 */
export function render() {
  const stats    = getLibraryStats();
  const subjects = getSubjects();
  const videos   = getVideos();

  const recentlyAdded  = getRecentVideos(videos, 12);
  const featured       = getFeaturedVideos(videos, 12);
  const recentActivity = getRecentVideos(videos, 3);

  const statCards = [
    { label: "Subjects", value: String(stats.totalSubjects), helper: "Topic collections" },
    { label: "Videos",   value: String(stats.totalVideos),   helper: "Available videos"  },
    { label: "Recent",   value: String(recentlyAdded.length), helper: "Recently added"   },
    { label: "Activity", value: String(recentActivity.length), helper: "Latest additions" },
  ];

  return `
    <section class="page-view" aria-label="Library home">

      <!-- Recently Added shelf -->
      <div class="media-section">
        ${renderSectionHeader({
          title: "Recently Added",
          subtitle: recentlyAdded.length
            ? `${recentlyAdded.length} video${recentlyAdded.length !== 1 ? "s" : ""}`
            : "",
        })}
        ${recentlyAdded.length
          ? `<div class="media-shelf">${recentlyAdded.map(videoCard).join("")}</div>`
          : renderEmptyState({ title: "No videos yet", message: "Your library has no videos yet." })
        }
      </div>

      <!-- Featured shelf -->
      ${featured.length ? `
        <div class="media-section">
          ${renderSectionHeader({ title: "From the Library", subtitle: "All available videos" })}
          <div class="media-shelf">${featured.map(videoCard).join("")}</div>
        </div>
      ` : ""}

      <!-- Subjects grid -->
      <div class="media-section">
        ${renderSectionHeader({
          title: "Subjects",
          subtitle: `${subjects.length} collection${subjects.length !== 1 ? "s" : ""}`,
        })}
        ${subjects.length
          ? `<div class="subject-grid">
              ${subjects.map((subject, index) => {
                const slug  = getSubjectSlug(subject);
                const count = subject.video_count ?? subject.videos?.length ?? 0;
                return renderSubjectCard({
                  title: subject.name,
                  subtitle: `${count} video${count !== 1 ? "s" : ""}`,
                  count,
                  accent: getAccent(index),
                  href: `#${ROUTES.SUBJECT}/${slug}`,
                });
              }).join("")}
            </div>`
          : renderEmptyState({ title: "No subjects found", message: "The library has no subjects." })
        }
      </div>

      <!-- Stats — secondary, below the content -->
      <div class="media-section">
        ${renderSectionHeader({ title: "Library Stats" })}
        <div class="stats-grid">
          ${statCards.map((stat) => renderStatCard(stat)).join("")}
        </div>
      </div>

    </section>
  `;
}
