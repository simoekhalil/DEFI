import { test, expect } from '@playwright/test';

/**
 * Testnet Wallet Balance Check
 * Connect to the dev site and check balance through the UI
 */

test.describe('Testnet Wallet Balance Check', () => {
  
  test('should connect testnet wallet and check balance on dev site', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds
    
    console.log('\n💰 TESTNET WALLET BALANCE CHECK');
    console.log('='.repeat(60));
    console.log(`Wallet: ${process.env.TEST_WALLET_ADDRESS}`);
    console.log(`Network: ${process.env.TEST_ENVIRONMENT}`);
    console.log('='.repeat(60));
    
    // Navigate to the testnet/dev site
    console.log('\n📍 Step 1: Loading Gala DeFi Launchpad (Testnet)...');
    const siteUrl = process.env.TEST_SITE_URL || 'https://lpad-frontend-dev1.defi.gala.com';
    await page.goto(siteUrl);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Page loaded');
    
    await page.screenshot({ 
      path: 'tests/screenshots/testnet-initial.png',
      fullPage: true 
    });
    
    // Look for wallet connection button
    console.log('\n🔍 Step 2: Looking for wallet connection options...');
    
    // Try to find connect wallet button with various selectors
    const connectButtonSelectors = [
      'button:has-text("Connect")',
      'button:has-text("Connect Wallet")',
      '[data-testid*="connect"]',
      'button[class*="connect"]',
      'a:has-text("Connect")'
    ];
    
    let connectButton = null;
    for (const selector of connectButtonSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          connectButton = btn;
          console.log(`✅ Found connect button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (connectButton) {
      console.log('\n🔗 Step 3: Attempting to connect wallet...');
      await connectButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/testnet-wallet-popup.png',
        fullPage: true 
      });
      
      console.log('📸 Screenshot saved: testnet-wallet-popup.png');
    } else {
      console.log('⚠️  Connect wallet button not found automatically');
      console.log('   You may need to manually click "Connect Wallet"');
    }
    
    // Check for balance display on the page
    console.log('\n💰 Step 4: Checking for balance display...');
    
    // Wait a bit for any balance to load
    await page.waitForTimeout(3000);
    
    // Try to find balance elements
    const pageText = await page.textContent('body');
    const balancePatterns = [
      /(\d+[\d,]*\.?\d*)\s*GALA/gi,
      /balance[:\s]*(\d+[\d,]*\.?\d*)/gi,
      /(\d+[\d,]*\.?\d*)\s*tokens?/gi
    ];
    
    let foundBalances = [];
    for (const pattern of balancePatterns) {
      const matches = pageText?.matchAll(pattern);
      if (matches) {
        for (const match of matches) {
          foundBalances.push(match[0]);
        }
      }
    }
    
    if (foundBalances.length > 0) {
      console.log('\n✅ Found balance information on page:');
      foundBalances.forEach(balance => {
        console.log(`   ${balance}`);
      });
    } else {
      console.log('⚠️  No balance information visible yet');
      console.log('   This is normal if wallet is not connected or balance is 0');
    }
    
    // Check wallet connection status
    console.log('\n🔍 Step 5: Checking wallet connection status...');
    const walletIndicators = [
      await page.locator('text=/connected/i').count() > 0,
      await page.locator(`text=/${process.env.TEST_WALLET_ADDRESS}/i`).count() > 0,
      await page.locator('button:has-text("Disconnect")').count() > 0,
      await page.locator('[class*="connected"]').count() > 0
    ];
    
    const isConnected = walletIndicators.some(indicator => indicator);
    
    if (isConnected) {
      console.log('✅ Wallet appears to be connected!');
    } else {
      console.log('⚠️  Wallet connection status unclear');
      console.log('   Manual wallet connection may be required');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/testnet-final-state.png',
      fullPage: true 
    });
    
    // Get all text content for analysis
    const fullPageText = await page.evaluate(() => document.body.innerText);
    
    console.log('\n📄 Page Analysis:');
    console.log('-'.repeat(60));
    if (fullPageText.toLowerCase().includes('wallet')) {
      console.log('✅ Page has wallet-related content');
    }
    if (fullPageText.toLowerCase().includes('gala')) {
      console.log('✅ Page mentions GALA');
    }
    if (fullPageText.toLowerCase().includes('balance')) {
      console.log('✅ Page has balance information');
    }
    if (fullPageText.toLowerCase().includes('testnet') || fullPageText.toLowerCase().includes('test')) {
      console.log('✅ Page indicates testnet environment');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📝 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Site: ${siteUrl}`);
    console.log(`Wallet: ${process.env.TEST_WALLET_ADDRESS}`);
    console.log(`Environment: Testnet`);
    console.log('Screenshots saved in: tests/screenshots/');
    console.log('\nℹ️  For testnet wallets, you may need to:');
    console.log('   1. Manually connect using Gala Wallet extension');
    console.log('   2. Check balance in the UI after connecting');
    console.log('   3. Request testnet GALA tokens if balance is 0');
    console.log('='.repeat(60) + '\n');
    
  });
  
});

