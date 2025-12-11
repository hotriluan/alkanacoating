const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const base = 'http://127.0.0.1:8000';
    const outDir = 'tools/playwright/videos';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch();

    // Desktop recording
    const desktopContext = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        recordVideo: { dir: outDir, size: { width: 1366, height: 768 } }
    });
    const pageD = await desktopContext.newPage();
    await pageD.goto(base, { waitUntil: 'networkidle' });

    try {
        // Try to hover the mega menu trigger (by link text)
        const menuLink = await pageD.locator('text=Mega UI Sample').first();
        if (await menuLink.count() > 0) {
            await menuLink.hover();
            await pageD.waitForTimeout(2500);
        } else {
            // fallback: hover first nav item
            const firstNav = await pageD.locator('header nav a').first();
            if (await firstNav.count() > 0) {
                await firstNav.hover();
                await pageD.waitForTimeout(1500);
            }
        }
    } catch (e) {
        console.log('Desktop interaction failed:', e.message);
    }

    // Close context to finalize video
    await desktopContext.close();

    // Mobile recording
    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        recordVideo: { dir: outDir, size: { width: 390, height: 844 } }
    });

    const pageM = await mobileContext.newPage();
    await pageM.goto(base, { waitUntil: 'networkidle' });

    try {
        // Try to expand mobile mega menu by clicking the summary or menu label
        const details = await pageM.locator('text=Mega UI Sample').first();
        if (await details.count() > 0) {
            await details.click({ force: true });
            await pageM.waitForTimeout(2000);
        } else {
            // fallback click first details
            const firstSummary = await pageM.locator('details summary').first();
            if (await firstSummary.count() > 0) {
                await firstSummary.click();
                await pageM.waitForTimeout(1500);
            }
        }
    } catch (e) {
        console.log('Mobile interaction failed:', e.message);
    }

    await mobileContext.close();
    await browser.close();

    // Find produced video files
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
    console.log('Recorded files:', files);
    console.log('Videos are in:', outDir);
})();
