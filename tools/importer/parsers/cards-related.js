/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-related.
 * Base block: cards.
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Selector: .list.cmp-list--upnext
 *
 * A "Share this Story" related-articles list. Each <li.cmp-list__item> has a title link
 * (.cmp-list__item-title inside .cmp-list__item-link) and a date (.cmp-list__item-date).
 * There are NO images in this variant, so this follows the "Cards (no images)" convention:
 * a 1-column table where each row is a single cell holding the card's text content
 * (heading/title link + description/date).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('li.cmp-list__item, .cmp-list__item, ul > li'));

  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a.cmp-list__item-link, a');
    const titleText = item.querySelector('.cmp-list__item-title');
    const dateText = item.querySelector('.cmp-list__item-date');

    // Build a real anchor for the title so the href is preserved as a link.
    let titleEl;
    if (link) {
      titleEl = document.createElement('a');
      titleEl.href = link.getAttribute('href') || '';
      titleEl.textContent = (titleText ? titleText.textContent : link.textContent).trim();
    } else if (titleText) {
      titleEl = titleText;
    }

    // Single content cell per card (no images → 1 column).
    const bodyCell = [];
    if (titleEl) bodyCell.push(titleEl);
    if (dateText) {
      const dateP = document.createElement('p');
      dateP.textContent = dateText.textContent.trim();
      bodyCell.push(dateP);
    }

    if (bodyCell.length) cells.push([bodyCell]);
  });

  // Empty-block guard: no items found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-related', cells });
  element.replaceWith(block);
}
