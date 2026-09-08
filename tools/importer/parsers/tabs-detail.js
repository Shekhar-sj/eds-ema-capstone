/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-detail. Base: tabs.
 * Source: https://wknd.site/us/en/adventures/*.html (.tabs.panelcontainer)
 * Generated: 2026-09-08
 *
 * Library convention (Tabs): 2 columns, multiple rows. First row = block name.
 * Each subsequent row = one tab: [ tab label (mandatory), tab content (mandatory) ].
 *
 * Source: <ol.cmp-tabs__tablist> of <li.cmp-tabs__tab> (labels) and sibling
 * <div.cmp-tabs__tabpanel> panels, matched by order. Each panel holds a content
 * fragment with text/images inside .cmp-contentfragment__elements.
 */
export default function parse(element, { document }) {
  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  panels.forEach((panel, i) => {
    // Tab label matched to panel by index.
    const labelEl = labels[i];
    const label = labelEl ? labelEl.textContent.trim() : '';

    // Panel content: prefer the content-fragment body; fall back to the panel itself.
    const contentRoot = panel.querySelector('.cmp-contentfragment__elements') || panel;

    // Collect meaningful content nodes (paragraphs, lists, images, headings),
    // excluding the redundant content-fragment title heading duplicated per tab.
    const nodes = Array.from(
      contentRoot.querySelectorAll('p, ul, ol, img, h1, h2, h3, h4, h5, h6'),
    ).filter((node) => {
      if (node.classList && node.classList.contains('cmp-contentfragment__title')) return false;
      if (node.tagName === 'IMG') return true;
      return node.textContent.trim().length > 0 || !!node.querySelector('img');
    });

    // De-duplicate: drop nodes contained within another collected node
    // (e.g. a <p> wrapping an <img>, or nested list items).
    const contentCell = nodes.filter(
      (node) => !nodes.some((other) => other !== node && other.contains(node)),
    );

    if (label || contentCell.length) {
      cells.push([label, contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-detail', cells });
  element.replaceWith(block);
}
