import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderStatCard } from "../components/stat-card.js";
import { renderTextInput, renderSelectField, renderSwitchField } from "../components/form-controls.js";
import { getState } from "../state.js";

const ABOUT_INFO = {
  version: "V2 preview",
  build: "Offline Study Library",
  description: "Preferences are intentionally read-only in this release so the app stays honest about what is currently implemented.",
};

const renderInfoField = ({ label, value, description = "" }) => `
  <div class="form-field">
    <label class="control-label">${label}</label>
    <div class="control-select control-select--readonly">${value}</div>
    ${description ? `<p class="control-description">${description}</p>` : ""}
  </div>
`;

const renderSettingsSection = ({ section, subtitle = "", controls }) => `
  <section class="panel settings-section">
    ${renderSectionHeader({ title: section, subtitle })}
    <div class="form-section">
      ${controls.join("")}
    </div>
  </section>
`;

function getCurrentSettings() {
  const settings = getState().settings;
  return settings && typeof settings === "object" ? settings : {};
}

function buildSettingsSections() {
  const settings = getCurrentSettings();

  return [
    {
      section: "General",
      subtitle: "Core app behavior and local library identity.",
      controls: [
        renderInfoField({
          label: "Library source",
          value: String(settings.librarySource || "downloads/"),
          description: "Loaded from the local downloads directory.",
        }),
        renderInfoField({
          label: "Language",
          value: String(settings.language || "Browser default"),
          description: "Language follows the host browser and is not user-configurable yet.",
        }),
      ],
    },
    {
      section: "Appearance",
      subtitle: "Visual preferences are surfaced here but remain read-only in this build.",
      controls: [
        renderSelectField({
          label: "Theme",
          value: String(settings.theme || "System"),
          description: "Theme switching is not persisted in the current release.",
        }),
        renderSelectField({
          label: "Navigation density",
          value: String(settings.navigationDensity || "Compact"),
          description: "The current desktop layout uses the compact version by design.",
        }),
      ],
    },
    {
      section: "Playback",
      subtitle: "Playback controls reflect the existing player lifecycle.",
      controls: [
        renderSelectField({
          label: "Default speed",
          value: String(settings.defaultSpeed || "1x"),
          description: "Player speed is controlled from the player itself, not preferences.",
        }),
        renderSwitchField({
          label: "Autoplay next",
          checked: Boolean(settings.autoplayNext),
          description: "Unavailable in this release.",
        }),
      ],
    },
    {
      section: "Library",
      subtitle: "Local file placement and indexing behavior.",
      controls: [
        renderTextInput({
          label: "Cache location",
          value: String(settings.cacheLocation || "Local storage"),
          description: "Offline cache remains local to the device.",
        }),
        renderSwitchField({
          label: "Auto-scan",
          checked: Boolean(settings.autoScan),
          description: "Metadata indexing is handled at build time, not through a live scanner.",
        }),
      ],
    },
  ];
}

/**
 * Renders the settings page as a preferences-style window.
 * @returns {string}
 */
export function render() {
  const settingsSections = buildSettingsSections();

  return `
    <section class="page-view" aria-labelledby="settings-title">
      ${renderPageHeader({
        eyebrow: "Settings",
        title: "Settings",
        description: "Preferences and local library information. Read-only controls are shown where settings are not yet implemented.",
      })}

      <div class="page-grid">
        <div class="span-8">
          ${settingsSections.map(renderSettingsSection).join("")}
        </div>
        <aside class="span-4">
          <section class="panel settings-aside">
            ${renderSectionHeader({ title: "About", subtitle: "Version and product status." })}
            <div class="stats-grid settings-about-grid">
              ${renderStatCard({ label: "Version", value: ABOUT_INFO.version, helper: "Desktop preview" })}
              ${renderStatCard({ label: "Build", value: ABOUT_INFO.build, helper: "Offline only" })}
            </div>
            <p class="card-copy">${ABOUT_INFO.description}</p>
          </section>

          <section class="panel settings-aside">
            ${renderSectionHeader({ title: "Status", subtitle: "What is active right now." })}
            <div class="form-section">
              ${renderInfoField({
                label: "Favorites",
                value: "Active",
                description: "Persisted locally and available throughout the app.",
              })}
              ${renderInfoField({
                label: "History tracking",
                value: "Read-only",
                description: "This view shows history entries when the app has data to display.",
              })}
            </div>
          </section>
        </aside>
      </div>
    </section>
  `;
}
