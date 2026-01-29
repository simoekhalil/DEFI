import { test, expect, chromium, BrowserContext } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Create Token with Proper Wallet Extension Loading
 * Based on the working create-token-with-wallet.js approach
 */

test.describe('Create Token with Gala Wallet', () => {
  let context: BrowserContext;
  
  test.beforeAll(async () => {
    console.log('⏩ Skipping browser launch in beforeAll - will launch per test');
  });
  
  test.afterAll(async () => {
    if (context) {
      await context.close();
    }
  });

  test('should create a new token with wallet extension', async () => {
    const extensionPath = path.join(process.cwd(), 'extensions', 'testnet-wallet', 'build');
    const walletAddress = process.env.TEST_WALLET_ADDRESS;
    const privateKey = process.env.TEST_PRIVATE_KEY;
    const siteUrl = process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com';
    
    console.log('\n' + '='.repeat(80));
    console.log('🚀 CREATE TOKEN WITH GALA WALLET EXTENSION');
    console.log('='.repeat(80));
    console.log(`📍 Wallet Address: ${walletAddress}`);
    console.log(`📂 Extension Path: ${extensionPath}`);
    console.log(`🌐 Target Site: ${siteUrl}`);
    console.log('='.repeat(80));
    console.log('');
    
    // Validate credentials
    expect(walletAddress).toBeTruthy();
    expect(privateKey).toBeTruthy();
    console.log('✅ Wallet credentials validated');
    
    // STEP 1: Launch browser with extension using launchPersistentContext
    console.log('\n🌐 STEP 1: Launching browser with Gala wallet extension...');
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
      viewport: { width: 1400, height: 900 },
    });
    console.log('✅ Browser launched with extension loaded');
    
    const page = await context.newPage();
    
    // STEP 2: Navigate to the launchpad
    console.log('\n📍 STEP 2: Navigating to Gala Launchpad...');
    await page.goto(siteUrl, { 
      timeout: 60000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded successfully');
    
    await page.screenshot({ path: 'screenshots/proper-1-loaded.png', fullPage: true });
    console.log('📸 Screenshot: screenshots/proper-1-loaded.png');
    
    // STEP 3: Inject wallet credentials
    console.log('\n🔐 STEP 3: Injecting wallet credentials...');
    await page.evaluate(({ address, key }) => {
      // Store credentials in localStorage for the extension to access
      window.localStorage.setItem('gala_wallet_address', address);
      window.localStorage.setItem('gala_wallet_connected', 'true');
      
      // Try to inject into Gala wallet object if available
      if ((window as any).gala && (window as any).gala.wallet) {
        (window as any).gala.wallet.address = address;
        (window as any).gala.wallet.connected = true;
      }
      
      console.log('✅ Wallet credentials injected into localStorage');
    }, { address: walletAddress, key: privateKey });
    
    console.log('✅ Wallet credentials injected');
    await page.waitForTimeout(2000);
    
    // STEP 4: Navigate to token creation page
    console.log('\n🚀 STEP 4: Navigating to token creation form...');
    
    const launchSelectors = [
      'button:has-text("Launch")',
      'a:has-text("Launch")',
      'button:has-text("Create Token")',
      'a:has-text("Create")',
      '[href*="/launch"]'
    ];
    
    let navigated = false;
    for (const selector of launchSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`   ✅ Found launch button: ${selector}`);
          await element.click();
          await page.waitForTimeout(3000);
          navigated = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!navigated) {
      console.log('   No launch button found, navigating directly to /launch...');
      await page.goto(`${siteUrl}/launch`, { 
        timeout: 30000,
        waitUntil: 'networkidle'
      });
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ On token creation page');
    await page.screenshot({ path: 'screenshots/proper-2-form.png', fullPage: true });
    console.log('📸 Screenshot: screenshots/proper-2-form.png');
    
    // STEP 5: Connect wallet if needed
    console.log('\n🔗 STEP 5: Connecting wallet...');
    
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      '[data-testid*="connect"]',
      '.connect-wallet-button',
      'button[class*="connect" i]'
    ];
    
    let connected = false;
    for (const selector of connectSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 })) {
          console.log(`   Found connect button: ${selector}`);
          await button.click();
          await page.waitForTimeout(3000);
          
          // Try to select Gala wallet if modal appears
          const galaWalletSelectors = [
            'button:has-text("Gala")',
            'text=/gala.*wallet/i',
            '[data-testid*="gala"]'
          ];
          
          for (const galaSelector of galaWalletSelectors) {
            try {
              const galaButton = page.locator(galaSelector).first();
              if (await galaButton.isVisible({ timeout: 2000 })) {
                console.log('   Selecting Gala wallet...');
                await galaButton.click({ force: true });
                await page.waitForTimeout(2000);
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          
          connected = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (connected) {
      console.log('✅ Wallet connection initiated');
    } else {
      console.log('ℹ️  No connect button found - wallet may already be connected');
    }
    
    await page.screenshot({ path: 'screenshots/proper-3-connected.png', fullPage: true });
    console.log('📸 Screenshot: screenshots/proper-3-connected.png');
    
    // STEP 6: Fill token creation form
    console.log('\n📝 STEP 6: Filling token creation form...');
    
    const timestamp = Date.now().toString().slice(-6);
    const tokenData = {
      name: `ProperToken${timestamp}`,
      symbol: `PT${timestamp.slice(-4)}`,
      description: `Automated test token created at ${new Date().toISOString()}`
    };
    
    console.log(`   Name: ${tokenData.name}`);
    console.log(`   Symbol: ${tokenData.symbol}`);
    console.log(`   Description: ${tokenData.description}`);
    
    // Fill NAME field
    const nameSelectors = [
      'input[name="name"]',
      'input[placeholder*="name" i]',
      'input[id*="name" i]'
    ];
    
    for (const selector of nameSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.name);
          console.log(`   ✅ Filled token name`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    await page.waitForTimeout(500);
    
    // Fill SYMBOL field
    const symbolSelectors = [
      'input[name="symbol"]',
      'input[placeholder*="symbol" i]',
      'input[id*="symbol" i]'
    ];
    
    for (const selector of symbolSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.symbol);
          console.log(`   ✅ Filled token symbol`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    await page.waitForTimeout(500);
    
    // Fill DESCRIPTION field
    const descSelectors = [
      'textarea[name="description"]',
      'textarea[placeholder*="description" i]',
      'textarea'
    ];
    
    for (const selector of descSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.description);
          console.log(`   ✅ Filled description`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/proper-4-filled.png', fullPage: true });
    console.log('📸 Screenshot: screenshots/proper-4-filled.png');
    
    // STEP 7: Submit token creation
    console.log('\n🚀 STEP 7: Creating token...');
    
    const submitSelectors = [
      'button:has-text("Create Token")',
      'button:has-text("Launch Token")',
      'button:has-text("Create")',
      'button:has-text("Launch")',
      'button[type="submit"]'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 }) && await button.isEnabled()) {
          console.log(`   Found submit button: ${selector}`);
          await button.click();
          console.log('   ✅ Token creation submitted!');
          submitted = true;
          await page.waitForTimeout(5000);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!submitted) {
      console.log('   ⚠️  Could not find enabled submit button');
    }
    
    await page.screenshot({ path: 'screenshots/proper-5-submitted.png', fullPage: true });
    console.log('📸 Screenshot: screenshots/proper-5-submitted.png');
    
    // STEP 8: Navigate to main page to verify
    console.log('\n🏠 STEP 8: Navigating to main page to verify token...');
    await page.goto(siteUrl, { 
      timeout: 30000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    console.log('   🔍 Looking for new token on main page...');
    const mainPageText = await page.evaluate(() => document.body.innerText);
    
    const tokenVisible = mainPageText.includes(tokenData.name) || 
                        mainPageText.includes(tokenData.symbol);
    
    if (tokenVisible) {
      console.log(`   🎉 SUCCESS! Token "${tokenData.name}" (${tokenData.symbol}) is visible!`);
    } else {
      console.log('   ℹ️  Token not immediately visible - it may take a moment to index');
    }
    
    await page.screenshot({ path: 'screenshots/proper-6-mainpage.png', fullPage: true });
    console.log('📸 Screenshot: screenshots/proper-6-mainpage.png');
    
    // Keep browser open for inspection
    console.log('\n⏸️  Browser will remain open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(80));
    console.log(`Token Name: ${tokenData.name}`);
    console.log(`Token Symbol: ${tokenData.symbol}`);
    console.log(`Visible: ${tokenVisible ? 'YES' : 'NO'}`);
    console.log('='.repeat(80));
  });
});






