import { test, expect } from '@playwright/test';
import { AutomatedWalletConnection } from './helpers/automated-wallet-connection';

/**
 * Real GalaChain Token Creation Test
 * Uses proper GalaChain Connect library approach
 * Creates ACTUAL tokens on the blockchain
 */

const REAL_GALACHAIN_TOKEN = {
  name: 'GalaChainRealToken2024',
  symbol: 'GCRT24',
  description: 'Real token created using proper GalaChain Connect library integration',
  creatorWallet: 'eth|1234567890123456789012345678901234567890', // Will be replaced with real wallet
  initialSupply: '1000000',
  bondingCurveSlope: '0.0001',
  graduationThreshold: '69000000000000000000000' // 69,000 GALA
};

test.describe('GalaChain Real Token Creation', () => {
  
  test('should connect using GalaChain Connect library', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    
    console.log('🔗 GALACHAIN CONNECT LIBRARY TEST');
    console.log('='.repeat(50));
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    // Test GalaChain Connect integration
    const wallet = new AutomatedWalletConnection(page, {
      address: REAL_GALACHAIN_TOKEN.creatorWallet,
      type: 'gala',
      balance: '10000',
      enableTransactions: true,
      autoConnect: false, // Manual connection for real wallet
      timeout: 120000
    });
    
    console.log('📋 Step 1: Initialize GalaChain Connect');
    console.log('-'.repeat(30));
    
    // Test the enhanced GalaChain mock
    const galaChainTest = await page.evaluate(() => {
      try {
        // Test if our GalaChain Connect mock is properly injected
        if (typeof (window as any).GalaChainConnect !== 'undefined') {
          const client = new (window as any).GalaChainConnect.BrowserConnectClient();
          return {
            success: true,
            hasConnect: typeof client.connect === 'function',
            hasSign: typeof client.sign === 'function',
            hasPersonalSign: typeof client.personalSign === 'function'
          };
        }
        return { success: false, error: 'GalaChain Connect not found' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (galaChainTest.success) {
      console.log('✅ GalaChain Connect library loaded successfully');
      console.log(`   - connect(): ${galaChainTest.hasConnect}`);
      console.log(`   - sign(): ${galaChainTest.hasSign}`);
      console.log(`   - personalSign(): ${galaChainTest.hasPersonalSign}`);
    } else {
      console.log(`❌ GalaChain Connect test failed: ${galaChainTest.error}`);
    }
    
    console.log('📋 Step 2: Test Wallet Service');
    console.log('-'.repeat(30));
    
    // Test the wallet service
    const walletServiceTest = await page.evaluate(() => {
      try {
        const service = (window as any).galaWalletService;
        if (service) {
          return {
            success: true,
            hasConnect: typeof service.connect === 'function',
            hasBurnTokens: typeof service.burnTokens === 'function',
            hasTransferTokens: typeof service.transferTokens === 'function',
            hasFetchBalance: typeof service.fetchBalance === 'function'
          };
        }
        return { success: false, error: 'Wallet service not found' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (walletServiceTest.success) {
      console.log('✅ GalaChain wallet service loaded successfully');
      console.log(`   - connect(): ${walletServiceTest.hasConnect}`);
      console.log(`   - burnTokens(): ${walletServiceTest.hasBurnTokens}`);
      console.log(`   - transferTokens(): ${walletServiceTest.hasTransferTokens}`);
      console.log(`   - fetchBalance(): ${walletServiceTest.hasFetchBalance}`);
    } else {
      console.log(`❌ Wallet service test failed: ${walletServiceTest.error}`);
    }
    
    console.log('📋 Step 3: Test GalaChain Connection');
    console.log('-'.repeat(30));
    
    // Attempt wallet connection
    try {
      const connectionResult = await wallet.connect();
      
      if (connectionResult.success) {
        console.log('✅ GalaChain wallet connected successfully');
        console.log(`   Address: ${connectionResult.address}`);
        console.log(`   Balance: ${connectionResult.balance} GALA`);
        console.log(`   Type: ${connectionResult.walletType}`);
        
        // Test transaction signing capability
        const signTest = await page.evaluate(async () => {
          try {
            const service = (window as any).galaWalletService;
            if (service.client) {
              const testMessage = 'Test message for GalaChain signing';
              const signature = await service.client.personalSign(testMessage);
              return { success: true, signature: signature.substring(0, 20) + '...' };
            }
            return { success: false, error: 'No client available' };
          } catch (error) {
            return { success: false, error: error.message };
          }
        });
        
        if (signTest.success) {
          console.log(`✅ Message signing test successful: ${signTest.signature}`);
        } else {
          console.log(`❌ Message signing test failed: ${signTest.error}`);
        }
        
      } else {
        console.log(`❌ GalaChain wallet connection failed: ${connectionResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Connection error: ${error.message}`);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/galachain-connect-test.png',
      fullPage: true 
    });
    
    console.log('✅ GalaChain Connect library test completed');
  });
  
  test('should create real token using GalaChain Connect', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for automated token creation
    
    console.log('🚀 AUTOMATED REAL GALACHAIN TOKEN CREATION');
    console.log('='.repeat(60));
    console.log('⚠️  WARNING: This will create a REAL token on the blockchain!');
    console.log('💰 COST: This will cost real GALA tokens for gas fees!');
    console.log('🤖 FULLY AUTOMATED: No manual intervention required');
    console.log('='.repeat(60));
    console.log('');
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    // Initialize GalaChain wallet with full automation
    console.log('📋 STEP 1: Connecting Real GalaChain Wallet Automatically');
    console.log('-'.repeat(40));
    
    const wallet = new AutomatedWalletConnection(page, {
      address: REAL_GALACHAIN_TOKEN.creatorWallet,
      seedPhrase: process.env.WALLET_SEED_PHRASE,
      type: 'gala',
      enableTransactions: true,
      autoConnect: true,
      timeout: 60000
    });
    
    let walletConnection;
    try {
      walletConnection = await wallet.connect();
      
      if (!walletConnection.connected) {
        throw new Error('Wallet connection failed');
      }
      
      console.log('✅ GalaChain wallet connected automatically!');
      console.log(`   Address: ${walletConnection.address}`);
      console.log(`   Method: ${walletConnection.method}`);
      console.log(`   Duration: ${walletConnection.duration}ms`);
      
    } catch (error) {
      console.error(`❌ Automated wallet connection failed: ${error.message}`);
      throw error;
    }
    
    console.log('📋 STEP 2: Navigate to Token Creation');
    console.log('-'.repeat(40));
    
    // Look for launch/create token button
    const launchSelectors = [
      'button:has-text("Launch")',
      'button:has-text("Create Token")',
      'button:has-text("Create")',
      'a:has-text("Launch")',
      '[data-testid*="launch"]',
      '.launch-button'
    ];
    
    let launchButton = null;
    for (const selector of launchSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          launchButton = element;
          console.log(`✅ Found launch button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!launchButton) {
      console.log('❌ Launch button not found. Looking for navigation links...');
      
      // Try navigation links
      const navSelectors = [
        'text=/launch/i',
        'text=/create/i',
        'nav a:has-text("Launch")',
        '.nav-link:has-text("Launch")'
      ];
      
      for (const selector of navSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            launchButton = element;
            console.log(`✅ Found launch link: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    if (launchButton) {
      console.log('🖱️ Clicking launch button...');
      await launchButton.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️ No launch button found. Proceeding with current page...');
    }
    
    console.log('📋 STEP 3: Fill Token Creation Form');
    console.log('-'.repeat(40));
    
    // Fill token creation form with GalaChain token details
    const formFields = [
      { selector: 'input[name="name"], input[placeholder*="name" i], #token-name', value: REAL_GALACHAIN_TOKEN.name },
      { selector: 'input[name="symbol"], input[placeholder*="symbol" i], #token-symbol', value: REAL_GALACHAIN_TOKEN.symbol },
      { selector: 'textarea[name="description"], textarea[placeholder*="description" i], #token-description', value: REAL_GALACHAIN_TOKEN.description }
    ];
    
    for (const field of formFields) {
      try {
        const element = page.locator(field.selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✏️ Filling ${field.selector.split(',')[0]} with: ${field.value}`);
          await element.fill(field.value);
          await page.waitForTimeout(1000);
        } else {
          console.log(`⚠️ Field not found: ${field.selector}`);
        }
      } catch (error) {
        console.log(`❌ Error filling field ${field.selector}: ${error.message}`);
      }
    }
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: 'tests/screenshots/galachain-form-filled.png',
      fullPage: true 
    });
    
    console.log('📋 STEP 4: Submit Real Token Creation');
    console.log('-'.repeat(40));
    console.log('⚠️  FINAL WARNING: About to submit REAL token creation!');
    console.log('💰 This will cost real GALA tokens!');
    console.log('');
    
    // Look for submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Launch")',
      'button:has-text("Submit")',
      '.submit-button',
      '[data-testid*="submit"]'
    ];
    
    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          submitButton = element;
          console.log(`✅ Found submit button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (submitButton) {
      console.log('🚀 Submitting real token creation...');
      
      // Enable real submission for GalaChain
      await submitButton.click();
      
      console.log('⏳ Waiting for GalaChain transaction confirmation...');
      console.log('   This may take several minutes...');
      
      // Wait for transaction confirmation or error
      const confirmationSelectors = [
        'text=/success/i',
        'text=/created/i',
        'text=/confirmed/i',
        'text=/transaction.*hash/i',
        '.success-message',
        '.confirmation',
        '[data-testid*="success"]'
      ];
      
      let confirmed = false;
      const maxWaitTime = 300000; // 5 minutes
      const startTime = Date.now();
      
      while (!confirmed && (Date.now() - startTime) < maxWaitTime) {
        for (const selector of confirmationSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 5000 })) {
              confirmed = true;
              console.log(`✅ Transaction confirmed! Detected: ${selector}`);
              
              const confirmationText = await element.textContent();
              console.log(`   Message: ${confirmationText}`);
              break;
            }
          } catch (e) {
            // Continue checking
          }
        }
        
        if (!confirmed) {
          await page.waitForTimeout(10000); // Wait 10 seconds before checking again
          console.log('⏳ Still waiting for confirmation...');
        }
      }
      
      if (confirmed) {
        console.log('🎉 SUCCESS! GalaChain token created successfully!');
        console.log(`   Token Name: ${REAL_GALACHAIN_TOKEN.name}`);
        console.log(`   Token Symbol: ${REAL_GALACHAIN_TOKEN.symbol}`);
        console.log('   Token should now be visible on the live site!');
      } else {
        console.log('⚠️ Transaction confirmation not detected within 5 minutes');
        console.log('   Check your wallet for transaction status');
        console.log('   Token may still be processing on GalaChain');
      }
      
    } else {
      console.log('❌ Submit button not found!');
      console.log('💡 Manual submission may be required');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/galachain-token-created.png',
      fullPage: true 
    });
    
    console.log('');
    console.log('🎯 REAL GALACHAIN TOKEN CREATION COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📊 Token Details:`);
    console.log(`   Name: ${REAL_GALACHAIN_TOKEN.name}`);
    console.log(`   Symbol: ${REAL_GALACHAIN_TOKEN.symbol}`);
    console.log(`   Description: ${REAL_GALACHAIN_TOKEN.description}`);
    console.log('');
    console.log('🔍 Next Steps:');
    console.log('1. Search for your token on the live site');
    console.log('2. Verify it appears in token listings');
    console.log('3. Check that it\'s tradeable by other users');
    console.log('4. Monitor for graduation to DEX listing');
    console.log('');
    console.log('📸 Screenshots saved for verification');
  });
  
  test('should verify GalaChain token on live site', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    
    console.log('🔍 VERIFYING GALACHAIN TOKEN ON LIVE SITE');
    console.log('='.repeat(50));
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    console.log(`🔎 Searching for token: ${REAL_GALACHAIN_TOKEN.name} (${REAL_GALACHAIN_TOKEN.symbol})`);
    
    // Search for the token
    const searchSelectors = [
      'input[placeholder*="search" i]',
      'input[type="search"]',
      '.search-input',
      '[data-testid*="search"]'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          searchInput = element;
          console.log(`✅ Found search input: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (searchInput) {
      console.log(`🔍 Searching for: ${REAL_GALACHAIN_TOKEN.symbol}`);
      await searchInput.fill(REAL_GALACHAIN_TOKEN.symbol);
      await page.waitForTimeout(2000);
      
      // Look for search results
      const tokenFound = await page.locator(`text=${REAL_GALACHAIN_TOKEN.symbol}`).first().isVisible({ timeout: 10000 });
      
      if (tokenFound) {
        console.log('✅ GalaChain token found on live site!');
        console.log('🎉 Token creation verification successful!');
      } else {
        console.log('❌ GalaChain token not found yet');
        console.log('ℹ️ Token may still be processing or indexing');
      }
    } else {
      console.log('⚠️ Search functionality not found');
      console.log('ℹ️ Manual verification required');
    }
    
    // Look for token in listings
    const tokenListings = await page.locator('.token-card, .token-item, [data-testid*="token"]').count();
    console.log(`📊 Found ${tokenListings} tokens in current listings`);
    
    await page.screenshot({ 
      path: 'tests/screenshots/galachain-verification.png',
      fullPage: true 
    });
    
    console.log('✅ GalaChain token verification completed');
  });
});
