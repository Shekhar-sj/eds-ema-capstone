/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html (.accordion.panelcontainer)
 * Generated: 2026-09-08
 *
 * Structure (from library-description.txt): 2-column table.
 *   Row 1: block name.
 *   Each subsequent row = one accordion item -> [title cell, content cell].
 *
 * Source (AEM Core Component accordion):
 *   .cmp-accordion__item
 *     .cmp-accordion__header .cmp-accordion__button .cmp-accordion__title  -> question
 *     .cmp-accordion__panel  -> answer content (.cmp-text within container)
 */
export default function parse(element, { document }) {
  // Each accordion item becomes one 2-cell row. Fallbacks handle DOM variation.
  const items = Array.from(
    element.querySelectorAll('.cmp-accordion__item, [class*="accordion__item"]'),
  );

  const cells = [];

  items.forEach((item) => {
    // Question: prefer the title span; fall back to the header/button text.
    const title = item.querySelector(
      '.cmp-accordion__title, [class*="accordion__title"], .cmp-accordion__header, [class*="accordion__header"]',
    );

    // Answer: the panel's inner content. Prefer the actual text component(s);
    // fall back to the whole panel so nothing is lost.
    const panel = item.querySelector(
      '.cmp-accordion__panel, [class*="accordion__panel"]',
    );

    let contentEl = null;
    if (panel) {
      // Prefer inner content container (strips panel-level wrappers/state classes).
      contentEl = panel.querySelector('.cmp-container, .container.responsivegrid') || panel;
    }

    // Skip items with no usable content.
    if (!title && !contentEl) return;

    const titleCell = title ? title.textContent.trim() : '';
    const contentCell = contentEl || '';

    cells.push([titleCell, contentCell]);
  });

  // Empty-block guard: if no accordion items were found, unwrap gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion-faq',
    cells,
  });
  element.replaceWith(block);
}
