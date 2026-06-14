import { chromium } from 'playwright';

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`[BROWSER ERROR] ${error.message}`);
  });

  console.log('Navigating to http://localhost:5173/ ...');
  try {
    await page.goto('http://localhost:5173/', { timeout: 15000, waitUntil: 'networkidle' });
    console.log('Navigation successful!');
  } catch (err) {
    console.log('Navigation failed:', err.message);
  }

  await browser.close();
})();
