/*
 * Table Specs Block
 * Renders a vertical list of spec rows (label + value) as a definition list,
 * matching the WKND adventure-detail content fragment sidebar.
 */

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const dl = document.createElement('dl');
  dl.className = 'table-specs-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const rowEl = document.createElement('div');
    rowEl.className = 'table-specs-row';

    const dt = document.createElement('dt');
    dt.className = 'table-specs-label';
    dt.innerHTML = cells[0] ? cells[0].innerHTML : '';

    const dd = document.createElement('dd');
    dd.className = 'table-specs-value';
    dd.innerHTML = cells[1] ? cells[1].innerHTML : '';

    rowEl.append(dt, dd);
    dl.append(rowEl);
  });

  block.replaceChildren(dl);
}
