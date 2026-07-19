/**
 * Renders a simple breadcrumb trail for page navigation.
 * @param {{items:Array<{label:string,route?:string}>}} props
 * @returns {string}
 */
export function renderBreadcrumb({ items }) {
  const segments = items.map((item, index) => {
    const isLast = index === items.length - 1;
    return `
      <li class="breadcrumb-item">
        ${item.route && !isLast ? `<a href="#${item.route}">${item.label}</a>` : `<span aria-current="page">${item.label}</span>`}
      </li>
    `;
  }).join("");

  return `
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>${segments}</ol>
  </nav>
  `;
}
