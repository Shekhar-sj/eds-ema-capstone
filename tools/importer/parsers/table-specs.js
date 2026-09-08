/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-specs. Base: table.
 * Source: https://wknd.site/us/en/adventures/*.html (.contentfragment.cmp-contentfragment--elements)
 * Generated: 2026-09-08
 *
 * Library convention (Table): multiple columns/rows; first row = block name only;
 * each subsequent row is a data row with one cell per column. This is a 2-column
 * label | value spec table with no header row (variant "no header").
 *
 * Source: <dl.cmp-contentfragment__elements> of <div.cmp-contentfragment__element>,
 * each holding a <dt.cmp-contentfragment__element-title> (label) and a
 * <dd.cmp-contentfragment__element-value> (value).
 */
export default function parse(element, { document }) {
  // Each spec is a content-fragment element with a title (dt) and a value (dd).
  const specs = Array.from(
    element.querySelectorAll('.cmp-contentfragment__element'),
  );

  const cells = [];

  specs.forEach((spec) => {
    const labelEl = spec.querySelector('.cmp-contentfragment__element-title, dt');
    const valueEl = spec.querySelector('.cmp-contentfragment__element-value, dd');

    const label = labelEl ? labelEl.textContent.trim() : '';
    const value = valueEl ? valueEl.textContent.trim() : '';

    // Only add rows that carry at least a label or a value; keep 2 columns even if one is empty.
    if (label || value) {
      cells.push([label, value]);
    }
  });

  // Empty-block guard: nothing meaningful to emit.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-specs', cells });
  element.replaceWith(block);
}
