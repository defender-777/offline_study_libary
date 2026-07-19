import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderStatCard } from "../components/stat-card.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderSubjectCard } from "../components/subject-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getSubjects, getVideos, getThumbnailUrl, getDurationLabel, getResolutionLabel, getLibraryStats } from "../api.js";
import { getRecentVideos, getSubjectSummaries, getFeaturedVideos } from "../services/discovery.js";

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

function normalizeActivity(videos) {
  return videos.map((video) => ({
    title: video.title,
    meta: `${video.subject} · ${getDurationLabel(video)}`,
    timestamp: video.created_time || video.last_modified || "Recent",
  }));
}

/**
 * Renders the library home page with real library content.
 * @returns {string}
 */
export function render() {
  const stats = getLibraryStats();
  const subjects = getSubjects();
  const videos = getVideos();
  const continueWatching = getRecentVideos(videos, 4);
  const recentlyAdded = getFeaturedVideos(videos, 4);
  const activity = normalizeActivity(getRecentVideos(videos, 3));

  const statCards = [
    { label: "Subjects", value: String(stats.totalSubjects), helper: "Organized topic collections" },
    { label: "Videos", value: String(stats.totalVideos), helper: "Available study content" },
    { label: "Continue", value: String(continueWatching.length), helper: "Recent viewing sessions" },
    { label: "Activity", value: String(activity.length), helper: "Latest library actions" },
  ];

  return `
    <section class="page-view" aria-labelledby="home-title">
      ${renderPageHeader({
        eyebrow: "Dashboard",
        title: "Your offline study library",
        description: "Browse subjects, recent videos, and continuing learning sessions.",
      })}

      <div class="stats-grid">
        ${statCards.map((stat) => renderStatCard(stat)).join("")}
      </div>

      <div class="page-grid">
        <section class="panel span-8">
          ${renderSectionHeader({
            title: "Continue Watching",
            subtitle: "Resume the most recent videos from your library.",
          })}
          <div class="card-grid">
            ${continueWatching.length
              ? continueWatching.map((video) => renderVideoCard({
                  title: video.title,
                  subject: video.subject,
                  duration: getDurationLabel(video),
                  resolution: getResolutionLabel(video),
                  thumbnail: getThumbnailUrl(video),
                  description: video.display_title || video.filename,
                  progress: 0,
                  videoId: video.id,
                })).join("")
              : renderEmptyState({
                  title: "No recently watched videos",
                  message: "Your library is ready, but no continue watching history exists yet.",
                })}
          </div>
        </section>

        <aside class="panel span-4">
          ${renderSectionHeader({
            title: "Recent Activity",
            subtitle: "Latest library changes and updates.",
          })}
          <div class="activity-grid">
            ${activity.length
              ? activity.map((entry) => `
                <article class="timeline-card">
                  <span class="card-meta">${entry.timestamp}</span>
                  <h4>${entry.title}</h4>
                  <p class="card-copy">${entry.meta}</p>
                </article>
              `).join("")
              : renderEmptyState({
                  title: "No activity yet",
                  message: "Recent library activity will appear once you start exploring videos.",
                })}
          </div>
        </aside>
      </div>

      <section class="panel">
        ${renderSectionHeader({
          title: "Recently Added",
          subtitle: "The newest videos in your library.",
        })}
        <div class="card-grid">
          ${recentlyAdded.length
            ? recentlyAdded.map((video) => renderVideoCard({
                title: video.title,
                subject: video.subject,
                duration: getDurationLabel(video),
                resolution: getResolutionLabel(video),
                thumbnail: getThumbnailUrl(video),
                description: video.display_title || video.filename,
                videoId: video.id,
              })).join("")
            : renderEmptyState({
                title: "No videos available",
                message: "Your videos.json library has no entries yet.",
              })}
        </div>
      </section>

      <section class="panel">
        ${renderSectionHeader({
          title: "Subjects",
          subtitle: "Browse topic collections in your library.",
        })}
        <div class="subject-grid">
          ${subjects.length
            ? subjects.map((subject, index) => renderSubjectCard({
                title: subject.name,
                subtitle: `${subject.video_count ?? subject.videos?.length ?? 0} videos`,
                count: subject.video_count ?? subject.videos?.length ?? 0,
                accent: getAccent(index),
              })).join("")
            : renderEmptyState({
                title: "No subjects found",
                message: "The library manifest does not contain any subjects.",
              })}
        </div>
      </section>
    </section>
  `;
}
