const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const base = 'http://127.0.0.1:8000';
    const outDir = 'tools/playwright/screens';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch();
    const contextDesktop = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const pageDesktop = await contextDesktop.newPage();
    await pageDesktop.goto(base, { waitUntil: 'networkidle' });
    await pageDesktop.screenshot({ path: outDir + '/home-desktop.png', fullPage: true });

    // Mobile
    const iPhone = { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)' };
    const contextMobile = await browser.newContext(iPhone);
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto(base, { waitUntil: 'networkidle' });
    await pageMobile.screenshot({ path: outDir + '/home-mobile.png', fullPage: true });

    await browser.close();
    console.log('Screenshots saved to:', outDir);
})();
