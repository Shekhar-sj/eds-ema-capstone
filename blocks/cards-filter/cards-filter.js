import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';
import { queryIndex } from '../../scripts/ffetch.js';

/**
 * Filterable adventure card grid.
 *
 * Two modes:
 *  - Static: each authored row is a card —
 *      cell 1: category label (optional; blank => "All" only)
 *      cell 2: image (picture)
 *      cell 3: body (title link + short description)
 *  - Dynamic: a single-cell first row reading "adventures" (optionally a second
 *    row with a numeric limit) populates cards from the query index, filtered to
 *    the adventure-detail template. Category comes from each row's `category`
 *    field when indexed.
 *
 * A tab bar (All + one tab per distinct category, in first-seen order) is
 * rendered above the grid; clicking a tab shows only the matching cards.
 */

/** Detect dynamic config from authored rows. Returns null for static blocks. */
function readConfig(block) {
  const rows = [...block.children];
  if (!rows.length) return null;
  const firstCells = [...rows[0].children];
  if (firstCells.length !== 1) return null;
  if (firstCells[0].textContent.trim().toLowerCase() !== 'adventures') return null;
  let limit = 0;
  if (rows[1]) {
    const n = parseInt(rows[1].textContent.trim(), 10);
    if (!Number.isNaN(n)) limit = n;
  }
  return { template: 'adventure-detail', limit };
}

/** Build a card <li> from an index row (dynamic mode). */
function cardFromEntry(entry) {
  const li = document.createElement('li');
  const category = (entry.category || '').trim();
  if (category) li.dataset.category = toClassName(category);

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-filter-card-image';
  if (entry.image) {
    const pic = createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]);
    const a = document.createElement('a');
    a.href = entry.path;
    a.append(pic);
    imageDiv.append(a);
  }

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-filter-card-body';
  const titleWrap = document.createElement('p');
  const titleLink = document.createElement('a');
  titleLink.href = entry.path;
  titleLink.textContent = entry.title || entry.path;
  titleWrap.append(titleLink);
  bodyDiv.append(titleWrap);
  if (entry.description) {
    const desc = document.createElement('span');
    desc.className = 'cards-filter-card-description';
    desc.textContent = entry.description;
    bodyDiv.append(desc);
  }

  li.append(imageDiv, bodyDiv);
  return li;
}

/** Render the tab bar + grid, wiring up filter behavior. */
function render(block, ul, categories) {
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';

  if (categories.length) {
    const tablist = document.createElement('div');
    tablist.className = 'cards-filter-tablist';
    tablist.setAttribute('role', 'tablist');

    const makeTab = (label, key, active) => {
      const button = document.createElement('button');
      button.className = 'cards-filter-tab';
      button.type = 'button';
      button.textContent = label;
      button.dataset.filter = key;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.addEventListener('click', () => {
        tablist.querySelectorAll('.cards-filter-tab').forEach((b) => b.setAttribute('aria-selected', 'false'));
        button.setAttribute('aria-selected', 'true');
        ul.querySelectorAll(':scope > li').forEach((li) => {
          const show = key === '' || li.dataset.category === key;
          li.hidden = !show;
        });
      });
      return button;
    };

    tablist.append(makeTab('All', '', true));
    categories.forEach((cat) => tablist.append(makeTab(cat, toClassName(cat), false)));
    block.append(tablist);
  }

  block.append(ul);
}

/** Static authoring path (original behavior). */
function decorateStatic(block) {
  const categories = [];
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    let category = '';
    if (cells.length > 1) {
      category = cells[0].textContent.trim();
      cells[0].remove();
    }
    const categoryKey = category ? toClassName(category) : '';
    if (category && !categories.includes(category)) categories.push(category);

    const li = document.createElement('li');
    if (categoryKey) li.dataset.category = categoryKey;
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-filter-card-image';
      else div.className = 'cards-filter-card-body';
    });
    ul.append(li);
  });
  render(block, ul, categories);
}

export default async function decorate(block) {
  const config = readConfig(block);

  if (!config) {
    decorateStatic(block);
    return;
  }

  let entries = (await queryIndex())
    .filter((e) => e.template === config.template && e.title);
  entries.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  if (config.limit > 0) entries = entries.slice(0, config.limit);

  const categories = [];
  const ul = document.createElement('ul');
  entries.forEach((entry) => {
    const cat = (entry.category || '').trim();
    if (cat && !categories.includes(cat)) categories.push(cat);
    ul.append(cardFromEntry(entry));
  });
  categories.sort();

  render(block, ul, categories);
}
