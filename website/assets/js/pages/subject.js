import { ROUTES } from "../constants.js";
import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderSearchBox } from "../components/search-box.js";
import { renderToolbar } from "../components/toolbar.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getSubjects, getVideos, getSubjectBySlug, getVideosBySubject, getThumbnailUrl, getDurationLabel, getResolutionLabel } from "../api.js";
import { getSubjectVideos, getSubjectSummaries, getFeaturedVideos } from "../services/discovery.js";

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
 * Renders the subject page using library data.
 * @param {{subjectSlug?:string}} [params]
 * @returns {string}
 */
export function render(params = {}) {
  const subjects = getSubjects();
  const subjectSlug = params.subjectSlug || null;
  const activeSubject = subjectSlug ? getSubjectBySlug(subjectSlug) : null;
  const videos = getVideos();
  const subjectVideos = activeSubject ? getSubjectVideos(videos, activeSubject.name) : [];
  const featuredVideos = getFeaturedVideos(videos, 6);
  const subjectStats = getSubjectSummaries(videos, 100);
  const featuredSubjects = subjectStats.slice(0, 5);
  const isSubjectDetail = Boolean(activeSubject);
  const isSubjectMissing = Boolean(subjectSlug && !activeSubject);

  const pageTitle = isSubjectMissing
    ? "Subject not found"
    : isSubjectDetail
      ? `Explore ${activeSubject.name}`
      : "Explore topic collections and video rows.";
  const pageDescription = isSubjectMissing
    ? `The subject "${subjectSlug}" was not found in the library.`
    : isSubjectDetail
      ? `Browse videos for ${activeSubject.name} and related resources.`
      : "Browse available subjects and preview featured videos from the library.";

  return `
    <section class="page-view" aria-labelledby="subject-title">
      ${renderPageHeader({
        eyebrow: "Subjects",
        title: pageTitle,
        description: pageDescription,
      })}

      ${renderToolbar({
        content: `
          ${renderSearchBox({ placeholder: "Search subject", description: "Search is not live in this phase." })}
          <div class="toolbar-item">Sort: Newest first</div>
          <div class="toolbar-item">Filter: All durations</div>
        `,
      })}

      ${isSubjectMissing ? `
        <section class="panel">
          ${renderEmptyState({
            title: "Subject not found",
            message: `The subject "${subjectSlug}" was not found in the loaded library.`,
            action: `<a href="#${ROUTES.SUBJECT}">Browse available subjects</a>`,
          })}
        </section>
      ` : isSubjectDetail ? `
        <section class="panel">
          ${renderSectionHeader({ title: activeSubject.name, subtitle: `${subjectVideos.length} videos` })}
          <div class="card-grid">
            ${subjectVideos.length
              ? subjectVideos.map((video) => renderVideoCard({
                  title: video.title,
                  subject: video.subject,
                  duration: getDurationLabel(video),
                  resolution: getResolutionLabel(video),
                  thumbnail: getThumbnailUrl(video),
                  description: video.display_title || video.filename,
                  videoId: video.id,
                })).join("")
              : renderEmptyState({
                  title: "No videos found",
                  message: `There are no videos available for ${activeSubject.name}.`,
                })}
          </div>
        </section>
      ` : `
        <section class="panel">
          ${renderSectionHeader({ title: "Topic Collections", subtitle: "Browse the subjects in your library." })}
          <div class="subject-grid">
            ${subjects.length
              ? subjects.map((subject, index) => {
                  const count = getVideosBySubject(subject.name).length;
                  return renderVideoCard({
                    title: subject.name,
                    subject: `${count} videos`,
                    duration: "—",
                    resolution: "—",
                    description: `${count} videos available`,
                    thumbnail: null,
                  });
                }).join("")
              : renderEmptyState({
                  title: "No subjects available",
                  message: "The library manifest has not indexed any subjects yet.",
                  action: `<a href="#${ROUTES.HOME}">Return to library</a>`,
                })}
          </div>
        </section>
      `}

      <section class="panel">
        ${renderSectionHeader({ title: "Featured videos", subtitle: "Recent videos from the selected subjects." })}
        <div class="card-grid">
          ${featuredVideos.length
            ? featuredVideos.map((video) => renderVideoCard({
                title: video.title,
                subject: video.subject,
                duration: getDurationLabel(video),
                resolution: getResolutionLabel(video),
                thumbnail: getThumbnailUrl(video),
                description: video.display_title || video.filename,
                videoId: video.id,
              })).join("")
            : renderEmptyState({
                title: "No featured videos",
                message: "Library videos will appear here once indexed.",
              })}
        </div>
      </section>
      <section class="panel">
        ${renderSectionHeader({ title: "Largest subjects", subtitle: "Most populated topic collections." })}
        <div class="subject-grid">
          ${featuredSubjects.length
            ? featuredSubjects.map((subject, index) => renderVideoCard({
                title: subject.subject,
                subject: `${subject.count} videos`,
                duration: "—",
                resolution: "—",
                description: `Popular subject collection`,
                thumbnail: null,
              })).join("")
            : renderEmptyState({
                title: "No subject summary available",
                message: "Subject counts will appear once the discovery engine runs.",
              })}
        </div>
      </section>
    </section>
  `;
}
