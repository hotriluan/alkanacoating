const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'load' });
    await page.waitForSelector('nav[role="menubar"]', { timeout: 20000 });
    const nav = await page.$('nav[role="menubar"]');
    const html = await nav.evaluate(n => n.outerHTML);
    fs.writeFileSync('test/playwright/nav-snapshot.html', html);
    console.log('Saved nav snapshot to test/playwright/nav-snapshot.html');
    await browser.close();
})();
