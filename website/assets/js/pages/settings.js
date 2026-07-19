import { renderPageHeader } from "../components/page-header.js";
import { renderSectionHeader } from "../components/section-header.js";
import { renderTextInput, renderSelectField, renderSwitchField } from "../components/form-controls.js";

const renderSettingsSection = ({ section, controls }) => `
  <section class="panel">
    ${renderSectionHeader({ title: section })}
    <div class="form-section">
      ${controls.map((control) => {
        if (control.type === "text") return renderTextInput(control);
        if (control.type === "select") return renderSelectField(control);
        if (control.type === "switch") return renderSwitchField({ ...control, checked: control.value !== "Disabled" && control.value !== "Off" });
        return "";
      }).join("")}
    </div>
  </section>
`;

const defaultSettings = [
  {
    section: "Appearance",
    controls: [
      { label: "Theme", value: "System", type: "select" },
      { label: "Navigation density", value: "Cozy", type: "select" },
    ],
  },
  {
    section: "Playback",
    controls: [
      { label: "Default speed", value: "1x", type: "select" },
      { label: "Autoplay next", value: "Disabled", type: "switch" },
    ],
  },
  {
    section: "Storage",
    controls: [
      { label: "Cache location", value: "Local downloads", type: "text" },
      { label: "Download limit", value: "None", type: "text" },
    ],
  },
  {
    section: "Library",
    controls: [
      { label: "Source path", value: "downloads/", type: "text" },
      { label: "Auto-scan", value: "Disabled", type: "switch" },
    ],
  },
];

const aboutInfo = {
  version: "4.3.0-preview",
  build: "real-library-integration",
  description: "Settings are still visual-only, now powered by the loaded library manifest.",
};

/**
 * Renders the settings page with disabled form controls.
 * @returns {string}
 */
export function render() {
  return `
    <section class="page-view" aria-labelledby="settings-title">
      ${renderPageHeader({
        eyebrow: "Settings",
        title: "Application preferences and library configuration.",
        description: "Layout-only settings sections with disabled controls.",
      })}

      <div class="page-grid">
        <div class="span-8">
          ${defaultSettings.map(renderSettingsSection).join("")}
        </div>
        <aside class="span-4">
          <section class="panel">
            ${renderSectionHeader({ title: "About this app" })}
            <p class="card-copy">Version: ${aboutInfo.version}</p>
            <p class="card-copy">Build: ${aboutInfo.build}</p>
            <p class="card-copy">${aboutInfo.description}</p>
          </section>
        </aside>
      </div>
    </section>
  `;
}
