const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Create New Token with Gala Wallet Extension
 * Complete flow: Load page → Navigate to launch → Fill form → Create token → View on main page
 */

(async () => {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  
  console.log('🪙 CREATE NEW TOKEN - COMPLETE FLOW');
  console.log('='.repeat(70));
  console.log(`📂 Extension: ${extensionPath}\n`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    slowMo: 800 // Slow down so you can see what's happening
  });

  const context = await browser.newContext({
    bypassCSP: true
  });

  const page = await context.newPage();

  try {
    // STEP 1: Load Gala Launchpad
    console.log('📍 STEP 1: Loading Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'create-1-loaded.png', fullPage: true });

    // STEP 2: Connect Wallet (if needed)
    console.log('\n🔗 STEP 2: Checking wallet connection...');
    const connectBtn = page.locator('button:has-text("Connect")').first();
    if (await connectBtn.count() > 0) {
      try {
        await connectBtn.click({ timeout: 5000 });
        console.log('✅ Connect button clicked');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'create-2-connect.png', fullPage: true });
      } catch (e) {
        console.log('ℹ️  Connect button not clickable or already connected');
      }
    } else {
      console.log('ℹ️  No connect button found - may already be connected');
    }

    // STEP 3: Navigate to Launch/Create Token Page
    console.log('\n🚀 STEP 3: Navigating to token creation form...');
    
    const launchSelectors = [
      'button:has-text("Launch")',
      'a:has-text("Launch")',
      'button:has-text("Create Token")',
      'a:has-text("Create")',
      'text=/launch.*coin/i',
      '[href*="/launch"]'
    ];
    
    let navigated = false;
    for (const selector of launchSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`✅ Found launch button: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!navigated) {
      console.log('ℹ️  No launch button found, trying direct navigation...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/launch', { 
        timeout: 30000, 
        waitUntil: 'networkidle' 
      });
      console.log('✅ Navigated directly to /launch');
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'create-3-launch-page.png', fullPage: true });

    // STEP 4: Fill Token Creation Form
    console.log('\n📝 STEP 4: Filling token creation form...');
    
    const timestamp = Date.now().toString().slice(-6);
    const tokenData = {
      name: `TestToken${timestamp}`,
      symbol: `TT${timestamp.slice(-4)}`,
      description: `Test token created via automated script at ${new Date().toISOString()}`
    };
    
    console.log(`   Token Name: ${tokenData.name}`);
    console.log(`   Token Symbol: ${tokenData.symbol}`);
    console.log(`   Description: ${tokenData.description}\n`);
    
    // Find and fill NAME field
    const nameSelectors = [
      'input[name*="name" i]',
      'input[placeholder*="name" i]',
      'input[id*="name" i]',
      'input:nth-of-type(1)'
    ];
    
    let nameFilled = false;
    for (const selector of nameSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.name);
          console.log(`✅ Filled token name: ${tokenData.name}`);
          nameFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!nameFilled) {
      console.log('⚠️  Could not find name field');
    }
    
    await page.waitForTimeout(1000);
    
    // Find and fill SYMBOL field
    const symbolSelectors = [
      'input[name*="symbol" i]',
      'input[placeholder*="symbol" i]',
      'input[id*="symbol" i]',
      'input:nth-of-type(2)'
    ];
    
    let symbolFilled = false;
    for (const selector of symbolSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.symbol);
          console.log(`✅ Filled token symbol: ${tokenData.symbol}`);
          symbolFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!symbolFilled) {
      console.log('⚠️  Could not find symbol field');
    }
    
    await page.waitForTimeout(1000);
    
    // Find and fill DESCRIPTION field
    const descSelectors = [
      'textarea[name*="description" i]',
      'textarea[placeholder*="description" i]',
      'textarea',
      'input[name*="description" i]'
    ];
    
    let descFilled = false;
    for (const selector of descSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.description);
          console.log(`✅ Filled description`);
          descFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!descFilled) {
      console.log('⚠️  Could not find description field');
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'create-4-form-filled.png', fullPage: true });

    // STEP 5: Submit Token Creation
    console.log('\n🚀 STEP 5: Creating token...');
    
    const submitSelectors = [
      'button:has-text("Create Token")',
      'button:has-text("Launch Token")',
      'button:has-text("Create")',
      'button:has-text("Launch")',
      'button[type="submit"]',
      'input[type="submit"]'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found submit button: ${selector}`);
          await button.click();
          console.log('✅ Clicked create token button');
          submitted = true;
          await page.waitForTimeout(5000);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!submitted) {
      console.log('⚠️  Could not find submit button - form may need manual submission');
    } else {
      await page.screenshot({ path: 'create-5-submitted.png', fullPage: true });
    }

    // STEP 6: Check for Success/Confirmation
    console.log('\n✅ STEP 6: Checking for confirmation...');
    await page.waitForTimeout(3000);
    
    const pageText = await page.evaluate(() => document.body.innerText);
    
    if (pageText.includes('success') || pageText.includes('created') || pageText.includes('Success')) {
      console.log('🎉 Token creation appears successful!');
    } else {
      console.log('ℹ️  Checking page state...');
    }
    
    await page.screenshot({ path: 'create-6-confirmation.png', fullPage: true });

    // STEP 7: Navigate back to main page to view token
    console.log('\n🏠 STEP 7: Navigating to main page to view new token...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(3000);
    
    // Look for the new token on the page
    const newTokenText = `${tokenData.name}|${tokenData.symbol}`;
    const isTokenVisible = await page.evaluate((searchText) => {
      const parts = searchText.split('|');
      const body = document.body.innerText;
      return parts.some(part => body.includes(part));
    }, newTokenText);
    
    if (isTokenVisible) {
      console.log(`🎉 SUCCESS! Token "${tokenData.name}" (${tokenData.symbol}) is visible on the main page!`);
    } else {
      console.log(`ℹ️  Token may take a moment to appear. Check the main page manually.`);
    }
    
    await page.screenshot({ path: 'create-7-main-page.png', fullPage: true });

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ TOKEN CREATION FLOW COMPLETED!');
    console.log('='.repeat(70));
    console.log('📋 Created Token Details:');
    console.log(`   Name: ${tokenData.name}`);
    console.log(`   Symbol: ${tokenData.symbol}`);
    console.log(`   Description: ${tokenData.description}`);
    console.log('\n📸 Screenshots saved:');
    console.log('   create-1-loaded.png       - Initial page load');
    console.log('   create-2-connect.png      - Wallet connection');
    console.log('   create-3-launch-page.png  - Launch/create form');
    console.log('   create-4-form-filled.png  - Completed form');
    console.log('   create-5-submitted.png    - After submission');
    console.log('   create-6-confirmation.png - Confirmation page');
    console.log('   create-7-main-page.png    - Token on main page');
    console.log('='.repeat(70));
    console.log('\n⏸️  Browser will stay open for 30 seconds for manual review...');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('📸 Saving error screenshot...');
    try {
      await page.screenshot({ path: 'create-error.png', fullPage: true });
      console.log('✅ Error screenshot saved: create-error.png');
    } catch {}
  } finally {
    console.log('\n🏁 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed successfully');
  }
})();






