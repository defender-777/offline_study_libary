import { ROUTES } from "../constants.js";
import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderVideoCard } from "../components/video-card.js";
import { renderEmptyState } from "../components/empty-state.js";
import { getVideoById, getVideosBySubject, getThumbnailUrl, getDurationLabel, getResolutionLabel, getVideos } from "../api.js";
import { getVideoSourceUrl, getVideoMimeType, discoverSubtitleTracks, formatFileSize } from "../utils/media.js";
import { getRelatedVideos } from "../services/discovery.js";
import { navigate } from "../router.js";

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
let playerContext = null;

function renderMetadataRow(label, value) {
  return `
    <div class="player-metadata-row">
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

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
}

export function render(params = {}) {
  const videoId = params.videoId || null;
  const currentVideo = videoId ? getVideoById(videoId) : null;
  const invalidVideo = Boolean(videoId && !currentVideo);

  if (!videoId) {
    return `
      <section class="page-view" aria-labelledby="player-title">
        ${renderPageHeader({
          eyebrow: "Player",
          title: "Select a video",
          description: "Choose a video from the library to begin playback.",
        })}
        ${renderEmptyState({
          title: "No video selected",
          message: "Please choose a video from the library or subject list.",
          action: `<a href="#${ROUTES.HOME}">Return to library</a>`,
        })}
      </section>
    `;
  }

  if (invalidVideo) {
    return `
      <section class="page-view" aria-labelledby="player-title">
        ${renderPageHeader({
          eyebrow: "Player",
          title: "Video not found",
          description: "The requested video could not be found in your library.",
        })}
        ${renderEmptyState({
          title: "Video not found",
          message: `The video ID "${videoId}" does not exist in the loaded library.`,
          action: `<a href="#${ROUTES.HOME}">Return to library</a>`,
        })}
      </section>
    `;
  }

  const subjectVideos = getVideosBySubject(currentVideo.subject);
  const currentIndex = subjectVideos.findIndex((video) => String(video.id) === String(currentVideo.id));
  const previousVideo = currentIndex > 0 ? subjectVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < subjectVideos.length - 1 ? subjectVideos[currentIndex + 1] : null;
  const relatedVideos = getRelatedVideos(currentVideo, getVideos(), 4);
  const sourceUrl = getVideoSourceUrl(currentVideo);
  const posterUrl = getThumbnailUrl(currentVideo) || "";
  const description = currentVideo.description || currentVideo.display_title || currentVideo.filename || "No description available.";

  return `
    <section class="page-view" aria-labelledby="player-title">
      ${renderPageHeader({
        eyebrow: "Player",
        title: currentVideo.title,
        description: `Watch ${currentVideo.subject} playback with full offline controls.`,
      })}

      <div class="player-shell" data-player-shell tabindex="0">
        <section class="player-stage panel">
          <div class="player-stage__toolbar">
            <div class="player-stage__navigation">
              <button type="button" class="button" data-player-prev data-video-id="${previousVideo?.id ?? ""}"${!previousVideo ? " disabled" : ""} aria-label="Previous video">Previous</button>
              <button type="button" class="button" data-player-next data-video-id="${nextVideo?.id ?? ""}"${!nextVideo ? " disabled" : ""} aria-label="Next video">Next</button>
            </div>
            <div class="player-stage__speed">
              <label for="player-speed-select">Speed</label>
              <select id="player-speed-select" data-player-speed aria-label="Playback speed">${renderSpeedOptions()}</select>
            </div>
          </div>

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
              aria-label="Video player for ${currentVideo.title}"
            >
              <source src="${sourceUrl || ""}" type="${getVideoMimeType(currentVideo)}" />
              <p>Your browser does not support HTML5 video playback.</p>
            </video>
            <div class="player-overlay player-overlay--hidden" data-player-overlay>
              <p class="player-overlay__message" data-player-overlay-message>Loading video…</p>
              <button type="button" class="button button-primary hidden" data-player-replay>Replay</button>
            </div>
          </div>
        </section>

        <aside class="player-rail">
          <section class="panel">
            ${renderSectionHeader({ title: "Video details" })}
            <dl class="player-metadata">
              ${renderMetadataRow("Subject", currentVideo.subject)}
              ${renderMetadataRow("Duration", getDurationLabel(currentVideo))}
              ${renderMetadataRow("Resolution", getResolutionLabel(currentVideo))}
              ${renderMetadataRow("Filename", currentVideo.filename)}
              ${renderMetadataRow("File size", formatFileSize(Number(currentVideo.file_size_bytes)))}
              ${renderMetadataRow("Date added", currentVideo.created_time || currentVideo.last_modified || "Unknown")}
              ${renderMetadataRow("Description", description)}
            </dl>
          </section>
        </aside>
      </div>

      <section class="panel">
        ${renderSectionHeader({ title: "Related videos", subtitle: "More videos from this subject." })}
        <div class="card-grid">
          ${relatedVideos.length
            ? relatedVideos.map((video) => renderVideoCard({
                title: video.title,
                subject: video.subject,
                duration: getDurationLabel(video),
                resolution: getResolutionLabel(video),
                thumbnail: getThumbnailUrl(video),
                description: video.display_title || video.filename,
                videoId: video.id,
              })).join("")
            : `<p class="card-copy">No related videos were found.</p>`}
        </div>
      </section>
    </section>
  `;
}
