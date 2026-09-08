/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Generated: 2026-09-08
 *
 * Library structure (Cards): 2 columns, multiple rows, row 1 = block name.
 *   Each subsequent row = one card: [ image, textContent(title link + description) ].
 */
export default function parse(element, { document }) {
  const items = Array.from(
    element.querySelectorAll(':scope .cmp-image-list__item, :scope li, :scope > ul > li'),
  );

  const cells = [];

  items.forEach((item) => {
    // Image cell
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Text cell: title (as link) + description
    const textCell = [];
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title, [class*="title"]');
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

    if (titleLink) {
      // Preserve the linked title.
      textCell.push(titleLink);
    } else if (titleText) {
      textCell.push(titleText);
    }
    if (description) textCell.push(description);

    if (image || textCell.length) {
      cells.push([image || '', textCell.length ? textCell : '']);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
