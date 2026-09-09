import { createOptimizedPicture } from '../../scripts/aem.js';
import { queryIndex } from '../../scripts/ffetch.js';

/**
 * Build one card <li> (image cell + body cell) from an index row.
 * Mirrors the static DOM so the polished CSS applies unchanged.
 */
function cardFromEntry(entry) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-article-card-image';
  if (entry.image) {
    const pic = createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]);
    const a = document.createElement('a');
    a.href = entry.path;
    a.append(pic);
    imageDiv.append(a);
  }

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-article-card-body';
  const titleWrap = document.createElement('p');
  const titleLink = document.createElement('a');
  titleLink.href = entry.path;
  titleLink.textContent = entry.title || entry.path;
  titleWrap.append(titleLink);
  bodyDiv.append(titleWrap);
  if (entry.description) {
    const desc = document.createElement('span');
    desc.className = 'cards-article-card-description';
    desc.textContent = entry.description;
    bodyDiv.append(desc);
  }

  li.append(imageDiv, bodyDiv);
  return li;
}

/**
 * Read a dynamic-listing config from the block's authored rows, if present.
 * Convention: a single-cell first row naming the source ("articles"),
 * optionally a second row with a numeric limit. Returns null for static blocks.
 */
function readConfig(block) {
  const rows = [...block.children];
  if (!rows.length) return null;
  const firstCells = [...rows[0].children];
  if (firstCells.length !== 1) return null;
  const source = firstCells[0].textContent.trim().toLowerCase();
  const KNOWN = { articles: 'article-detail', adventures: 'adventure-detail' };
  if (!KNOWN[source]) return null;
  let limit = 0;
  if (rows[1]) {
    const n = parseInt(rows[1].textContent.trim(), 10);
    if (!Number.isNaN(n)) limit = n;
  }
  return { template: KNOWN[source], limit };
}

/** Decorate static authored cards (original behavior). */
function decorateStatic(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-article-card-image';
      } else {
        div.className = 'cards-article-card-body';
        const host = div.querySelector('a')?.parentElement || div;
        const desc = document.createElement('span');
        desc.className = 'cards-article-card-description';
        [...host.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            desc.append(node.textContent);
            node.remove();
          }
        });
        if (desc.textContent.trim()) div.append(desc);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}

export default async function decorate(block) {
  const config = readConfig(block);

  // Static block: keep authored cards.
  if (!config) {
    decorateStatic(block);
    return;
  }

  // Dynamic block: populate from the query index, filtered by template.
  let entries = (await queryIndex())
    .filter((e) => e.template === config.template && e.title);
  // Order newest-first. Prefer lastModified when the index provides it (a
  // pipeline-generated index at tools.aem.live populates it from publish time,
  // so republishing a page bubbles it up). Accept either a Unix timestamp
  // (seconds/millis) or a parseable date string. A manually-authored sheet has
  // no lastModified, so fall back to index position: rows are appended as pages
  // are added, so the LAST row is the newest — reverse to surface it first.
  const toTime = (v) => {
    if (v == null || v === '') return NaN;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
    const d = Date.parse(v);
    return Number.isNaN(d) ? NaN : d;
  };
  const hasDates = entries.some((e) => !Number.isNaN(toTime(e.lastModified)));
  if (hasDates) {
    entries.sort((a, b) => (toTime(b.lastModified) || 0) - (toTime(a.lastModified) || 0));
  } else {
    entries.reverse();
  }
  if (config.limit > 0) entries = entries.slice(0, config.limit);

  block.textContent = '';

  // Empty index (not yet published/indexed): leave block empty rather than error.
  if (!entries.length) return;

  const ul = document.createElement('ul');
  entries.forEach((entry) => ul.append(cardFromEntry(entry)));
  block.append(ul);
}
