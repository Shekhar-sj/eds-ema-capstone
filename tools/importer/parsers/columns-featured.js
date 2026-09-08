/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-08
 *
 * Library structure (Columns): multiple columns/rows, row 1 = block name.
 * This variant is a split panel: image on one side, text (pretitle + title +
 * description + CTA) on the other. Rendered as a single 2-column row.
 */
export default function parse(element, { document }) {
  // Text column content
  const textCell = [];
  const pretitle = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
  // Exclude pretitle from the title fallback ([class*="title"] would also match "pretitle").
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
  );

  if (pretitle) textCell.push(pretitle);
  if (title) textCell.push(title);
  if (description) textCell.push(description);
  ctaLinks.forEach((cta) => textCell.push(cta));

  // Image column content
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Empty-block guard
  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single 2-column row: image left, text right (matches source visual order).
  const cells = [[image || '', textCell.length ? textCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
