/**
 * Renders a search box used by the discovery UI.
 * @param {{id?:string, placeholder:string, value?:string, description?:string, ariaLabel?:string, disabled?:boolean}} props
 * @returns {string}
 */
export function renderSearchBox({ id = "", placeholder, value = "", description = "", ariaLabel = "Search videos", disabled = false }) {
  const labelFor = id ? `for="${id}"` : "";
  return `
  <div class="search-box">
    <label class="search-box__label" ${labelFor}>
      <span class="visually-hidden">${ariaLabel}</span>
      <input
        ${id ? `id="${id}"` : ""}
        class="search-box__input"
        type="search"
        value="${value}"
        placeholder="${placeholder}"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        ${disabled ? "disabled aria-disabled=\"true\"" : ""}
        aria-label="${ariaLabel}"
      />
    </label>
    ${description ? `<p class="search-box__note">${description}</p>` : ""}
  </div>
  `;
}
