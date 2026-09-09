const { chromium } = require('/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-catalog-pages/scripts/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://wknd.site/us/en/magazine/arctic-surfing.html', { waitUntil: 'networkidle', timeout: 60000 });

  const result = await page.evaluate(() => {
    const out = {};
    const list = document.querySelector('.list.cmp-list--upnext');
    const ul = list.querySelector('ul.cmp-list');
    function st(el, props, pseudo) {
      if (!el) return null;
      const s = getComputedStyle(el, pseudo || null);
      const o = {};
      props.forEach((p) => { o[p] = s.getPropertyValue(p); });
      return o;
    }
    const bp = ['border-left','border-left-width','border-left-style','border-left-color','padding','margin','list-style','content','width','background'];
    out.list = st(list, bp);
    out.ul = st(ul, bp);
    const li = ul.querySelector('li');
    out.li = st(li, bp);
    out.liBefore = st(li, ['content','border-left','width','height','background','display','position'], '::before');
    out.ulBefore = st(ul, ['content','border-left','width','background','position'], '::before');
    return out;
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
