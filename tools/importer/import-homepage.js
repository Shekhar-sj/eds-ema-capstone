/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsArticleParser from './parsers/cards-article.js';
import heroBannerParser from './parsers/hero-banner.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-featured': columnsFeaturedParser,
  'cards-article': cardsArticleParser,
  'hero-banner': heroBannerParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Home landing page: full-width hero carousel, featured-article split panel, then multiple horizontal card grids (recent articles, next adventures) with section headings',
  urls: [
    'https://wknd.site/us/en.html',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.carousel.cmp-carousel--hero'],
    },
    {
      name: 'columns-featured',
      instances: ['.teaser.cmp-teaser--featured'],
    },
    {
      name: 'cards-article',
      instances: ['.image-list.list'],
    },
    {
      name: 'hero-banner',
      instances: ['.teaser.cmp-teaser--hero.cmp-teaser--imagebottom'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    //    The homepage has two cards-article grids: the FIRST ("Recent Articles")
    //    becomes a dynamic latest-4 article listing; the SECOND ("Next
    //    Adventures") becomes a dynamic latest-4 adventure listing. Both are
    //    swapped for a config table the block reads at render time.
    let cardGridIndex = 0;
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      if (block.name === 'cards-article') {
        const source = cardGridIndex === 0 ? 'articles' : 'adventures';
        cardGridIndex += 1;
        const table = WebImporter.Blocks.createBlock(document, {
          name: 'cards-article',
          cells: [[source], ['4']],
        });
        block.element.replaceWith(table);
        return;
      }
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (root URL → /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
