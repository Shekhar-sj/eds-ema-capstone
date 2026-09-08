/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-08
 *
 * Library structure (Carousel): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one slide: [ image, textContent(title/description/CTA) ].
 */
export default function parse(element, { document }) {
  // Each carousel item is a slide; fall back to teasers if item wrapper differs.
  let slides = Array.from(element.querySelectorAll(':scope .cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll(':scope .teaser, :scope .cmp-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image cell
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content cell
    const textCell = [];
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
    );

    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));

    // Only add a slide row if it has at least an image or text content.
    if (image || textCell.length) {
      cells.push([image || '', textCell.length ? textCell : '']);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
