import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-article-card-image';
      } else {
        div.className = 'cards-article-card-body';
        // The title link and description share a wrapper (EDS wraps loose
        // content in a <p>). Pull the trailing description text node(s) and
        // wrap them in a span so they can be truncated to a single line.
        const host = div.querySelector('a')?.parentElement || div;
        const desc = document.createElement('span');
        desc.className = 'cards-article-card-description';
        [...host.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            desc.append(node.textContent);
            node.remove();
          }
        });
        if (desc.textContent.trim()) div.append(desc);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
