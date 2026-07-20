/**
 * Reusable form control renderers for the settings page.
 */

/**
 * Renders a disabled text input field.
 * @param {{label:string,value:string,description?:string}} props
 * @returns {string}
 */
export function renderTextInput({ label, value, description = "" }) {
  const id = `setting-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const descriptionId = `${id}-description`;
  return `
  <div class="form-field">
    <label class="control-label" for="${id}">${label}</label>
    <input id="${id}" class="control-input" type="text" value="${value}" disabled aria-disabled="true" aria-label="${label}" ${description ? `aria-describedby="${descriptionId}"` : ""} />
    ${description ? `<p id="${descriptionId}" class="control-description">${description}</p>` : ""}
  </div>
  `;
}

/**
 * Renders a disabled select field.
 * @param {{label:string,value:string,description?:string}} props
 * @returns {string}
 */
export function renderSelectField({ label, value, description = "" }) {
  const id = `setting-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const descriptionId = `${id}-description`;
  return `
  <div class="form-field">
    <label class="control-label" for="${id}">${label}</label>
    <div id="${id}" class="control-select" role="text" aria-label="${label}" ${description ? `aria-describedby="${descriptionId}"` : ""}>${value}</div>
    ${description ? `<p id="${descriptionId}" class="control-description">${description}</p>` : ""}
  </div>
  `;
}

/**
 * Renders a disabled switch field.
 * @param {{label:string,checked:boolean,description?:string}} props
 * @returns {string}
 */
export function renderSwitchField({ label, checked, description = "" }) {
  const descriptionId = `setting-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-description`;
  return `
  <div class="form-field form-field--switch">
    <div class="form-field__row">
      <span class="control-label">${label}</span>
      <span class="switch ${checked ? "switch--on" : "switch--off"}" role="img" aria-label="${label}: ${checked ? "On" : "Off"}" ${description ? `aria-describedby="${descriptionId}"` : ""}>
        <span class="switch__track"></span>
        <span class="switch__thumb"></span>
      </span>
    </div>
    ${description ? `<p id="${descriptionId}" class="control-description">${description}</p>` : ""}
  </div>
  `;
}
