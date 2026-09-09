/* eslint-disable */
/* global WebImporter */
import columnsAuthorParser from './parsers/columns-author.js';
import cardsRelatedParser from './parsers/cards-related.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = { 'columns-author': columnsAuthorParser, 'cards-related': cardsRelatedParser };
const transformers = [wkndCleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'article-detail',
  description: 'Magazine article: hero, title, byline, long-form body, author bio, related stories',
  urls: ['https://wknd.site/us/en/magazine/arctic-surfing.html'],
  blocks: [
    { name: 'columns-author', instances: ['.byline', '.cmp-byline'] },
    { name: 'cards-related', instances: ['.list.cmp-list--upnext'] },
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
// Append key/value rows to the Metadata block built by createMetadata (a <table>
// whose header reads "Metadata"). These rows become page metadata / query-index
// columns. Blank values skipped; existing keys not duplicated.
function appendMetadata(main, document, fields) {
  const tables = [...main.querySelectorAll('table')];
  const table = tables.find((t) => {
    const th = t.querySelector('tr th, tr td');
    return th && th.textContent.trim().toLowerCase() === 'metadata';
  });
  if (!table) return;
  const existing = new Set(
    [...table.querySelectorAll('tr')]
      .map((tr) => tr.querySelector('td')?.textContent.trim().toLowerCase())
      .filter(Boolean),
  );
  Object.entries(fields)
    .filter(([k, v]) => v && String(v).trim() && !existing.has(k.toLowerCase()))
    .forEach(([key, value]) => {
      const tr = document.createElement('tr');
      const k = document.createElement('td');
      k.textContent = key;
      const v = document.createElement('td');
      v.textContent = String(value).trim();
      tr.append(k, v);
      table.append(tr);
    });
}
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    // dedupe: .byline and .cmp-byline may both match the same author element
    const seen = new Set();
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE).filter((b) => {
      if (seen.has(b.element)) return false; seen.add(b.element); return true;
    });
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); } }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr'); main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    appendMetadata(main, document, { Template: PAGE_TEMPLATE.name });
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
