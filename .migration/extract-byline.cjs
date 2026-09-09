const PW = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-catalog-pages/scripts/node_modules/playwright';
const { chromium } = require(PW);
const fs = require('fs');

const SRC = 'https://wknd.site/us/en/magazine/arctic-surfing.html';
const OUT = '/backups/Shekhar-sj/eds-ema-capstone/repo/.migration/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(SRC, { waitUntil: 'networkidle', timeout: 60000 });

  const data = await page.evaluate(() => {
    const el = document.querySelector('.cmp-byline') || document.querySelector('.byline');
    if (!el) {
      return { error: 'byline not found', classes: [...document.querySelectorAll('[class*="byline"]')].map(e => e.className) };
    }
    const cs = (n) => {
      const s = getComputedStyle(n);
      const out = {};
      ['display','flex-direction','align-items','justify-content','gap','column-gap','row-gap',
       'padding','padding-top','padding-bottom','padding-left','padding-right',
       'margin','margin-top','margin-bottom','background-color','color','font-family','font-size','font-weight',
       'line-height','text-transform','letter-spacing','border-radius','width','height',
       'object-fit','border','border-top','text-align'].forEach(p => out[p] = s.getPropertyValue(p));
      return out;
    };
    const rect = (n) => { const r = n.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };

    const result = { root: { tag: el.tagName, class: el.className, style: cs(el), rect: rect(el), html: el.outerHTML } };

    const img = el.querySelector('img');
    if (img) result.img = { style: cs(img), rect: rect(img), natural: { w: img.naturalWidth, h: img.naturalHeight } };

    const heads = [...el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div,a')];
    result.texts = heads.filter(n => n.children.length === 0 && n.textContent.trim()).map(n => ({
      tag: n.tagName, class: n.className, text: n.textContent.trim().slice(0,40), style: cs(n)
    }));
    return result;
  });

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(OUT + 'byline-source.json', JSON.stringify(data, null, 2));

  try {
    let el = await page.$('.cmp-byline');
    if (!el) el = await page.$('.byline');
    if (el) { await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: OUT + 'source-byline.png' }); }
  } catch (e) { console.log('screenshot err', e.message); }

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
