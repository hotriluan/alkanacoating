const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({ headless:false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('request', req => console.log('REQ:', req.method(), req.url()));
  await page.addInitScript(() => localStorage.setItem('admin_token','test-token'));
  await page.goto('http://localhost:5173/admin/menus', { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  await browser.close();
})();
