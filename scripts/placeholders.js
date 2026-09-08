import { toCamelCase } from './aem.js';

const placeholdersCache = {};

/**
 * Fetches placeholder key/value pairs from a `placeholders.json` sheet and
 * returns them as a camelCased key → value map. Results are cached per prefix.
 *
 * Sheet format (default AEM placeholders sheet):
 *   { data: [ { Key: 'previousSlide', Text: 'Previous Slide' }, ... ] }
 *
 * @param {string} [prefix=''] Path prefix for the placeholders sheet
 *   (e.g. '/us/en'). Defaults to the site root.
 * @returns {Promise<Object>} Map of camelCased keys to their text values.
 */
export async function fetchPlaceholders(prefix = '') {
  const key = prefix || 'default';
  if (!placeholdersCache[key]) {
    placeholdersCache[key] = fetch(`${prefix}/placeholders.json`)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => {
        const rows = json.data || [];
        return rows.reduce((acc, row) => {
          const name = row.Key || row.key;
          const value = row.Text ?? row.text ?? row.Value ?? row.value;
          if (name) acc[toCamelCase(name)] = value;
          return acc;
        }, {});
      })
      .catch(() => ({}));
  }
  return placeholdersCache[key];
}

export default fetchPlaceholders;
