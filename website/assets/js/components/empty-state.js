/**
 * Renders a polished empty state with an inline SVG illustration.
 *
 * The illustration variant is chosen based on the title content so
 * different contexts get contextually appropriate art.
 *
 * @param {{title:string, message:string, action?:string}} props
 * @returns {string}
 */
export function renderEmptyState({ title, message, action = "" }) {
  const illustration = pickIllustration(title);

  return `
<section class="empty-state" role="status" aria-live="polite">
  <div class="empty-state__illustration" aria-hidden="true">
    ${illustration}
  </div>
  <div class="empty-state__content">
    <h3>${title}</h3>
    <p>${message}</p>
    ${action ? `<div class="empty-state__action">${action}</div>` : ""}
  </div>
</section>`.trim();
}

/* ── Illustration selector ── */
function pickIllustration(title) {
  const t = (title || "").toLowerCase();

  if (t.includes("search") || t.includes("matching") || t.includes("found")) {
    return svgSearch();
  }
  if (t.includes("histor") || t.includes("watch")) {
    return svgHistory();
  }
  if (t.includes("favorit") || t.includes("saved")) {
    return svgFavorites();
  }
  if (t.includes("video") || t.includes("library") || t.includes("loaded")) {
    return svgLibrary();
  }
  return svgGeneric();
}

/* ─────────────────────────────────────
   SVG illustrations — monochrome,
   drawn in currentColor so they
   inherit the .empty-state__illustration
   muted color.
   ───────────────────────────────────── */

function svgLibrary() {
  return `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Film strip body -->
    <rect x="12" y="24" width="72" height="48" rx="6" stroke="currentColor" stroke-width="3"/>
    <!-- Sprocket holes left -->
    <rect x="12" y="32" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="44" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="56" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <!-- Sprocket holes right -->
    <rect x="76" y="32" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="76" y="44" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="76" y="56" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <!-- Play triangle -->
    <path d="M38 36l22 12-22 12V36z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`;
}

function svgSearch() {
  return `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Magnifier circle -->
    <circle cx="40" cy="40" r="22" stroke="currentColor" stroke-width="3"/>
    <!-- Magnifier handle -->
    <line x1="56" y1="56" x2="76" y2="76" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- X lines inside -->
    <line x1="32" y1="32" x2="48" y2="48" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <line x1="48" y1="32" x2="32" y2="48" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </svg>`;
}

function svgHistory() {
  return `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Clock circle -->
    <circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="3"/>
    <!-- Clock hands -->
    <line x1="50" y1="50" x2="50" y2="30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="64" y2="58" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- Center dot -->
    <circle cx="50" cy="50" r="3" fill="currentColor"/>
    <!-- History arrow (counter-clockwise arc suggestion) -->
    <path d="M22 50 A28 28 0 0 1 36 26" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-dasharray="5 4" opacity="0.5"/>
    <polyline points="18,44 22,50 28,46" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
  </svg>`;
}

function svgFavorites() {
  return `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Large star -->
    <path d="M48 14l8.5 17.2 19 2.8-13.7 13.4 3.2 18.8L48 57l-17 8.9 3.2-18.8L20.5 34l19-2.8L48 14z"
          stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <!-- Small decorative stars -->
    <path d="M18 22l1.5 3 3.3.5-2.4 2.3.6 3.3L18 29.5 15 31.1l.6-3.3-2.4-2.3 3.3-.5L18 22z"
          stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity="0.4"/>
    <path d="M76 62l1.2 2.4 2.7.4-1.9 1.9.4 2.6L76 68l-2.4 1.3.4-2.6-1.9-1.9 2.7-.4L76 62z"
          stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity="0.4"/>
  </svg>`;
}

function svgGeneric() {
  return `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Open box / folder -->
    <path d="M16 36h64l-6 36H22L16 36z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <path d="M12 36l4-12h22l6 8h28l4 4" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Dotted line inside suggesting emptiness -->
    <line x1="32" y1="56" x2="64" y2="56" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-dasharray="5 5" opacity="0.4"/>
  </svg>`;
}
