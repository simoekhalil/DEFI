const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Simple Token Purchase - No Test Framework
 * Direct script execution
 */

(async () => {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  
  console.log('🚀 Starting token purchase flow...');
  console.log(`Extension: ${extensionPath}\n`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    slowMo: 100
  });

  const context = await browser.newContext({
    bypassCSP: true
  });

  const page = await context.newPage();

  try {
    console.log('📍 Step 1: Loading Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { timeout: 60000 });
    console.log('✅ Page loaded\n');

    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'purchase-test-1.png', fullPage: true });
    console.log('📸 Screenshot 1 saved\n');

    console.log('🔍 Step 2: Analyzing page...');
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasConnect: document.body.innerText.toLowerCase().includes('connect'),
        hasBuy: document.body.innerText.toLowerCase().includes('buy'),
      };
    });

    console.log(`   Title: ${pageInfo.title}`);
    console.log(`   URL: ${pageInfo.url}`);
    console.log(`   Has Connect: ${pageInfo.hasConnect}`);
    console.log(`   Has Buy: ${pageInfo.hasBuy}\n`);

    console.log('⏳ Keeping browser open for 60 seconds...');
    console.log('   You can manually interact with the page\n');
    
    await page.waitForTimeout(60000);

    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Browser closed');
  }
})();






