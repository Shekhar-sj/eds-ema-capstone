/* eslint-disable */
/* global WebImporter */
import accordionFaqParser from './parsers/accordion-faq.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = { 'accordion-faq': accordionFaqParser };
const transformers = [wkndCleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'faq-page',
  description: 'FAQ page: title, hero, intro, accordion Q&A, contact sidebar',
  urls: ['https://wknd.site/us/en/faqs.html'],
  blocks: [
    { name: 'accordion-faq', instances: ['.accordion.panelcontainer'] },
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
