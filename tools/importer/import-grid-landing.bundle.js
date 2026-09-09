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

  // tools/importer/import-grid-landing.js
  var import_grid_landing_exports = {};
  __export(import_grid_landing_exports, {
    default: () => import_grid_landing_default
  });

  // tools/importer/parsers/cards-profile.js
  function precedingHeadingText(tile) {
    const isSectionHeading = (node) => {
      if (!node || !node.matches) return false;
      if (!node.matches("h1, h2")) return false;
      return !node.closest(".cmp-experience-fragment--contributor");
    };
    let el = tile;
    while (el) {
      let sib = el.previousElementSibling;
      while (sib) {
        let h = null;
        if (isSectionHeading(sib)) h = sib;
        else if (sib.querySelector) {
          const cand = sib.querySelector("h1, h2");
          if (isSectionHeading(cand)) h = cand;
        }
        if (h && h.textContent.trim()) return h.textContent.trim();
        sib = sib.previousElementSibling;
      }
      el = el.parentElement;
    }
    return "";
  }
  function buildCardRow(tile, document) {
    const img = tile.querySelector(".cmp-image img, .image img, img");
    const nameEl = tile.querySelector("h3.cmp-title__text, .cmp-title h3, h3");
    const roleEl = tile.querySelector("h5.cmp-title__text, .cmp-title h5, h5");
    const socialLinks = Array.from(tile.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button, a.cmp-button, .buildingblock a[href]"));
    const bodyCell = [];
    if (nameEl && nameEl.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.textContent = nameEl.textContent.trim();
      bodyCell.push(h3);
    }
    if (roleEl && roleEl.textContent.trim()) {
      const h5 = document.createElement("h5");
      h5.textContent = roleEl.textContent.trim();
      bodyCell.push(h5);
    }
    if (socialLinks.length) {
      const p = document.createElement("p");
      socialLinks.forEach((a, i) => {
        const link = document.createElement("a");
        link.href = a.getAttribute("href") || "#";
        const label = a.querySelector(".cmp-button__text");
        link.textContent = (label ? label.textContent : a.textContent).trim() || "Link";
        p.append(link);
        if (i < socialLinks.length - 1) p.append(document.createTextNode(" "));
      });
      bodyCell.push(p);
    }
    if (!img && bodyCell.length === 0) return null;
    return [img || "", bodyCell];
  }
  function parse(element, { document }) {
    const SELECTOR = ".experiencefragment.cmp-experience-fragment--contributor";
    const tiles = Array.from(document.querySelectorAll(SELECTOR));
    if (tiles.length === 0) return;
    const groups = [];
    let lastHeading = null;
    tiles.forEach((tile) => {
      const heading = precedingHeadingText(tile);
      if (groups.length === 0 || heading !== lastHeading) {
        groups.push([tile]);
        lastHeading = heading;
      } else {
        groups[groups.length - 1].push(tile);
      }
    });
    const group = groups.find((g) => g[0] === element);
    if (!group) return;
    const cells = [];
    group.forEach((tile) => {
      const row = buildCardRow(tile, document);
      if (row) cells.push(row);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-profile", cells });
    group.slice(1).forEach((tile) => tile.remove());
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

  // tools/importer/import-grid-landing.js
  var parsers = { "cards-profile": parse };
  var transformers = [transform];
  var PAGE_TEMPLATE = {
    name: "grid-landing",
    description: "Landing page: title + sectioned profile-tile grids with headings",
    urls: ["https://wknd.site/us/en/about-us.html"],
    blocks: [
      { name: "cards-profile", instances: [".experiencefragment.cmp-experience-fragment--contributor"] }
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
  var import_grid_landing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
  return __toCommonJS(import_grid_landing_exports);
})();
