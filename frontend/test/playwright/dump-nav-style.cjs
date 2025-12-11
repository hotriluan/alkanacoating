const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:5173', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    const visible = await page.evaluate(() => {
        const nav = document.querySelector('nav[role="menubar"]');
        if (!nav) return { found: false };
        const style = window.getComputedStyle(nav);
        return { found: true, display: style.display, width: window.innerWidth, className: nav.className };
    });
    console.log('Nav status:', visible);
    await browser.close();
})();
