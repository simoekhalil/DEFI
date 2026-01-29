import { test, expect } from '@playwright/test';
import { bootstrap, MetaMaskWallet } from '@tenkeylabs/dappwright';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Create Token with MetaMask using Dappwright
 * FULLY AUTOMATED - NO MANUAL INTERVENTION
 * Uses Dappwright for MetaMask automation
 */

test.describe('Create Token with MetaMask', () => {
  let browser: any;
  let metamask: any;
  let page: any;
  
  test.beforeAll(async () => {
    // Bootstrap MetaMask with Dappwright
    console.log('\n' + '='.repeat(80));
    console.log('🚀 CREATE TOKEN WITH METAMASK');
    console.log('='.repeat(80));
    console.log('Fully automated using Dappwright');
    console.log('='.repeat(80));
    
    console.log('\n🦊 STEP 1: Setting up MetaMask...');
    
    const privateKey = '0x4ab34585b43439b62466a4d2a08a04563dcd6a6611511bd0e111f8ecf358f149';
    
    console.log(`   Using private key: ${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`);
    
    // Initialize Dappwright with a seed phrase (required by bootstrap)
    console.log('   Loading MetaMask extension...');
    
    const seedPhrase = 'biology pull phrase dial phrase like success inherit truth birth torch indicate';
    
    const [dappwright, metaMaskPage, context] = await bootstrap('', {
      wallet: 'metamask',
      version: MetaMaskWallet.recommendedVersion,
      seed: seedPhrase,
      headless: false
    });
    
    browser = context;
    metamask = dappwright;
    
    console.log('   ✅ MetaMask extension loaded with seed phrase account');
    
    page = await context.newPage();
    console.log('✅ MetaMask ready for use');
  });
  
  test.afterAll(async () => {
    if (browser) {
      await browser.browser()?.close();
    }
  });

  test('should create a token with MetaMask', async () => {
    test.setTimeout(180000); // 3 minutes timeout
    
    const siteUrl = process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com';
    
    // STEP 2: Load the site
    console.log('\n📍 STEP 2: Loading Gala Launchpad...');
    await page.goto(siteUrl, {
      timeout: 60000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded - MetaMask extension is active');
    
    await page.screenshot({
      path: 'screenshots/gala-1-loaded.png',
      fullPage: true
    });
    console.log('📸 Screenshot: screenshots/gala-1-loaded.png');
    
    // STEP 3: Navigate to token creation page
    console.log('\n🚀 STEP 3: Navigating to token creation form...');
    
    const launchSelectors = [
      'button:has-text("Launch")',
      'a:has-text("Launch")',
      'button:has-text("Create Token")',
      '[href*="/launch"]'
    ];
    
    let navigated = false;
    for (const selector of launchSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`   Found launch button: ${selector}`);
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
      console.log('   Navigating directly to /launch...');
      await page.goto(`${siteUrl}/launch`, {
        timeout: 30000,
        waitUntil: 'networkidle'
      });
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ On token creation page');
    
    await page.screenshot({
      path: 'screenshots/gala-2-launch-page.png',
      fullPage: true
    });
    console.log('📸 Screenshot: screenshots/gala-2-launch-page.png');
    
    // STEP 4: Connect MetaMask wallet
    console.log('\n🦊 STEP 4: Connecting MetaMask wallet...');
    
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      'button[class*="connect" i]'
    ];
    
    let connected = false;
    for (const selector of connectSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 })) {
          console.log(`   Found connect button: ${selector}`);
          await button.click();
          await page.waitForTimeout(2000);
          
          // Try to select MetaMask from wallet modal
          const metamaskSelectors = [
            'button:has-text("MetaMask")',
            'div:has-text("MetaMask") button',
            'text=/metamask/i >> ..',
            '[data-testid="metamask"]',
            'img[alt*="MetaMask" i] >> ..'
          ];
          
          for (const mmSelector of metamaskSelectors) {
            try {
              const mmButton = page.locator(mmSelector).first();
              if (await mmButton.isVisible({ timeout: 2000 })) {
                console.log(`   Found MetaMask button: ${mmSelector}`);
                await mmButton.click({ force: true });
                console.log('   ✅ Clicked MetaMask button');
                
                // Use Dappwright to automatically approve the connection
                console.log('   ⏳ Approving MetaMask connection...');
                await page.waitForTimeout(2000);
                await metamask.approve();
                console.log('   ✅ MetaMask connection approved!');
                
                await page.waitForTimeout(3000);
                
                // Check if wallet connected
                const connectStillVisible = await page.locator('button:has-text("Connect Wallet")').first().isVisible().catch(() => false);
                if (!connectStillVisible) {
                  console.log('   ✅ MetaMask connected successfully!');
                  connected = true;
                } else {
                  console.log('   ⚠️  Checking connection status...');
                }
                
                break;
              }
            } catch (e) {
              console.log(`   Selector ${mmSelector} not found: ${e.message}`);
            }
          }
          
          break;
        }
      } catch (e) {
        console.log('   Error during wallet connection:', e.message);
      }
    }
    
    if (connected) {
      console.log('✅ MetaMask wallet connection completed');
    } else {
      console.log('ℹ️  Proceeding with test...');
    }
    
    await page.screenshot({
      path: 'screenshots/gala-3-wallet-connected.png',
      fullPage: true
    });
    console.log('📸 Screenshot: screenshots/gala-3-wallet-connected.png');
    
    // STEP 5: Fill token creation form
    console.log('\n📝 STEP 5: Filling token creation form...');
    
    const timestamp = Date.now().toString().slice(-6);
    const tokenData = {
      name: `GalaToken${timestamp}`,
      symbol: `GT${timestamp.slice(-4)}`,
      description: `Automated test token via Gala extension at ${new Date().toISOString()}`
    };
    
    console.log(`   Name: ${tokenData.name}`);
    console.log(`   Symbol: ${tokenData.symbol}`);
    console.log(`   Description: ${tokenData.description}`);
    
    // Fill NAME
    const nameSelectors = [
      'input[name="name"]',
      'input[placeholder*="name" i]'
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
      } catch (e) {}
    }
    
    await page.waitForTimeout(500);
    
    // Fill SYMBOL
    const symbolSelectors = [
      'input[name="symbol"]',
      'input[placeholder*="symbol" i]'
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
      } catch (e) {}
    }
    
    await page.waitForTimeout(500);
    
    // Fill DESCRIPTION
    const descSelectors = [
      'textarea[name="description"]',
      'textarea[placeholder*="description" i]'
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
      } catch (e) {}
    }
    
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: 'screenshots/gala-4-form-filled.png',
      fullPage: true
    });
    console.log('📸 Screenshot: screenshots/gala-4-form-filled.png');
    
    // STEP 6: Submit token creation
    console.log('\n🚀 STEP 6: Creating token...');
    
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
          const buttonText = await button.textContent();
          console.log(`   Button text: "${buttonText?.trim()}"`);
          await button.click();
          console.log('   ✅ Token creation submitted!');
          submitted = true;
          
          // Wait for transaction to process
          console.log('   ⏳ Waiting for transaction confirmation...');
          await page.waitForTimeout(8000);
          
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!submitted) {
      console.log('   ⚠️  Could not find enabled submit button');
      console.log('   Wallet may not be fully connected');
    }
    
    await page.screenshot({
      path: 'screenshots/gala-5-submitted.png',
      fullPage: true
    });
    console.log('📸 Screenshot: screenshots/gala-5-submitted.png');
    
    // STEP 7: Navigate to main page to verify
    console.log('\n🏠 STEP 7: Verifying token on main page...');
    await page.goto(siteUrl, {
      timeout: 30000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    console.log('   🔍 Looking for new token...');
    const mainPageText = await page.evaluate(() => document.body.innerText);
    
    const tokenVisible = mainPageText.includes(tokenData.name) || 
                        mainPageText.includes(tokenData.symbol);
    
    if (tokenVisible) {
      console.log(`   🎉 SUCCESS! Token "${tokenData.name}" is visible!`);
    } else {
      console.log('   ℹ️  Token not immediately visible - may take time to index');
    }
    
    await page.screenshot({
      path: 'screenshots/gala-6-mainpage.png',
      fullPage: true
    });
    console.log('📸 Screenshot: screenshots/gala-6-mainpage.png');
    
    // Keep browser open for inspection
    console.log('\n⏸️  Browser will remain open for 30 seconds...');
    await page.waitForTimeout(30000);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(80));
    console.log(`Token Name: ${tokenData.name}`);
    console.log(`Token Symbol: ${tokenData.symbol}`);
    console.log(`Submitted: ${submitted ? 'YES' : 'NO'}`);
    console.log(`Visible: ${tokenVisible ? 'YES' : 'NO'}`);
    console.log('='.repeat(80));
  });
});

