const { chromium } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

/**
 * Create a Token and View it on Main Page
 * Simple script that creates a token and verifies it appears
 */

async function createAndViewToken() {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  const siteUrl = 'https://lpad-frontend-dev1.defi.gala.com';
  
  console.log('\n🚀 CREATE AND VIEW TOKEN');
  console.log('='.repeat(70));
  console.log(`🌐 Site: ${siteUrl}`);
  console.log(`📂 Extension: ${extensionPath}`);
  console.log('='.repeat(70));
  console.log('');

  let browser;
  try {
    // Launch browser with extension
    console.log('🌐 Launching browser...');
    browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      viewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    
    // Navigate to site
    console.log('📍 Navigating to Gala Launchpad...');
    await page.goto(siteUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    console.log('✅ Page loaded\n');
    
    // Take screenshot of main page
    await page.screenshot({ path: 'step-1-main-page.png' });
    console.log('📸 Screenshot: step-1-main-page.png');
    
    // Look for token creation button
    console.log('\n🔍 Looking for token creation button...');
    const buttonSelectors = [
      'button:has-text("Launch")',
      'button:has-text("Create")',
      'a:has-text("Launch")',
      '[data-testid="launch-button"]',
      '.launch-button',
      'button[class*="launch"]'
    ];
    
    let launchButton = null;
    for (const selector of buttonSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          launchButton = button;
          console.log(`✅ Found button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (launchButton) {
      console.log('\n🎯 Clicking launch button...');
      await launchButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'step-2-create-form.png' });
      console.log('📸 Screenshot: step-2-create-form.png');
      
      // Fill in token details
      console.log('\n📝 Filling token creation form...');
      const timestamp = Date.now();
      const tokenData = {
        name: `TestToken${timestamp}`,
        symbol: `TT${timestamp.toString().slice(-6)}`,
        description: 'Automated test token created via script'
      };
      
      console.log(`   Name: ${tokenData.name}`);
      console.log(`   Symbol: ${tokenData.symbol}`);
      console.log(`   Description: ${tokenData.description}`);
      
      // Try to fill form fields
      const nameSelectors = ['input[name="name"]', 'input[placeholder*="name" i]', '#token-name'];
      for (const selector of nameSelectors) {
        try {
          await page.fill(selector, tokenData.name, { timeout: 2000 });
          console.log('✅ Name field filled');
          break;
        } catch (e) {}
      }
      
      const symbolSelectors = ['input[name="symbol"]', 'input[placeholder*="symbol" i]', '#token-symbol'];
      for (const selector of symbolSelectors) {
        try {
          await page.fill(selector, tokenData.symbol, { timeout: 2000 });
          console.log('✅ Symbol field filled');
          break;
        } catch (e) {}
      }
      
      const descSelectors = ['textarea[name="description"]', 'textarea[placeholder*="description" i]', '#token-description'];
      for (const selector of descSelectors) {
        try {
          await page.fill(selector, tokenData.description, { timeout: 2000 });
          console.log('✅ Description field filled');
          break;
        } catch (e) {}
      }
      
      await page.screenshot({ path: 'step-3-form-filled.png' });
      console.log('📸 Screenshot: step-3-form-filled.png');
      
      // Look for submit button
      console.log('\n🔍 Looking for submit button...');
      const submitSelectors = [
        'button:has-text("Create")',
        'button:has-text("Submit")',
        'button[type="submit"]',
        'button:has-text("Launch Token")'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          const button = await page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 })) {
            submitButton = button;
            console.log(`✅ Found submit button: ${selector}`);
            break;
          }
        } catch (e) {}
      }
      
      if (submitButton) {
        console.log('\n🎯 Submitting token creation...');
        await submitButton.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'step-4-token-created.png' });
        console.log('📸 Screenshot: step-4-token-created.png');
        
        // Navigate back to main page to view the token
        console.log('\n🏠 Navigating back to main page...');
        await page.goto(siteUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'step-5-token-on-main-page.png' });
        console.log('📸 Screenshot: step-5-token-on-main-page.png');
        
        // Check if our token appears
        console.log('\n🔍 Looking for new token on main page...');
        const tokenVisible = await page.locator(`text=${tokenData.name}`).first().isVisible({ timeout: 5000 }).catch(() => false);
        const symbolVisible = await page.locator(`text=${tokenData.symbol}`).first().isVisible({ timeout: 5000 }).catch(() => false);
        
        if (tokenVisible || symbolVisible) {
          console.log('✅ Token found on main page!');
          console.log(`   ${tokenVisible ? '✅' : '❌'} Name visible: ${tokenData.name}`);
          console.log(`   ${symbolVisible ? '✅' : '❌'} Symbol visible: ${tokenData.symbol}`);
        } else {
          console.log('⚠️  Token not immediately visible - may need to refresh or scroll');
        }
        
        console.log('\n✅ Token creation and verification complete!');
      } else {
        console.log('⚠️  Could not find submit button');
      }
      
    } else {
      console.log('⚠️  Could not find launch button');
      console.log('📋 Listing all buttons on page...');
      const buttons = await page.locator('button').all();
      console.log(`   Found ${buttons.length} buttons`);
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent().catch(() => 'N/A');
        console.log(`   ${i + 1}. ${text.trim()}`);
      }
    }
    
    console.log('\n📋 Screenshots saved:');
    console.log('   1. step-1-main-page.png - Initial main page');
    console.log('   2. step-2-create-form.png - Token creation form');
    console.log('   3. step-3-form-filled.png - Filled form');
    console.log('   4. step-4-token-created.png - After submission');
    console.log('   5. step-5-token-on-main-page.png - Token on main page');
    
    console.log('\n⏸️  Browser will stay open for 30 seconds for you to inspect...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    if (browser) {
      console.log('\n🔚 Closing browser...');
      await browser.close();
    }
  }
  
  console.log('\n✅ Script completed!');
  console.log('='.repeat(70));
}

// Run the script
createAndViewToken().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});






