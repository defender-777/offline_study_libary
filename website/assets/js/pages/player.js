import { ROUTES } from "../constants.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getVideoById, getVideosBySubject, getThumbnailUrl, getDurationLabel, getResolutionLabel, getVideos } from "../api.js";
import { getVideoSourceUrl, getVideoMimeType, discoverSubtitleTracks } from "../utils/media.js";
import { getRelatedVideos } from "../services/discovery.js";
import { navigate } from "../router.js";

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
let playerContext = null;

function renderSpeedOptions() {
  return PLAYBACK_SPEEDS.map((speed) => `
    <option value="${speed}"${speed === 1 ? " selected" : ""}>${speed}×</option>
  `).join("");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isTextInput(element) {
  if (!element) {
    return false;
  }

  const tag = element.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || element.isContentEditable;
}

function setOverlayState(context, state) {
  const { overlay, overlayMessage, replayButton } = context;
  overlay.classList.remove("player-overlay--loading", "player-overlay--buffering", "player-overlay--ended", "player-overlay--error", "player-overlay--hidden");
  replayButton.classList.add("hidden");

  if (state === "hidden") {
    overlay.classList.add("player-overlay--hidden");
    return;
  }

  overlay.classList.remove("player-overlay--hidden");
  if (state === "loading") {
    overlay.classList.add("player-overlay--loading");
    overlayMessage.textContent = "Loading video…";
    return;
  }

  if (state === "buffering") {
    overlay.classList.add("player-overlay--buffering");
    overlayMessage.textContent = "Buffering…";
    return;
  }

  if (state === "ended") {
    overlay.classList.add("player-overlay--ended");
    overlayMessage.textContent = "Playback ended.";
    replayButton.classList.remove("hidden");
    return;
  }

  if (state === "error") {
    overlay.classList.add("player-overlay--error");
    overlayMessage.textContent = "Playback failed. Please try another video.";
    return;
  }
}

function cleanupPlayerContext() {
  if (!playerContext) {
    return;
  }

  const { videoElement, eventListeners, keyboardListener } = playerContext;
  eventListeners.forEach(({ target, type, listener, options }) => {
    target.removeEventListener(type, listener, options);
  });

  if (keyboardListener) {
    document.removeEventListener("keydown", keyboardListener);
  }

  if (videoElement) {
    videoElement.pause();
    videoElement.removeAttribute("src");
    videoElement.load();
  }

  playerContext = null;
}

function createPlayerContext(container) {
  cleanupPlayerContext();

  const videoElement = container.querySelector("#video-player");
  const overlay = container.querySelector("[data-player-overlay]");
  const overlayMessage = container.querySelector("[data-player-overlay-message]");
  const replayButton = container.querySelector("[data-player-replay]");
  const speedSelect = container.querySelector("[data-player-speed]");
  const prevButton = container.querySelector("[data-player-prev]");
  const nextButton = container.querySelector("[data-player-next]");

  if (!videoElement || !overlay || !overlayMessage || !replayButton || !speedSelect) {
    return null;
  }

  const context = {
    container,
    videoElement,
    overlay,
    overlayMessage,
    replayButton,
    speedSelect,
    prevButton,
    nextButton,
    eventListeners: [],
    keyboardListener: null,
  };

  playerContext = context;
  return context;
}

function registerPlayerEvents(context, currentVideo, previousVideo, nextVideo) {
  const { videoElement, replayButton, speedSelect, prevButton, nextButton } = context;

  const handleLoadedMetadata = () => setOverlayState(context, "hidden");
  const handleCanPlay = () => setOverlayState(context, "hidden");
  const handlePlay = () => setOverlayState(context, "hidden");
  const handlePause = () => {
    if (videoElement.currentTime > 0 && !videoElement.ended) {
      setOverlayState(context, "hidden");
    }
  };
  const handleWaiting = () => setOverlayState(context, "buffering");
  const handleEnded = () => setOverlayState(context, "ended");
  const handleError = () => setOverlayState(context, "error");

  const handleReplay = () => {
    videoElement.currentTime = 0;
    videoElement.play().catch(() => setOverlayState(context, "error"));
  };

  const handleSpeedChange = (event) => {
    const speed = Number(event.target.value) || 1;
    videoElement.playbackRate = speed;
  };

  const navigateToVideo = (video) => {
    if (!video) {
      return;
    }
    navigate(`${ROUTES.PLAYER}/${encodeURIComponent(video.id)}`);
  };

  const handlePrev = () => navigateToVideo(previousVideo);
  const handleNext = () => navigateToVideo(nextVideo);

  const handleKeyDown = (event) => {
    if (!context.container.contains(document.activeElement)) {
      return;
    }

    if (isTextInput(document.activeElement)) {
      return;
    }

    switch (event.key) {
      case " ":
      case "Spacebar":
        event.preventDefault();
        if (videoElement.paused) {
          videoElement.play().catch(() => setOverlayState(context, "error"));
        } else {
          videoElement.pause();
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
        break;
      case "ArrowRight":
        event.preventDefault();
        videoElement.currentTime = Math.min(videoElement.duration || Infinity, videoElement.currentTime + 5);
        break;
      case "ArrowUp":
        event.preventDefault();
        videoElement.volume = clamp(videoElement.volume + 0.1, 0, 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        videoElement.volume = clamp(videoElement.volume - 0.1, 0, 1);
        break;
      case "m":
      case "M":
        event.preventDefault();
        videoElement.muted = !videoElement.muted;
        break;
      case "f":
      case "F":
        event.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          context.container.requestFullscreen().catch(() => {});
        }
        break;
      case "Escape":
        if (document.fullscreenElement) {
          event.preventDefault();
          document.exitFullscreen().catch(() => {});
        }
        break;
      default:
        break;
    }
  };

  const handleDoubleClick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    context.container.requestFullscreen().catch(() => {});
  };

  videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
  videoElement.addEventListener("canplay", handleCanPlay);
  videoElement.addEventListener("play", handlePlay);
  videoElement.addEventListener("pause", handlePause);
  videoElement.addEventListener("waiting", handleWaiting);
  videoElement.addEventListener("ended", handleEnded);
  videoElement.addEventListener("error", handleError);
  videoElement.addEventListener("dblclick", handleDoubleClick);
  replayButton.addEventListener("click", handleReplay);
  speedSelect.addEventListener("change", handleSpeedChange);
  if (prevButton) {
    prevButton.addEventListener("click", handlePrev);
  }
  if (nextButton) {
    nextButton.addEventListener("click", handleNext);
  }
  document.addEventListener("keydown", handleKeyDown);

  context.eventListeners.push(
    { target: videoElement, type: "loadedmetadata", listener: handleLoadedMetadata },
    { target: videoElement, type: "canplay", listener: handleCanPlay },
    { target: videoElement, type: "play", listener: handlePlay },
    { target: videoElement, type: "pause", listener: handlePause },
    { target: videoElement, type: "waiting", listener: handleWaiting },
    { target: videoElement, type: "ended", listener: handleEnded },
    { target: videoElement, type: "error", listener: handleError },
    { target: videoElement, type: "dblclick", listener: handleDoubleClick },
    { target: replayButton, type: "click", listener: handleReplay },
    { target: speedSelect, type: "change", listener: handleSpeedChange },
  );

  if (prevButton) {
    context.eventListeners.push({ target: prevButton, type: "click", listener: handlePrev });
  }
  if (nextButton) {
    context.eventListeners.push({ target: nextButton, type: "click", listener: handleNext });
  }

  context.keyboardListener = handleKeyDown;
  setOverlayState(context, "loading");

  if (currentVideo) {
    discoverSubtitleTracks(currentVideo).then((tracks) => {
      tracks.forEach((track) => {
        const trackElement = document.createElement("track");
        trackElement.kind = track.kind;
        trackElement.label = track.label;
        trackElement.srclang = track.srclang;
        trackElement.src = track.src;
        videoElement.appendChild(trackElement);
      });
    }).catch(() => {});
  }
}

export function cleanupPlayerView() {
  cleanupPlayerContext();
}

export function mountPlayerView(container) {
  if (!container) {
    cleanupPlayerContext();
    return;
  }

  const context = createPlayerContext(container);
  if (!context) {
    return;
  }

  const currentVideoId = context.videoElement.dataset.videoId || null;
  const previousVideoId = context.prevButton?.dataset.videoId || null;
  const nextVideoId = context.nextButton?.dataset.videoId || null;
  const currentVideo = currentVideoId ? getVideoById(currentVideoId) : null;
  const previousVideo = previousVideoId ? getVideoById(previousVideoId) : null;
  const nextVideo = nextVideoId ? getVideoById(nextVideoId) : null;

  registerPlayerEvents(context, currentVideo, previousVideo, nextVideo);

  // ── Description toggle ──────────────────────────────────
  // State is kept in-memory for the lifetime of this mounted view.
  // The CSS grid-template-rows trick handles the smooth animation;
  // we only need to toggle the data-expanded attribute and aria-expanded.
  const descPanel  = container.querySelector("[data-player-desc]");
  const descToggle = container.querySelector("[data-player-desc-toggle]");

  if (descPanel && descToggle) {
    let descExpanded = false;

    const handleDescToggle = () => {
      descExpanded = !descExpanded;
      descPanel.dataset.expanded  = String(descExpanded);
      descToggle.setAttribute("aria-expanded", String(descExpanded));
    };

    descToggle.addEventListener("click", handleDescToggle);
    context.eventListeners.push({ target: descToggle, type: "click", listener: handleDescToggle });
  }
}

export function render(params = {}) {
  const videoId = params.videoId || null;
  const currentVideo = videoId ? getVideoById(videoId) : null;
  const invalidVideo = Boolean(videoId && !currentVideo);

  if (!videoId) {
    return `
      <section class="page-view" aria-labelledby="player-title">
        ${renderEmptyState({
          title: "No video selected",
          message: "Choose a video from the library to begin playback.",
          action: `<a href="#${ROUTES.HOME}" class="button">Browse library</a>`,
        })}
      </section>
    `;
  }

  if (invalidVideo) {
    return `
      <section class="page-view" aria-labelledby="player-title">
        ${renderEmptyState({
          title: "Video not found",
          message: `The video ID "${videoId}" does not exist in the loaded library.`,
          action: `<a href="#${ROUTES.HOME}" class="button">Browse library</a>`,
        })}
      </section>
    `;
  }

  const subjectVideos = getVideosBySubject(currentVideo.subject);
  const currentIndex = subjectVideos.findIndex((v) => String(v.id) === String(currentVideo.id));
  const previousVideo = currentIndex > 0 ? subjectVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < subjectVideos.length - 1 ? subjectVideos[currentIndex + 1] : null;
  const relatedVideos = getRelatedVideos(currentVideo, getVideos(), 8);
  const sourceUrl = getVideoSourceUrl(currentVideo);
  const posterUrl = getThumbnailUrl(currentVideo) || "";
  const description = currentVideo.description || currentVideo.display_title || currentVideo.filename || "";

  // ── Sidebar: Up Next block ──────────────────────────────
  const upNextBlock = nextVideo ? `
    <div class="player-upnext">
      <p class="player-upnext__label">Up Next</p>
      ${renderVideoCard({
        title: nextVideo.title,
        subject: nextVideo.subject,
        duration: getDurationLabel(nextVideo),
        resolution: getResolutionLabel(nextVideo),
        thumbnail: getThumbnailUrl(nextVideo),
        videoId: nextVideo.id,
        layout: "list",
      })}
    </div>
  ` : "";

  // ── Sidebar: Related list ───────────────────────────────
  // Exclude the next video from the related list to avoid duplication
  const sidebarVideos = relatedVideos.filter((v) => !nextVideo || String(v.id) !== String(nextVideo.id));

  const relatedBlock = sidebarVideos.length ? `
    <div class="player-related">
      <p class="player-related__label">Related</p>
      <div class="player-related__list">
        ${sidebarVideos.map((v) => renderVideoCard({
          title: v.title,
          subject: v.subject,
          duration: getDurationLabel(v),
          resolution: getResolutionLabel(v),
          thumbnail: getThumbnailUrl(v),
          videoId: v.id,
          layout: "list",
          selected: String(v.id) === String(currentVideo.id),
        })).join("")}
      </div>
    </div>
  ` : "";

  // ── Meta strip badges ───────────────────────────────────
  const durationLabel    = getDurationLabel(currentVideo);
  const resolutionLabel  = getResolutionLabel(currentVideo);
  const metaItems = [
    `<span class="badge badge-pill">${currentVideo.subject}</span>`,
    durationLabel   !== "Unknown" ? `<span class="badge badge-duration">${durationLabel}</span>`   : "",
    resolutionLabel !== "Unknown" ? `<span class="badge badge-resolution">${resolutionLabel}</span>` : "",
  ].filter(Boolean).join("");

  return `
    <section class="page-view" aria-labelledby="player-title">

      <div class="player-shell" data-player-shell tabindex="0">

        <!-- ── Primary: video + info ── -->
        <div class="player-primary">

          <!-- Video -->
          <div class="player-video-wrapper">
            <video
              id="video-player"
              data-video-id="${currentVideo.id}"
              class="player-video"
              controls
              preload="metadata"
              playsinline
              controlslist="nodownload noremoteplayback"
              poster="${posterUrl}"
              aria-label="Video player for ${currentVideo.title.replace(/"/g, "&quot;")}"
            >
              <source src="${sourceUrl || ""}" type="${getVideoMimeType(currentVideo)}" />
              <p>Your browser does not support HTML5 video playback.</p>
            </video>
            <div class="player-overlay player-overlay--hidden" data-player-overlay>
              <p class="player-overlay__message" data-player-overlay-message>Loading video…</p>
              <button type="button" class="button button-primary hidden" data-player-replay>Replay</button>
            </div>
          </div>

          <!-- Title + toolbar -->
          <div class="player-info">
            <h1 id="player-title" class="player-title">${currentVideo.title}</h1>
            <div class="player-toolbar">
              <div class="player-toolbar__nav">
                <button
                  type="button"
                  class="player-nav-btn player-nav-btn--prev"
                  data-player-prev
                  data-video-id="${previousVideo?.id ?? ""}"
                  ${!previousVideo ? "disabled" : ""}
                  aria-label="Previous video${previousVideo ? `: ${previousVideo.title}` : ""}"
                >Prev</button>
                <button
                  type="button"
                  class="player-nav-btn player-nav-btn--next"
                  data-player-next
                  data-video-id="${nextVideo?.id ?? ""}"
                  ${!nextVideo ? "disabled" : ""}
                  aria-label="Next video${nextVideo ? `: ${nextVideo.title}` : ""}"
                >Next</button>
              </div>
              <div class="player-speed">
                <label for="player-speed-select" class="player-speed__label">Speed</label>
                <select
                  id="player-speed-select"
                  class="player-speed__select"
                  data-player-speed
                  aria-label="Playback speed"
                >${renderSpeedOptions()}</select>
              </div>
            </div>
          </div>

          <!-- Meta strip -->
          <div class="player-meta-strip" aria-label="Video metadata">
            ${metaItems}
          </div>

          <!-- Description -->
          ${description ? `
          <div class="player-desc" data-player-desc>
            <button
              type="button"
              class="player-desc__toggle"
              data-player-desc-toggle
              aria-expanded="false"
              aria-controls="player-desc-body"
            >
              Description
              <svg class="player-desc__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="player-desc__body" id="player-desc-body" role="region" aria-label="Description">
              <div class="player-desc__inner">
                <p class="player-desc__text">${description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </div>
            </div>
          </div>
          ` : ""}

        </div><!-- /.player-primary -->

        <!-- ── Sidebar: Up Next + Related ── -->
        <aside class="player-sidebar" aria-label="Up next and related videos">
          ${upNextBlock}
          ${relatedBlock}
        </aside>

      </div><!-- /.player-shell -->

    </section>
  `;
}
