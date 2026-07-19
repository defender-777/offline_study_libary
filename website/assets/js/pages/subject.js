import { ROUTES } from "../constants.js";
import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderSubjectCard } from "../components/subject-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getSubjects, getVideos, getSubjectBySlug, getVideosBySubject, getThumbnailUrl, getDurationLabel, getResolutionLabel, getSubjectSlug } from "../api.js";
import { getSubjectVideos, getSubjectSummaries } from "../services/discovery.js";
import { on } from "../utils/events.js";
import { debounce } from "../utils/debounce.js";

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

let _subjectSearchCleanup = null;

/**
 * Attaches live search to the subject detail video grid.
 * @param {HTMLElement} container
 * @param {Array<object>} videos - Full video list for the subject.
 */
export function mountSubjectView(container, videos) {
  if (_subjectSearchCleanup) {
    _subjectSearchCleanup();
    _subjectSearchCleanup = null;
  }

  const input = container.querySelector("#subject-search-input");
  const grid = container.querySelector("#subject-video-grid");
  const countEl = container.querySelector("[data-subject-count]");

  if (!input || !grid) {
    return;
  }

  const allCards = Array.from(grid.querySelectorAll(".video-card"));

  const filter = debounce((query) => {
    const normalized = query.trim().toLowerCase();
    let visible = 0;

    allCards.forEach((card) => {
      const text = (card.textContent || "").toLowerCase();
      const show = !normalized || text.includes(normalized);
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (countEl) {
      countEl.textContent = normalized
        ? `${visible} of ${allCards.length} videos`
        : `${allCards.length} videos`;
    }
  }, 150);

  const handleInput = (event) => filter(event.target.value);
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      input.value = "";
      filter("");
    }
  };

  const cleanup = [
    on(input, "input", handleInput),
    on(input, "keydown", handleKeyDown),
  ];

  _subjectSearchCleanup = () => cleanup.forEach((dispose) => dispose());
  input.focus();
}

export function cleanupSubjectView() {
  if (_subjectSearchCleanup) {
    _subjectSearchCleanup();
    _subjectSearchCleanup = null;
  }
}

/**
 * Renders a video card row for a given video.
 */
function renderSubjectVideoCard(video) {
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
  const isSubjectDetail = Boolean(activeSubject);
  const isSubjectMissing = Boolean(subjectSlug && !activeSubject);

  const pageTitle = isSubjectMissing
    ? "Subject not found"
    : isSubjectDetail
      ? activeSubject.name
      : "Subjects";
  const pageDescription = isSubjectMissing
    ? `No subject matching "${subjectSlug}" was found in the library.`
    : isSubjectDetail
      ? `${subjectVideos.length} video${subjectVideos.length !== 1 ? "s" : ""} in this collection.`
      : "Browse topic collections in your library.";

  if (isSubjectMissing) {
    return `
      <section class="page-view" aria-labelledby="subject-title">
        ${renderPageHeader({ eyebrow: "Subjects", title: "Subject not found", description: pageDescription })}
        <section class="panel">
          ${renderEmptyState({
            title: "Subject not found",
            message: `No subject matching "${subjectSlug}" exists in the loaded library.`,
            action: `<a href="#${ROUTES.SUBJECT}" class="button">Browse subjects</a>`,
          })}
        </section>
      </section>
    `;
  }

  if (isSubjectDetail) {
    return `
      <section class="page-view" aria-labelledby="subject-title">
        ${renderPageHeader({
          eyebrow: "Subjects",
          title: activeSubject.name,
          description: `${subjectVideos.length} video${subjectVideos.length !== 1 ? "s" : ""} in this collection.`,
        })}

        <section class="panel">
          <div class="subject-search-bar">
            <div class="search-box">
              <label class="search-box__label" for="subject-search-input">
                <span class="visually-hidden">Filter videos in ${activeSubject.name}</span>
                <input
                  id="subject-search-input"
                  class="search-box__input"
                  type="search"
                  placeholder="Filter videos…"
                  autocomplete="off"
                  aria-label="Filter videos in ${activeSubject.name}"
                />
              </label>
            </div>
            <span class="card-meta" data-subject-count>${subjectVideos.length} videos</span>
          </div>

          ${renderSectionHeader({ title: activeSubject.name, subtitle: "" })}
          <div class="card-grid" id="subject-video-grid">
            ${subjectVideos.length
              ? subjectVideos.map(renderSubjectVideoCard).join("")
              : renderEmptyState({
                  title: "No videos found",
                  message: `There are no videos in the ${activeSubject.name} collection.`,
                })}
          </div>
        </section>
      </section>
    `;
  }

  // Subject listing page
  const subjectStats = getSubjectSummaries(videos, 100);
  const subjectStatMap = Object.fromEntries(subjectStats.map((s) => [s.subject, s.count]));

  return `
    <section class="page-view" aria-labelledby="subject-title">
      ${renderPageHeader({
        eyebrow: "Subjects",
        title: "Subjects",
        description: "Browse topic collections in your library.",
      })}

      <div class="subject-grid">
        ${subjects.length
          ? subjects.map((subject, index) => {
              const slug = getSubjectSlug(subject);
              const count = subjectStatMap[subject.name] ?? getVideosBySubject(subject.name).length;
              return renderSubjectCard({
                title: subject.name,
                subtitle: `${count} video${count !== 1 ? "s" : ""}`,
                count,
                accent: getAccent(index),
                href: `#${ROUTES.SUBJECT}/${slug}`,
              });
            }).join("")
          : renderEmptyState({
              title: "No subjects available",
              message: "The library has not indexed any subjects yet.",
              action: `<a href="#${ROUTES.HOME}" class="button">Return to library</a>`,
            })}
      </div>
    </section>
  `;
}
