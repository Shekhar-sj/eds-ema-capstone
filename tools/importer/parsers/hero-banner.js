/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-09-08
 *
 * Library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2: background image (single cell).
 *   Row 3: title + subheading + CTA (single cell).
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
  );

  // Content cell (row 3)
  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  ctaLinks.forEach((cta) => contentCell.push(cta));

  // Empty-block guard
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: background image (1-column: one cell). Only add if present.
  if (image) cells.push([image]);
  // Row 3: text content (1-column: one row, one cell holding all elements).
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
