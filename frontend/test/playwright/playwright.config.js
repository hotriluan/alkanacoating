// Minimal Playwright config for local run
const { devices } = require('@playwright/test');

module.exports = {
    testDir: __dirname,
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
        headless: false,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
        actionTimeout: 10000,
    },
};
