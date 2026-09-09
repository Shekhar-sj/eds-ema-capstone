export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-featured-img-col');
        }
      }
    });
  });

  // buttonize a standalone CTA link (project decorateButtons only styles
  // strong/em-wrapped links, so the plain featured-article link is skipped)
  block.querySelectorAll('div:not(.columns-featured-img-col) > p > a[href]').forEach((a) => {
    const p = a.closest('p');
    if (p.textContent.trim() === a.textContent.trim() && !a.querySelector('img')) {
      p.classList.add('button-container');
      a.classList.add('button', 'accent');
    }
  });
}
