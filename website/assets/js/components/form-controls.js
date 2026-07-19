/**
 * Reusable form control renderers for the settings page.
 */

/**
 * Renders a disabled text input field.
 * @param {{label:string,value:string,description?:string}} props
 * @returns {string}
 */
export function renderTextInput({ label, value, description = "" }) {
  return `
  <div class="form-field">
    <label class="control-label">${label}</label>
    <input class="control-input" type="text" value="${value}" disabled aria-disabled="true" />
    ${description ? `<p class="control-description">${description}</p>` : ""}
  </div>
  `;
}

/**
 * Renders a disabled select field.
 * @param {{label:string,value:string,description?:string}} props
 * @returns {string}
 */
export function renderSelectField({ label, value, description = "" }) {
  return `
  <div class="form-field">
    <label class="control-label">${label}</label>
    <div class="control-select">${value}</div>
    ${description ? `<p class="control-description">${description}</p>` : ""}
  </div>
  `;
}

/**
 * Renders a disabled switch field.
 * @param {{label:string,checked:boolean,description?:string}} props
 * @returns {string}
 */
export function renderSwitchField({ label, checked, description = "" }) {
  return `
  <div class="form-field form-field--switch">
    <div class="form-field__row">
      <label class="control-label">${label}</label>
      <span class="switch ${checked ? "switch--on" : "switch--off"}" aria-hidden="true">
        <span class="switch__track"></span>
        <span class="switch__thumb"></span>
      </span>
    </div>
    ${description ? `<p class="control-description">${description}</p>` : ""}
  </div>
  `;
}
