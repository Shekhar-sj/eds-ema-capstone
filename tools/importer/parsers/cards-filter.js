/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-filter. Base: cards.
 * Source: https://wknd.site/us/en/adventures.html (.tabs.panelcontainer)
 * Generated: 2026-09-08
 *
 * Source is an AEM `.tabs.panelcontainer` with one tab panel per category
 * (All, Climbing, Cycling, Skiing, Surfing, Travel). The "All" panel holds
 * every adventure card; each category panel repeats a subset. Cards can appear
 * in more than one panel.
 *
 * Block model (blocks/cards-filter/cards-filter.js) — one row per card, 3 cells:
 *   cell 1: category label (text). Blank => card shows only under "All".
 *   cell 2: image (picture/img).
 *   cell 3: body — title link + short description.
 *
 * Strategy: emit each unique card exactly once. Assign each card its real
 * category from the first non-"All" panel it appears in (first-seen wins);
 * iterate the "All" panel to preserve full card order. Cards absent from every
 * category panel get a blank category (All-only), matching the block model.
 */
export default function parse(element, { document }) {
  const ORIGIN = 'https://wknd.site';

  const abs = (href) => {
    if (!href) return href;
    try {
      return new URL(href, ORIGIN).href;
    } catch (e) {
      return href;
    }
  };

  // Tab labels and panels are parallel (label[i] describes panel[i]).
  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tab, .cmp-tabs__tablist li'))
    .map((li) => li.textContent.trim());
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [class*="tabpanel"]'));

  if (!panels.length) {
    // Not a tab layout we recognise — leave content in place.
    element.replaceWith(...element.childNodes);
    return;
  }

  const itemsOf = (panel) => Array.from(panel.querySelectorAll('li.cmp-image-list__item, .cmp-image-list__item'));
  const hrefOf = (item) => {
    const link = item.querySelector('.cmp-image-list__item-title-link, .cmp-image-list__item-image-link, a[href]');
    return link ? link.getAttribute('href') : null;
  };

  // Identify the "All" panel (by label) — fall back to the first panel.
  let allIndex = labels.findIndex((l) => /^all$/i.test(l));
  if (allIndex < 0 || allIndex >= panels.length) allIndex = 0;

  // Map each card href -> real category from the first non-All panel it appears in.
  const hrefToCategory = new Map();
  panels.forEach((panel, i) => {
    if (i === allIndex) return;
    const category = (labels[i] || '').trim();
    if (!category) return;
    itemsOf(panel).forEach((item) => {
      const href = hrefOf(item);
      if (href && !hrefToCategory.has(href)) hrefToCategory.set(href, category);
    });
  });

  // Iterate the All panel to preserve full card set and order. If there is no
  // All panel, fall back to a de-duplicated union across all panels.
  let orderedItems = itemsOf(panels[allIndex]);
  if (!orderedItems.length) {
    const seen = new Set();
    orderedItems = [];
    panels.forEach((panel) => {
      itemsOf(panel).forEach((item) => {
        const href = hrefOf(item);
        const key = href || item;
        if (seen.has(key)) return;
        seen.add(key);
        orderedItems.push(item);
      });
    });
  }

  const cells = [];
  const seenHrefs = new Set();

  orderedItems.forEach((item) => {
    const href = hrefOf(item);
    if (href) {
      if (seenHrefs.has(href)) return; // de-duplicate within the panel
      seenHrefs.add(href);
    }

    // Image (cell 2).
    const img = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Title link + description (cell 3 body).
    const titleLink = item.querySelector('.cmp-image-list__item-title-link, a[href]');
    const titleSpan = item.querySelector('.cmp-image-list__item-title');
    const descEl = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

    const titleText = (titleSpan ? titleSpan.textContent : (titleLink ? titleLink.textContent : '')).trim();

    // Skip empty cards.
    if (!img && !titleText) return;

    const category = href && hrefToCategory.has(href) ? hrefToCategory.get(href) : '';

    // cell 1: category text
    const categoryCell = category;

    // cell 3: body — build a clean title link + description paragraph.
    const bodyCell = [];
    if (titleText && titleLink) {
      const a = document.createElement('a');
      a.setAttribute('href', abs(titleLink.getAttribute('href')));
      a.textContent = titleText;
      const h = document.createElement('h3');
      h.append(a);
      bodyCell.push(h);
    } else if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      bodyCell.push(h);
    }
    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      bodyCell.push(p);
    }

    cells.push([categoryCell, img || '', bodyCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-filter', cells });
  element.replaceWith(block);
}
