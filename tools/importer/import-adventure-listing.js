/* eslint-disable */
/* global WebImporter */
import heroBannerParser from './parsers/hero-banner.js';
import cardsFilterParser from './parsers/cards-filter.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = { 'hero-banner': heroBannerParser, 'cards-filter': cardsFilterParser };
const transformers = [wkndCleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'adventure-listing',
  description: 'Adventure listing: title, hero banner, filterable card grid',
  urls: ['https://wknd.site/us/en/adventures.html'],
  blocks: [
    { name: 'hero-banner', instances: ['.teaser.cmp-teaser--hero'] },
    { name: 'cards-filter', instances: ['.tabs.panelcontainer'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => { try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); } });
}
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((bd) => { bd.instances.forEach((sel) => { document.querySelectorAll(sel).forEach((el) => pageBlocks.push({ name: bd.name, selector: sel, element: el, section: bd.section || null })); }); });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}
// Replace a decorated block's contents with a dynamic-listing config table so
// it populates from the query index at render time. `limit` 0 means "all".
function makeDynamic(document, blockEl, name, source, limit) {
  const table = WebImporter.Blocks.createBlock(document, {
    name,
    cells: limit > 0 ? [[source], [String(limit)]] : [[source]],
  });
  blockEl.replaceWith(table);
}
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      // The adventures grid is dynamic (lists every adventure from the index,
      // with index-driven category filter tabs); the hero banner stays authored.
      if (block.name === 'cards-filter') {
        makeDynamic(document, block.element, 'cards-filter', 'adventures', 0);
        return;
      }
      const parser = parsers[block.name];
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); } }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr'); main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
