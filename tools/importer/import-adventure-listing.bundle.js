/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventure-listing.js
  var import_adventure_listing_exports = {};
  __export(import_adventure_listing_exports, {
    default: () => import_adventure_listing_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]:not([class*="pretitle"])');
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a, a.button")
    );
    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    ctaLinks.forEach((cta) => contentCell.push(cta));
    if (!image && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-filter.js
  function parse2(element, { document }) {
    const ORIGIN = "https://wknd.site";
    const abs = (href) => {
      if (!href) return href;
      try {
        return new URL(href, ORIGIN).href;
      } catch (e) {
        return href;
      }
    };
    const labels = Array.from(element.querySelectorAll(".cmp-tabs__tab, .cmp-tabs__tablist li")).map((li) => li.textContent.trim());
    const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [class*="tabpanel"]'));
    if (!panels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const itemsOf = (panel) => Array.from(panel.querySelectorAll("li.cmp-image-list__item, .cmp-image-list__item"));
    const hrefOf = (item) => {
      const link = item.querySelector(".cmp-image-list__item-title-link, .cmp-image-list__item-image-link, a[href]");
      return link ? link.getAttribute("href") : null;
    };
    let allIndex = labels.findIndex((l) => /^all$/i.test(l));
    if (allIndex < 0 || allIndex >= panels.length) allIndex = 0;
    const hrefToCategory = /* @__PURE__ */ new Map();
    panels.forEach((panel, i) => {
      if (i === allIndex) return;
      const category = (labels[i] || "").trim();
      if (!category) return;
      itemsOf(panel).forEach((item) => {
        const href = hrefOf(item);
        if (href && !hrefToCategory.has(href)) hrefToCategory.set(href, category);
      });
    });
    let orderedItems = itemsOf(panels[allIndex]);
    if (!orderedItems.length) {
      const seen = /* @__PURE__ */ new Set();
      orderedItems = [];
      panels.forEach((panel) => {
        itemsOf(panel).forEach((item) => {
          const href = hrefOf(item);
          const key = href || item;
          if (seen.has(key)) return;
          seen.add(key);
          orderedItems.push(item);
        });
      });
    }
    const cells = [];
    const seenHrefs = /* @__PURE__ */ new Set();
    orderedItems.forEach((item) => {
      const href = hrefOf(item);
      if (href) {
        if (seenHrefs.has(href)) return;
        seenHrefs.add(href);
      }
      const img = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link, a[href]");
      const titleSpan = item.querySelector(".cmp-image-list__item-title");
      const descEl = item.querySelector('.cmp-image-list__item-description, [class*="description"]');
      const titleText = (titleSpan ? titleSpan.textContent : titleLink ? titleLink.textContent : "").trim();
      if (!img && !titleText) return;
      const category = href && hrefToCategory.has(href) ? hrefToCategory.get(href) : "";
      const categoryCell = category;
      const bodyCell = [];
      if (titleText && titleLink) {
        const a = document.createElement("a");
        a.setAttribute("href", abs(titleLink.getAttribute("href")));
        a.textContent = titleText;
        const h = document.createElement("h3");
        h.append(a);
        bodyCell.push(h);
      } else if (titleText) {
        const h = document.createElement("h3");
        h.textContent = titleText;
        bodyCell.push(h);
      }
      if (descEl) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        bodyCell.push(p);
      }
      cells.push([categoryCell, img || "", bodyCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-filter", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "iframe"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        ".cmp-experiencefragment--header",
        "footer",
        ".cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav",
        "meta",
        "noscript",
        "link"
      ]);
      const h1 = element.querySelector("h1");
      if (h1) {
        const titleText = h1.textContent.trim().toLowerCase();
        element.querySelectorAll("h2, h3, h4").forEach((h) => {
          if (h.textContent.trim().toLowerCase() === titleText) h.remove();
        });
      }
    }
  }

  // tools/importer/import-adventure-listing.js
  var parsers = { "hero-banner": parse, "cards-filter": parse2 };
  var transformers = [transform];
  var PAGE_TEMPLATE = {
    name: "adventure-listing",
    description: "Adventure listing: title, hero banner, filterable card grid",
    urls: ["https://wknd.site/us/en/adventures.html"],
    blocks: [
      { name: "hero-banner", instances: [".teaser.cmp-teaser--hero"] },
      { name: "cards-filter", instances: [".tabs.panelcontainer"] }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((bd) => {
      bd.instances.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => pageBlocks.push({ name: bd.name, selector: sel, element: el, section: bd.section || null }));
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function makeDynamic(document, blockEl, name, source, limit) {
    const table = WebImporter.Blocks.createBlock(document, {
      name,
      cells: limit > 0 ? [[source], [String(limit)]] : [[source]]
    });
    blockEl.replaceWith(table);
  }
  var import_adventure_listing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        if (block.name === "cards-filter") {
          makeDynamic(document, block.element, "cards-filter", "adventures", 0);
          return;
        }
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name}:`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_adventure_listing_exports);
})();
