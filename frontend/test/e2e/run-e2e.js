#!/usr/bin/env node
/*
  Simple Puppeteer E2E test script:
  - Starts `npm run preview` on port 5173
  - Opens homepage, clicks the first category tile, waits for navigation to /san-pham
  - Observes network requests to ensure a /products?category=<id> request was made
  - Verifies that the product grid displays at least one product

  Note: This script requires puppeteer. Run `npm install --save-dev puppeteer` in frontend before running.
*/

import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const PREVIEW_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function waitForServer(url, timeout = 10000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        (function ping() {
            fetch(url)
                .then(res => {
                    if (res.ok) return resolve();
                    if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server'));
                    setTimeout(ping, 200);
                })
                .catch(() => {
                    if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server'));
                    setTimeout(ping, 200);
                })
        })();
    });
}

async function run() {
    // By default we DO NOT spawn the preview server (spawn can fail on some Windows setups).
    // Start preview manually in another terminal with `npm --prefix frontend run preview`.
    // If you want the script to spawn preview automatically, set START_PREVIEW=1 in env.
    const shouldStartPreview = process.env.START_PREVIEW === '1' || process.env.START_PREVIEW === 'true';
    let preview;
    if (shouldStartPreview) {
        console.log('Starting preview server (START_PREVIEW=1)...');
        try {
            preview = spawn(PREVIEW_CMD, ['run', 'preview'], { cwd: process.cwd(), stdio: 'inherit' });
        } catch (spawnErr) {
            console.error('Failed to spawn preview server:', spawnErr);
            console.error('Please start the preview server manually: `npm --prefix frontend run preview`');
            throw spawnErr;
        }
    } else {
        console.log('Skipping auto-start of preview server. Please run `npm --prefix frontend run preview` in another terminal.');
    }

    try {
        // Determine preview URL: prefer PREVIEW_URL, then PREVIEW_PORT, then probe common ports 5173-5179.
        const envPreviewUrl = process.env.PREVIEW_URL;
        const envPreviewPort = process.env.PREVIEW_PORT;

        let previewUrl = envPreviewUrl || (envPreviewPort ? `http://localhost:${envPreviewPort}` : null);

        const portsToTry = [5173, 5174, 5175, 5176, 5177, 5178, 5179];
        if (!previewUrl) {
            for (const p of portsToTry) {
                try {
                    await waitForServer(`http://localhost:${p}`, 1200);
                    previewUrl = `http://localhost:${p}`;
                    break;
                } catch (_) {
                    // try next
                }
            }
        } else {
            // If previewUrl provided, wait for it to be ready
            await waitForServer(previewUrl, 5000);
        }

        if (!previewUrl) {
            // fallback: try the default and let waitForServer fail with clearer message
            previewUrl = 'http://localhost:5173';
            await waitForServer(previewUrl, 5000);
        }

        console.log('Server is up at', previewUrl, ' - launching browser...');

        // Try to find a local Chrome/Edge executable. You can also set CHROME_PATH env var.
        let envPath = process.env.CHROME_PATH;
        const candidates = [];
        // If CHROME_PATH points to a directory, we'll expand it into common exe names
        if (envPath) {
            // normalize slashes
            envPath = envPath.replace(/"/g, '');
            candidates.push(envPath);
        }
        if (process.platform === 'win32') {
            candidates.push('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
            candidates.push('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe');
            candidates.push('C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe');
            candidates.push('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe');
            if (process.env.LOCALAPPDATA) {
                candidates.push(process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe');
                candidates.push(process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe');
            }
        } else if (process.platform === 'darwin') {
            candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
            candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
        } else {
            candidates.push('/usr/bin/google-chrome');
            candidates.push('/usr/bin/chromium-browser');
            candidates.push('/usr/bin/chromium');
            candidates.push('/usr/bin/google-chrome-stable');
        }

        // Expand any directory candidates into likely executable file paths
        const expanded = [];
        for (const c of candidates) {
            if (!c) continue;
            try {
                const s = fs.existsSync(c) && fs.statSync(c);
                if (s && s.isDirectory()) {
                    expanded.push(path.join(c, 'chrome.exe'));
                    expanded.push(path.join(c, 'msedge.exe'));
                    expanded.push(path.join(c, 'Google', 'Chrome', 'Application', 'chrome.exe'));
                    expanded.push(path.join(c, 'Application', 'chrome.exe'));
                } else {
                    expanded.push(c);
                }
            } catch (e) {
                expanded.push(c);
            }
        }

        // Add default common locations (preserve previous list)
        if (process.platform === 'win32') {
            expanded.push('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
            expanded.push('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe');
            expanded.push('C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe');
            expanded.push('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe');
            if (process.env.LOCALAPPDATA) {
                expanded.push(path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'));
                expanded.push(path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
            }
        }

        const chromePath = expanded.find(p => p && fs.existsSync(p) && fs.statSync(p).isFile());
        if (!chromePath) {
            console.error('No local Chrome/Edge executable found. Tried paths:');
            expanded.forEach(p => console.error('  -', p));
            console.error('\nOptions:');
            console.error('  - Install Google Chrome or Microsoft Edge');
            console.error('  - Or set CHROME_PATH env var to your browser executable path');
            console.error('Example (PowerShell): $env:CHROME_PATH = "C:\\\\Path\\\\to\\\\chrome.exe"; node ./frontend/test/e2e/run-e2e.js');
            throw new Error('No Chrome/Edge executable found for puppeteer-core');
        }

        const browser = await puppeteer.launch({ headless: false, executablePath: chromePath });
        const page = await browser.newPage();

        // capture network requests
        const requests = [];
        page.on('request', req => requests.push(req.url()));

        await page.goto(previewUrl, { waitUntil: 'networkidle2' });
        // Wait for heading text to ensure React hydration
        try {
            await page.waitForFunction(
                () => Array.from(document.querySelectorAll('h2')).some(h => h.textContent.includes('Danh mục sản phẩm')),
                { timeout: 20000 }
            );
        } catch (e) {
            console.error('Heading \"Danh mục sản phẩm\" not found after navigation. Page may not be hydrated.');
        }
        const pageTitle = await page.title();
        const pageUrl = page.url();
        console.log('Page loaded:', pageUrl, '| Title:', pageTitle);

        // Try several selectors for the category button
        let firstCat = null;
        let selectors = [
            'section.py-6 button',
            'section button',
            '.category-section button',
            'button',
        ];
        let foundSelector = null;
        for (let sel of selectors) {
            try {
                await page.waitForSelector(sel, { timeout: 10000 });
                firstCat = await page.$(sel);
                if (firstCat) {
                    foundSelector = sel;
                    break;
                }
            } catch (e) {
                // try next selector
            }
        }
        if (!firstCat) {
            // Fallback: print all button texts
            const allButtons = await page.$$('button');
            if (allButtons.length > 0) {
                const buttonTexts = [];
                for (let i = 0; i < allButtons.length; ++i) {
                    const txt = await allButtons[i].evaluate(el => el.innerText);
                    buttonTexts.push(`Button ${i + 1}: ${txt}`);
                }
                fs.writeFileSync('e2e-debug-buttons.txt', buttonTexts.join('\n'));
                console.error('No category button found. Found buttons:');
                buttonTexts.forEach(t => console.error(t));
                throw new Error('No category button matched selectors: ' + selectors.join(', ') + '\nSee e2e-debug-buttons.txt for all button texts.');
            } else {
                // No buttons at all, print first 500 chars of page HTML
                const html = await page.content();
                console.error('No buttons found. First 500 chars of HTML:');
                console.error(html.slice(0, 500));
                fs.writeFileSync('e2e-debug-homepage.html', html);
                throw new Error('No buttons found on homepage. See e2e-debug-homepage.html for page HTML.');
            }
        }

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            firstCat.click()
        ]);

        console.log('Navigated to:', page.url());

        // Look for products API call
        const productReq = requests.find(u => u.includes('/products') && u.includes('category='));
        if (!productReq) {
            console.error('No /products?category= request detected. Network requests:', requests.slice(-20));
            throw new Error('Product API call with category param not detected');
        }

        console.log('Detected product request:', productReq);

        // Check product grid shows items
        await page.waitForSelector('.grid .group, .grid [data-product-id], .grid article, .product-card', { timeout: 5000 }).catch(() => null);
        const productCount = await page.$$eval('.grid > *', els => els.length);
        console.log('Product grid child count:', productCount);
        if (productCount === 0) throw new Error('No products visible after filtering');

        await browser.close();
        console.log('E2E test passed');
    } catch (err) {
        console.error('E2E test failed:', err);
        process.exitCode = 1;
    } finally {
        // Kill preview only if we spawned it
        if (preview && typeof preview.kill === 'function') {
            try { preview.kill(); } catch (e) { }
        }
    }
}

run();
