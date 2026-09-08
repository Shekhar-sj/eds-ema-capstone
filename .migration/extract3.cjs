const { chromium } = require('/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-catalog-pages/scripts/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://wknd.site/us/en/magazine/arctic-surfing.html', { waitUntil: 'networkidle', timeout: 60000 });

  const result = await page.evaluate(() => {
    const out = {};
    const list = document.querySelector('.list.cmp-list--upnext');
    const a = list.querySelector('a.cmp-list__item-link');
    function st(el, pseudo) {
      if (!el) return null;
      const s = getComputedStyle(el, pseudo || null);
      const props = ['border','border-left','border-top','box-shadow','outline','background','background-color','padding','margin','content','width','height','position','left','display'];
      const o = {};
      props.forEach((p) => { o[p] = s.getPropertyValue(p); });
      return o;
    }
    out.a = st(a);
    out.aBefore = st(a, '::before');
    out.aAfter = st(a, '::after');
    // title & date spans
    const title = list.querySelector('.cmp-list__item-title');
    const date = list.querySelector('.cmp-list__item-date');
    out.titleBox = st(title);
    out.dateBox = st(date);
    return out;
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
