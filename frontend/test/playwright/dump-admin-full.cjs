const { chromium } = require('playwright');
const fs = require('fs');
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('admin_token','test-token'));
  await page.goto('http://localhost:5173/admin/menus', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('test/playwright/admin-full.html', html);
  console.log('Saved admin-full snapshot');
  await browser.close();
})();
