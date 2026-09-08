const PW = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-catalog-pages/scripts/node_modules/playwright';
const { chromium } = require(PW);
const fs = require('fs');

const URL = 'http://localhost:3000/us/en/magazine/arctic-surfing';
const OUT = '/backups/Shekhar-sj/eds-ema-capstone/repo/.migration/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const block = document.querySelector('.columns-author');
    if (!block) return { error: 'not found' };
    function describe(el, d) {
      if (d > 4) return '...';
      const cls = el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : '';
      return { tag: el.tagName.toLowerCase() + cls, children: [...el.children].map(c => describe(c, d + 1)) };
    }
    const img = block.querySelector('img');
    const name = block.querySelector('h2');
    const role = block.querySelector('p');
    const cs = (n) => { if(!n) return null; const s = getComputedStyle(n); const r = n.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), fs: s.fontSize, fw: s.fontWeight,
        ff: s.fontFamily.split(',')[0], lh: s.lineHeight, color: s.color, br: s.borderRadius,
        of: s.objectFit, tt: s.textTransform, margin: s.margin }; };
    const row = block.querySelector(':scope > div');
    const rs = row ? getComputedStyle(row) : null;
    return {
      status: block.dataset.blockStatus,
      tree: describe(block, 0),
      row: rs ? { display: rs.display, align: rs.alignItems, dir: rs.flexDirection, gap: rs.gap } : null,
      img: cs(img), name: cs(name), role: cs(role)
    };
  });
  console.log(JSON.stringify(info, null, 2));

  try {
    const el = await page.$('.columns-author');
    if (el) { await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: OUT + 'preview-byline.png' }); }
  } catch (e) { console.log('shot err', e.message); }
  await browser.close();
})();
