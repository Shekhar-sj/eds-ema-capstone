import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * Filterable adventure card grid.
 *
 * Authoring model (each card = one row):
 *   cell 1: category label (e.g. "Climbing"). Optional - blank/omitted => card
 *           appears only under "All".
 *   cell 2: image (picture)
 *   cell 3: body (title link + short description)
 *
 * A tab bar (All + one tab per distinct category, in first-seen order) is
 * rendered above the grid; clicking a tab shows only the matching cards.
 */
export default function decorate(block) {
  const categories = [];

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];

    // First cell is the category label (text only). Pull it out of the card.
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

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';

  // Build the filter tab bar (All + one per category).
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
