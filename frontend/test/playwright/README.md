Playwright tests for Alkana Coating frontend

Setup:
1. From the `frontend` folder, install Playwright:
   npm install --save-dev @playwright/test

2. Install browsers (required by Playwright):
   npx playwright install

Run tests:
- From `frontend` folder:
  npx playwright test test/playwright/mega-menu.spec.js

Notes:
- Set environment variable PLAYWRIGHT_BASE_URL if your frontend preview runs on a different port.
- Tests assume the frontend server is running (`npm run preview` or `npm run dev`)
- For upload flow tests we recommend mocking network requests or running against a dev backend with a test S3/storage.
