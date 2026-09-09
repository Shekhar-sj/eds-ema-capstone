/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import tableSpecsParser from './parsers/table-specs.js';
import tabsDetailParser from './parsers/tabs-detail.js';

import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = {
  'carousel-hero': carouselHeroParser,
  'table-specs': tableSpecsParser,
  'tabs-detail': tabsDetailParser,
};

const transformers = [wkndCleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'Adventure detail page: hero carousel, spec sidebar, tabbed content body',
  urls: ['https://wknd.site/us/en/adventures/bali-surf-camp.html'],
  blocks: [
    { name: 'carousel-hero', instances: ['.carousel.cmp-carousel--mini', '.carousel.cmp-carousel--hero'] },
    { name: 'table-specs', instances: ['.contentfragment.cmp-contentfragment--elements'] },
    { name: 'tabs-detail', instances: ['.tabs.panelcontainer'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try { transformerFn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// Append key/value rows to the Metadata block produced by
// WebImporter.rules.createMetadata. That helper builds a <table> whose header
// cell reads "Metadata"; each field is a <tr><td>key</td><td>value</td></tr>.
// These rows become page metadata (and query-index columns). Blank values are
// skipped; an existing key is not duplicated.
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
    const { document, url, html, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);

    // Capture the adventure "Activity" spec (Climbing/Cycling/Skiing/Surfing/
    // Travel/…) BEFORE the parsers replace the content-fragment element — used
    // as the query-index Category so the adventures filter is index-driven.
    let category = '';
    const activityEl = document.querySelector('.cmp-contentfragment__element--activity .cmp-contentfragment__element-value');
    if (activityEl) category = activityEl.textContent.trim();

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      }
    });


    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Add Template + Category so the page metadata (and query index) carry them.
    appendMetadata(main, document, { Template: PAGE_TEMPLATE.name, Category: category });
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
