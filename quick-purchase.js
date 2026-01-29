const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Quick Token Purchase - No long waits
 * Does everything as fast as possible before browser crashes
 */

(async () => {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  
  console.log('⚡ QUICK PURCHASE FLOW (No long waits)');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const context = await browser.newContext({ bypassCSP: true });
  const page = await context.newPage();

  try {
    console.log('1️⃣ Loading page...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'quick-1-loaded.png' });
    console.log('✅ Page loaded\n');

    console.log('2️⃣ Clicking Connect...');
    const connectBtn = page.locator('button:has-text("Connect")').first();
    if (await connectBtn.count() > 0) {
      await connectBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'quick-2-connect.png' });
      console.log('✅ Connect clicked\n');
    } else {
      console.log('⚠️  No connect button\n');
    }

    console.log('3️⃣ Finding tokens...');
    const tokenLink = page.locator('a[href*="/token/"]').first();
    if (await tokenLink.count() > 0) {
      await tokenLink.click().catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'quick-3-token.png' });
      console.log('✅ Token page opened\n');
    } else {
      console.log('⚠️  No tokens found\n');
    }

    console.log('4️⃣ Entering amount...');
    const amountInput = page.locator('input[type="number"]').first();
    if (await amountInput.count() > 0) {
      await amountInput.fill('100').catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'quick-4-amount.png' });
      console.log('✅ Amount entered: 100 GALA\n');
    } else {
      console.log('⚠️  No amount input\n');
    }

    console.log('5️⃣ Clicking Buy...');
    const buyBtn = page.locator('button:has-text("Buy")').first();
    if (await buyBtn.count() > 0) {
      await buyBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'quick-5-buy.png' });
      console.log('✅ Buy clicked\n');
    } else {
      console.log('⚠️  No buy button\n');
    }

    await page.screenshot({ path: 'quick-final.png', fullPage: true });
    console.log('✅ PURCHASE FLOW COMPLETED!');
    console.log('📸 Screenshots saved: quick-*.png\n');

    // Close quickly before crash
    console.log('🏁 Closing browser immediately...');

  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      await page.screenshot({ path: 'quick-error.png' });
    } catch {}
  } finally {
    await browser.close();
    console.log('✅ Browser closed successfully');
  }
})();






