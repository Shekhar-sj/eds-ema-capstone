const { chromium } = require('/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-catalog-pages/scripts/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/us/en/magazine/arctic-surfing', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const block = document.querySelector('.cards-related');
    if (!block) return { error: 'not found' };
    function describe(el, d) {
      if (d > 5) return '...';
      const cls = el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : '';
      const kids = [...el.children].map((c) => describe(c, d + 1));
      return { t: el.tagName.toLowerCase() + cls, k: kids.length ? kids : undefined };
    }
    // computed check on card-body & link
    const body = block.querySelector('.cards-related-card-body');
    const link = body && body.querySelector('a');
    const s = link ? getComputedStyle(link) : null;
    const bs = body ? getComputedStyle(body) : null;
    return {
      status: block.dataset.blockStatus,
      appear: document.body.classList.contains('appear'),
      tree: describe(block, 0),
      linkColor: s && s.color,
      linkTransform: s && s.textTransform,
      linkSize: s && s.fontSize,
      bodyBorderLeft: bs && bs.borderLeft,
    };
  });
  console.log(JSON.stringify(info, null, 2));

  const el = await page.$('.cards-related');
  if (el) {
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: '/backups/Shekhar-sj/eds-ema-capstone/repo/.migration/preview-cards-related.png' });
    console.log('PREVIEW saved');
  }
  await browser.close();
})();
