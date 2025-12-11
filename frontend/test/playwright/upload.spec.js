import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Mocked upload response
const mockUploadResponse = {
  filename: 'mock_promo.jpg',
  url: 'http://localhost:8000/storage/menus/mock_promo.jpg',
  medium_url: 'http://localhost:8000/storage/menus/medium_mock_promo.jpg',
  thumb_url: 'http://localhost:8000/storage/menus/thumb_mock_promo.jpg',
  small_url: 'http://localhost:8000/storage/menus/small_mock_promo.jpg'
};

test('admin promo upload flow (mocked)', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  // ensure viewport for admin
  await page.setViewportSize({ width: 1280, height: 900 });

  // set a fake token so api client attaches Authorization header
  await page.addInitScript(() => {
    localStorage.setItem('admin_token', 'test-token');
  });

  // intercept the upload endpoint and return mocked response
  await page.route('**/admin/menus/upload-asset', async route => {
    const request = route.request();
    // respond with mocked JSON after a small delay to simulate upload
    await new Promise(r => setTimeout(r, 100));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUploadResponse) });
  });

  // intercept GET /admin/menus so the admin list renders (simulate logged-in response)
  // Intercept frontend and backend API variants to ensure admin list loads
  const fulfillEmpty = async (route) => {
    if (route.request().method().toLowerCase() === 'get') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    } else {
      await route.continue();
    }
  };
  await page.route('**/admin/menus', fulfillEmpty);
  await page.route('**/api/admin/menus', fulfillEmpty);
  await page.route('http://localhost:8000/api/admin/menus', fulfillEmpty);

  // intercept menu save to verify payload
  let savedPayload = null;
  await page.route('**/admin/menus', async route => {
    if (route.request().method().toLowerCase() === 'post') {
      const postData = await route.request().postData();
      try {
        savedPayload = JSON.parse(postData);
      } catch (e) {
        savedPayload = postData;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    } else {
      route.continue();
    }
  });

  await page.goto(`${base}/admin/menus`, { waitUntil: 'load' });

  // Wait for the admin menus page to render
  await page.waitForSelector('h1', { timeout: 20000 });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('h1')).some(h => h.textContent.includes('Quản lý Menu')) , { timeout: 20000 });

  // Click "Thêm Menu" button (appears on the admin menus page)
  await page.click('button:has-text("Thêm Menu")');
  // Wait for modal form to appear
  await page.waitForSelector('form', { timeout: 10000 });

  // Fill required fields
  await page.fill('input[name="name"]', 'E2E Promo Test');
  await page.fill('input[name="url"]', '/e2e-promo');
  // choose mega type
  await page.selectOption('select[name="type"]', 'mega');

  // Ensure payload exists
  await page.click('button:has-text("Thêm cột")');

  // Create a temporary small image file to upload
  const imgPath = path.join(process.cwd(), 'test', 'playwright', 'tmp-promo.jpg');
  // create a 800x600 red JPEG using a small base64 string (1x1 PNG scaled is tricky); we'll write a placeholder binary
  fs.writeFileSync(imgPath, Buffer.from([0xff,0xd8,0xff,0xd9]));

  // Upload promo image via the promo file input (located near the "Promo title" label)
  const promoFileInput = page.locator('xpath=//label[contains(text(), "Promo title")]/following::input[@type="file"][1]');
  if (!(await promoFileInput.count())) {
    // fallback to any file input
    const anyFile = page.locator('input[type="file"]').last();
    await anyFile.setInputFiles(imgPath);
  } else {
    await promoFileInput.setInputFiles(imgPath);
  }

  // Wait for preview to update: look for any image element with src containing the mocked filename
  await page.waitForSelector(`img[src*="${mockUploadResponse.filename}"]`, { timeout: 5000 }).catch(() => {});
  // small additional wait to ensure form state updated
  await page.waitForTimeout(300);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait a moment for save route to be caught
  await page.waitForTimeout(300);

  // Assertions
  expect(savedPayload).not.toBeNull();
  // payload should contain promo_image filename from mocked response
  expect(savedPayload.promo_image).toBe(mockUploadResponse.filename);

  // cleanup temp file
  try { fs.unlinkSync(imgPath); } catch (e) {}
});
