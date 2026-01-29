const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Smart Token Purchase - Waits for elements to be visible
 */

(async () => {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  
  console.log('🧠 SMART PURCHASE FLOW (Waits for elements)');
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
    // Step 1: Load and wait for page to be ready
    console.log('1️⃣ Loading Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    }).catch(async () => {
      console.log('   Network idle timeout, waiting for load...');
      await page.waitForLoadState('load');
    });
    
    // Wait for body to have content
    await page.waitForFunction(() => document.body && document.body.innerText.length > 100, { timeout: 10000 });
    
    await page.screenshot({ path: 'smart-1-loaded.png', fullPage: true });
    console.log('✅ Page fully loaded\n');

    // Step 2: Try to connect wallet
    console.log('2️⃣ Looking for Connect button...');
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      'text=Connect Wallet >> visible=true',
    ];

    let connected = false;
    for (const selector of connectSelectors) {
      try {
        await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
        console.log(`   Found: ${selector}`);
        await page.click(selector);
        connected = true;
        console.log('✅ Connect button clicked');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'smart-2-connect.png', fullPage: true });
        break;
      } catch (e) {
        continue;
      }
    }

    if (!connected) {
      console.log('⚠️  No Connect button - wallet may be connected already\n');
    } else {
      // Try to select Gala wallet
      console.log('\n3️⃣ Looking for Gala Wallet option...');
      try {
        await page.waitForSelector('button:has-text("Gala")', { state: 'visible', timeout: 2000 });
        await page.click('button:has-text("Gala")');
        console.log('✅ Gala Wallet selected');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'smart-3-gala.png', fullPage: true });
      } catch (e) {
        console.log('⚠️  No Gala Wallet selector needed\n');
      }
    }

    // Step 4: Find tokens
    console.log('\n4️⃣ Looking for tokens...');
    const tokenSelectors = [
      'a[href*="/token/"]',
      'a[href*="/coin/"]',
      '[class*="token" i] >> visible=true',
    ];

    let tokenFound = false;
    for (const selector of tokenSelectors) {
      try {
        await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
        const count = await page.locator(selector).count();
        console.log(`   Found ${count} tokens with: ${selector}`);
        
        await page.click(selector);
        tokenFound = true;
        console.log('✅ Clicked first token');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'smart-4-token.png', fullPage: true });
        break;
      } catch (e) {
        continue;
      }
    }

    if (!tokenFound) {
      console.log('⚠️  No tokens found on page');
      console.log('   Trying explore page...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/explore');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'smart-4-explore.png', fullPage: true });
    }

    // Step 5: Enter buy amount
    console.log('\n5️⃣ Looking for amount input...');
    try {
      await page.waitForSelector('input[type="number"]', { state: 'visible', timeout: 5000 });
      await page.fill('input[type="number"]', '100');
      console.log('✅ Entered 100 GALA');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'smart-5-amount.png', fullPage: true });
    } catch (e) {
      console.log('⚠️  No amount input found');
    }

    // Step 6: Click Buy
    console.log('\n6️⃣ Looking for Buy button...');
    const buySelectors = [
      'button:has-text("Buy") >> visible=true',
      'button:has-text("Purchase") >> visible=true',
    ];

    for (const selector of buySelectors) {
      try {
        await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
        const isEnabled = await page.isEnabled(selector);
        if (isEnabled) {
          console.log(`   Found enabled: ${selector}`);
          await page.click(selector);
          console.log('✅ Buy button clicked!');
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'smart-6-buy.png', fullPage: true });
          break;
        } else {
          console.log(`   Found but disabled: ${selector}`);
        }
      } catch (e) {
        continue;
      }
    }

    // Step 7: Check for confirmation
    console.log('\n7️⃣ Checking for confirmation dialog...');
    try {
      await page.waitForSelector('button:has-text("Confirm")', { state: 'visible', timeout: 3000 });
      await page.click('button:has-text("Confirm")');
      console.log('✅ Confirmation clicked');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'smart-7-confirmed.png', fullPage: true });
    } catch (e) {
      console.log('⚠️  No confirmation dialog');
    }

    // Final screenshot
    await page.screenshot({ path: 'smart-final.png', fullPage: true });
    
    console.log('\n✅ SMART PURCHASE FLOW COMPLETED!');
    console.log('📸 All screenshots saved: smart-*.png');
    
    // Check final state
    const finalState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return {
        success: text.includes('success') || text.includes('confirmed'),
        error: text.includes('error') || text.includes('failed'),
      };
    });

    console.log('\n📊 FINAL STATE:');
    if (finalState.success) {
      console.log('✅ Transaction appears successful!');
    } else if (finalState.error) {
      console.log('❌ Error detected');
    } else {
      console.log('⚠️  Status unclear');
    }

    console.log('\n🏁 Closing browser...');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'smart-error.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();






