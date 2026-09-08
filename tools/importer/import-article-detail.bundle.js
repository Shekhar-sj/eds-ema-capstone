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

  // tools/importer/import-article-detail.js
  var import_article_detail_exports = {};
  __export(import_article_detail_exports, {
    default: () => import_article_detail_default
  });

  // tools/importer/parsers/columns-author.js
  function parse(element, { document }) {
    const root = element.querySelector(".cmp-byline") || element;
    const image = root.querySelector(".cmp-byline__image picture, .cmp-byline__image img, picture, img");
    const name = root.querySelector(".cmp-byline__name, h1, h2, h3");
    const occupations = root.querySelector(".cmp-byline__occupations, p");
    if (!image && !name && !occupations) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const infoCell = [];
    if (name) infoCell.push(name);
    if (occupations) infoCell.push(occupations);
    const cells = [[image || "", infoCell.length ? infoCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-author", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-related.js
  function parse2(element, { document }) {
    const items = Array.from(element.querySelectorAll("li.cmp-list__item, .cmp-list__item, ul > li"));
    const cells = [];
    items.forEach((item) => {
      const link = item.querySelector("a.cmp-list__item-link, a");
      const titleText = item.querySelector(".cmp-list__item-title");
      const dateText = item.querySelector(".cmp-list__item-date");
      let titleEl;
      if (link) {
        titleEl = document.createElement("a");
        titleEl.href = link.getAttribute("href") || "";
        titleEl.textContent = (titleText ? titleText.textContent : link.textContent).trim();
      } else if (titleText) {
        titleEl = titleText;
      }
      const bodyCell = [];
      if (titleEl) bodyCell.push(titleEl);
      if (dateText) {
        const dateP = document.createElement("p");
        dateP.textContent = dateText.textContent.trim();
        bodyCell.push(dateP);
      }
      if (bodyCell.length) cells.push([bodyCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-related", cells });
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
    }
  }

  // tools/importer/import-article-detail.js
  var parsers = { "columns-author": parse, "cards-related": parse2 };
  var transformers = [transform];
  var PAGE_TEMPLATE = {
    name: "article-detail",
    description: "Magazine article: hero, title, byline, long-form body, author bio, related stories",
    urls: ["https://wknd.site/us/en/magazine/arctic-surfing.html"],
    blocks: [
      { name: "columns-author", instances: [".byline", ".cmp-byline"] },
      { name: "cards-related", instances: [".list.cmp-list--upnext"] }
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
  var import_article_detail_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const seen = /* @__PURE__ */ new Set();
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE).filter((b) => {
        if (seen.has(b.element)) return false;
        seen.add(b.element);
        return true;
      });
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
  return __toCommonJS(import_article_detail_exports);
})();
