/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile. Base block: cards.
 * Source: https://wknd.site/us/en/about-us.html
 * Generated: 2026-09-08
 *
 * EDS convention (cards): 2-column table. First row is the block name. Each
 * subsequent row is one card — first cell holds the image, second cell holds the
 * text content (heading + description + optional CTA/links). decorate() turns each
 * row into an <li>.
 *
 * The import script calls this parser ONCE PER matched
 * `.experiencefragment.cmp-experience-fragment--contributor` element (7 tiles on
 * the About Us page). Strategy: only the FIRST contributor tile (document order)
 * builds the block, gathering ALL contributor tiles into one 2-column block (one
 * row per person) and removing the remaining tiles. Every other invocation is a
 * no-op, so the order of parser calls is irrelevant. The section headings
 * ("Our Contributors", "WKND Guides") remain as default content around the block.
 */

function buildCardRow(tile, document) {
  // Avatar image — validated against source.html (.cmp-image img)
  const img = tile.querySelector('.cmp-image img, .image img, img');

  // Name — first title (h3.cmp-title__text)
  const nameEl = tile.querySelector('h3.cmp-title__text, .cmp-title h3, h3');
  // Role/occupation — second title (h5.cmp-title__text)
  const roleEl = tile.querySelector('h5.cmp-title__text, .cmp-title h5, h5');

  // Social links — buttons inside the building-block grid (a.cmp-button)
  const socialLinks = Array.from(tile.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button, a.cmp-button, .buildingblock a[href]'));

  // Text content cell (second column): heading + role + social links.
  const bodyCell = [];
  if (nameEl && nameEl.textContent.trim()) {
    const h3 = document.createElement('h3');
    h3.textContent = nameEl.textContent.trim();
    bodyCell.push(h3);
  }
  if (roleEl && roleEl.textContent.trim()) {
    const h5 = document.createElement('h5');
    h5.textContent = roleEl.textContent.trim();
    bodyCell.push(h5);
  }
  if (socialLinks.length) {
    const p = document.createElement('p');
    socialLinks.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href') || '#';
      const label = a.querySelector('.cmp-button__text');
      link.textContent = (label ? label.textContent : a.textContent).trim() || 'Link';
      p.append(link);
      if (i < socialLinks.length - 1) p.append(document.createTextNode(' '));
    });
    bodyCell.push(p);
  }

  // Skip a tile with no usable content at all.
  if (!img && bodyCell.length === 0) return null;

  // 2-column row: [ image cell, text-content cell ]. Pad image cell if missing so
  // all rows keep the same column count.
  return [img || '', bodyCell];
}

export default function parse(element, { document }) {
  const SELECTOR = '.experiencefragment.cmp-experience-fragment--contributor';
  const tiles = Array.from(document.querySelectorAll(SELECTOR));

  // All tiles already consumed (block built + siblings removed on an earlier call).
  if (tiles.length === 0) return;

  // Only the first tile (document order) builds the aggregate block.
  if (element !== tiles[0]) return;

  const cells = [];
  tiles.forEach((tile) => {
    const row = buildCardRow(tile, document);
    if (row) cells.push(row);
  });

  // Nothing extracted — unwrap gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });

  // Remove the remaining contributor tiles; their content is now inside the block.
  tiles.slice(1).forEach((tile) => tile.remove());

  element.replaceWith(block);
}
