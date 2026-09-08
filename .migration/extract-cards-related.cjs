const { chromium } = require('/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-catalog-pages/scripts/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://wknd.site/us/en/magazine/arctic-surfing.html', { waitUntil: 'networkidle', timeout: 60000 });

  try { await page.click('button:has-text("Accept")', { timeout: 2000 }); } catch (e) {}

  const result = await page.evaluate(() => {
    const out = {};
    const list = document.querySelector('.list.cmp-list--upnext');
    if (!list) return { error: 'list not found' };

    function styles(el, props) {
      if (!el) return null;
      const s = getComputedStyle(el);
      const o = {};
      props.forEach((p) => { o[p] = s.getPropertyValue(p); });
      const r = el.getBoundingClientRect();
      o._rect = { w: Math.round(r.width), h: Math.round(r.height) };
      o._tag = el.tagName.toLowerCase();
      o._class = el.className;
      return o;
    }

    const boxProps = ['display','flex-direction','gap','padding','margin','border-top','border-top-width','border-top-style','border-top-color','border-bottom','list-style','width'];
    const textProps = ['font-family','font-size','font-weight','line-height','color','text-transform','letter-spacing','text-decoration-line','margin','padding','display'];

    out.list = styles(list, boxProps);

    const items = list.querySelectorAll('li');
    out.itemCount = items.length;
    if (items[0]) {
      out.item0 = styles(items[0], boxProps);
      const link = items[0].querySelector('a');
      out.item0Link = styles(link, textProps);
      const titleEl = items[0].querySelector('.cmp-list__item-title') || (link && link.firstElementChild) || link;
      out.item0Title = styles(titleEl, textProps);
      const dateEl = items[0].querySelector('.cmp-list__item-date') || items[0].querySelector('span:not(.cmp-list__item-title)');
      out.item0Date = styles(dateEl, textProps);
      out.item0html = items[0].outerHTML.slice(0, 800);
    }
    if (items[1]) out.item1 = styles(items[1], boxProps);
    out.listHtml = list.outerHTML.slice(0, 500);
    return out;
  });

  console.log(JSON.stringify(result, null, 2));

  const el = await page.$('.list.cmp-list--upnext');
  if (el) {
    await el.screenshot({ path: '/backups/Shekhar-sj/eds-ema-capstone/repo/.migration/source-cards-related.png' });
    console.log('SCREENSHOT saved');
  }
  await browser.close();
})();
