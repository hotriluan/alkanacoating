const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('admin_token','test-token'));
  await page.goto('http://localhost:5173/admin/menus', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const buttons = await page.$$eval('button', btns => btns.map(b => ({text: b.innerText.trim(), visible: b.offsetParent !== null})).slice(0,40));
  console.log('Buttons:', buttons);
  await browser.close();
})();
