const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Diagnostic Script - Find where the crash happens
 */

(async () => {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  
  console.log('🔍 DIAGNOSTIC TEST - Finding crash point');
  console.log('='.repeat(60));

  let browser, context, page;

  try {
    console.log('Step 1: Launching browser...');
    browser = await chromium.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      slowMo: 100
    });
    console.log('✅ Browser launched\n');

    console.log('Step 2: Creating context...');
    context = await browser.newContext({
      bypassCSP: true
    });
    console.log('✅ Context created\n');

    console.log('Step 3: Creating page...');
    page = await context.newPage();
    console.log('✅ Page created\n');

    console.log('Step 4: Navigating to Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    console.log('✅ Navigation complete\n');

    console.log('Step 5: Waiting 1 second...');
    await page.waitForTimeout(1000);
    console.log('✅ Wait 1s complete\n');

    console.log('Step 6: Checking if page is alive...');
    const title = await page.title().catch(e => `Error: ${e.message}`);
    console.log(`✅ Page title: ${title}\n`);

    console.log('Step 7: Waiting 2 seconds...');
    await page.waitForTimeout(2000);
    console.log('✅ Wait 2s complete\n');

    console.log('Step 8: Taking screenshot...');
    await page.screenshot({ path: 'diagnostic-1.png' });
    console.log('✅ Screenshot saved\n');

    console.log('Step 9: Waiting 3 seconds...');
    await page.waitForTimeout(3000);
    console.log('✅ Wait 3s complete\n');

    console.log('Step 10: Evaluating page content...');
    const info = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasBody: !!document.body,
        bodyLength: document.body?.innerText.length || 0
      };
    });
    console.log('✅ Page evaluation:');
    console.log(`   URL: ${info.url}`);
    console.log(`   Has body: ${info.hasBody}`);
    console.log(`   Content length: ${info.bodyLength}\n`);

    console.log('Step 11: Taking final screenshot...');
    await page.screenshot({ path: 'diagnostic-2.png', fullPage: true });
    console.log('✅ Final screenshot saved\n');

    console.log('Step 12: Waiting 10 seconds before closing...');
    await page.waitForTimeout(10000);
    console.log('✅ Wait complete\n');

    console.log('✅ ALL STEPS COMPLETED SUCCESSFULLY!');
    console.log('   The browser should close in 5 seconds...\n');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ CRASH DETECTED!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    
    // Try to get more info if possible
    if (page) {
      try {
        await page.screenshot({ path: 'diagnostic-crash.png' });
        console.log('   Screenshot at crash saved: diagnostic-crash.png');
      } catch (e) {
        console.error('   Could not save screenshot');
      }
    }
  } finally {
    if (browser) {
      console.log('\n🏁 Closing browser...');
      await browser.close().catch(e => console.error('Error closing:', e.message));
      console.log('✅ Browser closed');
    }
  }
})();






