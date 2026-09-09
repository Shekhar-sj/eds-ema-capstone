/*
 * Lightweight reader for an AEM Edge Delivery query-index sheet.
 * Fetches /query-index.json (paginated) and exposes a small chainable API for
 * listings. The index for this site is small, so rows are loaded into an array
 * rather than streamed — keeping the helper simple and lint-clean.
 *
 * Usage:
 *   import { queryIndex } from '../../scripts/ffetch.js';
 *   const rows = (await queryIndex())
 *     .filter((e) => e.template === 'article-detail')
 *     .slice(0, 4);
 */

/**
 * Fetch all rows from a query-index sheet, following pagination.
 * Returns [] on any network/parse error so listings can fall back gracefully.
 * @param {string} [url='/query-index.json'] Sheet URL.
 * @param {string} [sheet=''] Optional named sheet.
 * @returns {Promise<Array<Object>>} All index rows.
 */
export async function queryIndex(url = '/query-index.json', sheet = '') {
  const chunkSize = 255;
  const rows = [];
  let offset = 0;
  let total = Infinity;

  /* eslint-disable no-await-in-loop */
  while (offset < total) {
    const params = new URLSearchParams(`offset=${offset}&limit=${chunkSize}`);
    if (sheet) params.append('sheet', sheet);
    let json;
    try {
      const resp = await fetch(`${url}?${params.toString()}`);
      if (!resp.ok) break;
      json = await resp.json();
    } catch (e) {
      break;
    }
    const data = json.data || [];
    rows.push(...data);
    total = json.total ?? rows.length;
    if (!data.length) break;
    offset += chunkSize;
  }
  /* eslint-enable no-await-in-loop */

  return rows;
}

export default queryIndex;
