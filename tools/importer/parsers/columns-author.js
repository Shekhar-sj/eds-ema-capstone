/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-author.
 * Base block: columns.
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Selector: .byline / .cmp-byline
 * Convention: columns block. First row = block name; second row defines column count.
 * Layout here is a single 2-column row: [ avatar image , name + occupations ].
 * blocks/columns-author/columns-author.js flags a column as the image column when it
 * contains only a picture/image, so the avatar is kept alone in its own cell.
 */
export default function parse(element, { document }) {
  // Scope to the inner byline component if present.
  const root = element.querySelector('.cmp-byline') || element;

  // Avatar image (input from .cmp-byline__image; may be <picture> or <img>).
  const image = root.querySelector('.cmp-byline__image picture, .cmp-byline__image img, picture, img');

  // Name and occupations text.
  const name = root.querySelector('.cmp-byline__name, h1, h2, h3');
  const occupations = root.querySelector('.cmp-byline__occupations, p');

  // Empty-block guard: nothing meaningful to emit.
  if (!image && !name && !occupations) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Second (content) column: name + occupations grouped together.
  const infoCell = [];
  if (name) infoCell.push(name);
  if (occupations) infoCell.push(occupations);

  // Single 2-column row: [ image , info ]. Pad empty side to keep 2 cells.
  const cells = [[image || '', infoCell.length ? infoCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-author', cells });
  element.replaceWith(block);
}
