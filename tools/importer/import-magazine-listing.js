/* eslint-disable */
/* global WebImporter */
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsArticleParser from './parsers/cards-article.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = {
  'columns-featured': columnsFeaturedParser,
  'cards-article': cardsArticleParser,
};
const transformers = [wkndCleanupTransformer];

// magazine.html: featured-article panel + "All Articles" card grid + "Members Only"
// teaser cards. Reuses homepage/article block variants (own script per plan).
const PAGE_TEMPLATE = {
  name: 'magazine-listing',
  description: 'Magazine landing: featured article panel, article card grid, members-only teasers',
  urls: ['https://wknd.site/us/en/magazine.html'],
  blocks: [
    { name: 'columns-featured', instances: ['.teaser.cmp-teaser--featured', '.teaser.cmp-teaser--list'] },
    { name: 'cards-article', instances: ['.image-list.list'] },
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
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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
