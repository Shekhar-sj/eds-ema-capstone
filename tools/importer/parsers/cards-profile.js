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
 * the About Us page). The tiles are split into groups by the section headings
 * that precede them ("Our Contributors" → 4 tiles, "WKND Guides" → 3 tiles): a
 * new group starts at any tile whose nearest preceding heading differs from the
 * previous tile's. Each group becomes its own 2-column cards-profile block, built
 * in place of that group's FIRST tile (the rest of the group's tiles are removed).
 * Every other invocation is a no-op, so parser-call order is irrelevant. The
 * section headings remain as default content between the two blocks.
 */

/**
 * Text of the nearest SECTION heading that precedes `tile` in document order —
 * used to detect the group boundary between "Our Contributors" and "WKND Guides".
 * Only h1/h2 count as section headings; the per-tile name/role headings (h3/h5
 * inside a contributor tile) are ignored so they don't create false boundaries.
 * Returns '' if none.
 */
function precedingHeadingText(tile) {
  const isSectionHeading = (node) => {
    if (!node || !node.matches) return false;
    if (!node.matches('h1, h2')) return false;
    // Ignore headings that live inside a contributor tile (per-person titles).
    return !node.closest('.cmp-experience-fragment--contributor');
  };
  let el = tile;
  while (el) {
    let sib = el.previousElementSibling;
    while (sib) {
      let h = null;
      if (isSectionHeading(sib)) h = sib;
      else if (sib.querySelector) {
        const cand = sib.querySelector('h1, h2');
        if (isSectionHeading(cand)) h = cand;
      }
      if (h && h.textContent.trim()) return h.textContent.trim();
      sib = sib.previousElementSibling;
    }
    el = el.parentElement;
  }
  return '';
}

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

  // All tiles already consumed (blocks built + siblings removed on an earlier call).
  if (tiles.length === 0) return;

  // Split tiles into contiguous groups by the section heading that precedes each
  // one. A new group begins whenever a tile's nearest preceding heading differs
  // from the previous tile's (e.g. "Our Contributors" → "WKND Guides"). This keeps
  // each section's people in their own block, split 4/3 on the About Us page.
  const groups = [];
  let lastHeading = null;
  tiles.forEach((tile) => {
    const heading = precedingHeadingText(tile);
    if (groups.length === 0 || heading !== lastHeading) {
      groups.push([tile]);
      lastHeading = heading;
    } else {
      groups[groups.length - 1].push(tile);
    }
  });

  // Each group is built in place of its FIRST tile. Only act when `element` is a
  // group leader; other invocations are no-ops (parser-call order is irrelevant).
  const group = groups.find((g) => g[0] === element);
  if (!group) return;

  const cells = [];
  group.forEach((tile) => {
    const row = buildCardRow(tile, document);
    if (row) cells.push(row);
  });

  // Nothing extracted — unwrap gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });

  // Remove this group's remaining tiles; their content is now inside the block.
  group.slice(1).forEach((tile) => tile.remove());

  element.replaceWith(block);
}
