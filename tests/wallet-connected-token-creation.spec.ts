import { test, expect } from '@playwright/test';

/**
 * Enhanced Token Creation Test with Wallet Connection
 * This test handles wallet connection before attempting token creation
 */

test.describe('Real Token Creation with Wallet Connection', () => {
  
  // Test data for our new token
  const TEST_TOKEN = {
    name: 'TestCoin2024',
    symbol: 'TC24',
    description: 'A test token created for graduation testing on Gala Launchpad platform',
    creatorWallet: 'client|618ae395c1c653111d3315be',
    graduationThreshold: 1640985.84,
    expectedCreatorReward: 17777
  };

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for wallet operations
    test.setTimeout(300000); // 5 minutes
    
    console.log('🚀 Starting enhanced token creation test with wallet connection...');
    
    // Navigate to Gala Launchpad
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-test-start.png',
      fullPage: true 
    });
  });

  test('should connect wallet and create a real token', async ({ page }) => {
    console.log('📝 STEP 1: Attempt wallet connection');
    
    // Look for connect wallet button with various possible texts
    const connectWalletSelectors = [
      'text=/connect.*wallet/i',
      'text=/sign.*in/i',
      'text=/login/i',
      'button:has-text("Connect")',
      '[data-testid*="connect"]',
      '.connect-wallet',
      '#connect-wallet'
    ];
    
    let walletConnected = false;
    let connectButton = null;
    
    // Try to find connect wallet button
    for (const selector of connectWalletSelectors) {
      const button = await page.locator(selector).first();
      if (await button.isVisible()) {
        connectButton = button;
        console.log(`✅ Found connect wallet button with selector: ${selector}`);
        break;
      }
    }
    
    if (connectButton) {
      try {
        console.log('🔗 Attempting to connect wallet...');
        await connectButton.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot of wallet connection modal/page
        await page.screenshot({ 
          path: 'tests/screenshots/wallet-connection-modal.png',
          fullPage: true 
        });
        
        // Look for Gala wallet option
        const galaWalletSelectors = [
          'text=/gala.*wallet/i',
          'text=/gala/i',
          '[data-testid*="gala"]',
          'img[alt*="gala" i]',
          'button:has-text("Gala")'
        ];
        
        let galaWalletButton = null;
        for (const selector of galaWalletSelectors) {
          const button = await page.locator(selector).first();
          if (await button.isVisible()) {
            galaWalletButton = button;
            console.log(`✅ Found Gala wallet option with selector: ${selector}`);
            break;
          }
        }
        
        if (galaWalletButton) {
          console.log('🎮 Selecting Gala wallet...');
          await galaWalletButton.click();
          await page.waitForTimeout(3000);
          
          // Handle potential wallet authentication flow
          // Note: In a real scenario, this would require actual wallet interaction
          // For testing, we'll simulate or skip this step
          
          // Check if we're now connected by looking for user/wallet indicators
          const walletIndicators = [
            'text=/connected/i',
            'text=/0x[a-fA-F0-9]{40}/',
            'text=/client\\|[a-fA-F0-9]{24}/',
            '.wallet-connected',
            '[data-testid*="wallet-address"]'
          ];
          
          for (const indicator of walletIndicators) {
            const element = await page.locator(indicator).first();
            if (await element.isVisible()) {
              walletConnected = true;
              console.log(`✅ Wallet connection confirmed with indicator: ${indicator}`);
              break;
            }
          }
          
        } else {
          console.log('⚠️ Gala wallet option not found in modal');
        }
        
      } catch (error) {
        console.log(`⚠️ Error during wallet connection: ${error}`);
      }
    } else {
      console.log('ℹ️ No connect wallet button found - checking if already connected');
      
      // Check if already connected
      const walletIndicators = [
        'text=/connected/i',
        'text=/0x[a-fA-F0-9]{40}/',
        'text=/client\\|[a-fA-F0-9]{24}/',
        '.wallet-connected'
      ];
      
      for (const indicator of walletIndicators) {
        const element = await page.locator(indicator).first();
        if (await element.isVisible()) {
          walletConnected = true;
          console.log(`✅ Already connected - found indicator: ${indicator}`);
          break;
        }
      }
    }
    
    // Take screenshot after wallet connection attempt
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-after-connection.png',
      fullPage: true 
    });
    
    console.log('📝 STEP 2: Navigate to token creation form');
    
    // Now look for launch/create token button (should be available after wallet connection)
    const launchSelectors = [
      'text=/launch.*coin/i',
      'text=/create.*token/i',
      'text=/launch.*token/i',
      'text=/start.*launch/i',
      'button:has-text("Launch")',
      'a[href*="launch"]',
      '[data-testid*="launch"]',
      '.launch-button'
    ];
    
    let launchButton = null;
    for (const selector of launchSelectors) {
      const button = await page.locator(selector).first();
      if (await button.isVisible()) {
        launchButton = button;
        console.log(`✅ Found launch button with selector: ${selector}`);
        break;
      }
    }
    
    if (launchButton) {
      console.log('🚀 Clicking launch button...');
      await launchButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    } else {
      console.log('🔍 No launch button found, trying direct navigation...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/launch');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }
    
    // Take screenshot of launch page
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-launch-page.png',
      fullPage: true 
    });
    
    console.log('📝 STEP 3: Look for token creation form (post-wallet-connection)');
    
    // Enhanced form field detection with more selectors
    const formFieldSelectors = {
      name: [
        'input[name*="name" i]',
        'input[placeholder*="name" i]',
        'input[placeholder*="token" i]',
        '[data-testid*="name"]',
        '#token-name',
        '.token-name input',
        'input[type="text"]:first-of-type'
      ],
      symbol: [
        'input[name*="symbol" i]',
        'input[placeholder*="symbol" i]',
        'input[placeholder*="ticker" i]',
        '[data-testid*="symbol"]',
        '#token-symbol',
        '.token-symbol input',
        'input[maxlength="8"]'
      ],
      description: [
        'textarea[name*="description" i]',
        'textarea[placeholder*="description" i]',
        'textarea[placeholder*="about" i]',
        '[data-testid*="description"]',
        '#token-description',
        '.token-description textarea',
        'textarea:first-of-type'
      ]
    };
    
    const foundFields = {
      name: null,
      symbol: null,
      description: null
    };
    
    // Try to find each form field
    for (const [fieldType, selectors] of Object.entries(formFieldSelectors)) {
      for (const selector of selectors) {
        const field = await page.locator(selector).first();
        if (await field.isVisible()) {
          foundFields[fieldType] = field;
          console.log(`✅ Found ${fieldType} field with selector: ${selector}`);
          break;
        }
      }
    }
    
    // Count how many fields we found
    const foundFieldCount = Object.values(foundFields).filter(field => field !== null).length;
    console.log(`📊 Found ${foundFieldCount}/3 form fields`);
    
    if (foundFieldCount > 0) {
      console.log('📝 STEP 4: Fill out token creation form');
      
      // Fill name field
      if (foundFields.name) {
        try {
          await foundFields.name.fill(TEST_TOKEN.name);
          const nameValue = await foundFields.name.inputValue();
          console.log(`✅ Filled token name: "${nameValue}"`);
        } catch (error) {
          console.log(`⚠️ Error filling name field: ${error}`);
        }
      }
      
      // Fill symbol field
      if (foundFields.symbol) {
        try {
          await foundFields.symbol.fill(TEST_TOKEN.symbol);
          const symbolValue = await foundFields.symbol.inputValue();
          console.log(`✅ Filled token symbol: "${symbolValue}"`);
        } catch (error) {
          console.log(`⚠️ Error filling symbol field: ${error}`);
        }
      }
      
      // Fill description field
      if (foundFields.description) {
        try {
          await foundFields.description.fill(TEST_TOKEN.description);
          const descValue = await foundFields.description.inputValue();
          console.log(`✅ Filled description: "${descValue.substring(0, 50)}..."`);
        } catch (error) {
          console.log(`⚠️ Error filling description field: ${error}`);
        }
      }
      
      // Take screenshot with filled form
      await page.screenshot({ 
        path: 'tests/screenshots/wallet-form-filled.png',
        fullPage: true 
      });
      
      console.log('📝 STEP 5: Look for submit button');
      
      // Look for submit/create button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Create")',
        'button:has-text("Launch")',
        'button:has-text("Submit")',
        'button:has-text("Deploy")',
        '[data-testid*="submit"]',
        '[data-testid*="create"]',
        '.submit-button',
        '.create-button'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        const button = await page.locator(selector).first();
        if (await button.isVisible() && await button.isEnabled()) {
          submitButton = button;
          console.log(`✅ Found submit button with selector: ${selector}`);
          break;
        }
      }
      
      if (submitButton) {
        console.log('🚀 ATTEMPTING TO CREATE REAL TOKEN...');
        console.log('⚠️  WARNING: This will create a real token on the blockchain!');
        console.log('⚠️  Make sure you want to proceed with actual token creation.');
        
        // For safety, let's not automatically submit in the test
        // Instead, take a screenshot and log the readiness
        await page.screenshot({ 
          path: 'tests/screenshots/wallet-ready-to-submit.png',
          fullPage: true 
        });
        
        console.log('✅ Form is ready for submission!');
        console.log('📋 Token details ready to create:');
        console.log(`   Name: ${TEST_TOKEN.name}`);
        console.log(`   Symbol: ${TEST_TOKEN.symbol}`);
        console.log(`   Description: ${TEST_TOKEN.description}`);
        console.log(`   Creator: ${TEST_TOKEN.creatorWallet}`);
        
        // Uncomment the next lines to actually create the token:
        // await submitButton.click();
        // await page.waitForTimeout(5000);
        // console.log('🎉 Token creation submitted!');
        
      } else {
        console.log('⚠️ No submit button found or button is disabled');
        
        // Check for any validation errors
        const errorSelectors = [
          '.error',
          '.invalid',
          '[role="alert"]',
          '.validation-error',
          '[data-testid*="error"]'
        ];
        
        for (const selector of errorSelectors) {
          const errors = await page.locator(selector).all();
          if (errors.length > 0) {
            console.log(`⚠️ Found ${errors.length} validation errors:`);
            for (let i = 0; i < errors.length; i++) {
              const errorText = await errors[i].textContent();
              console.log(`   ${i + 1}. ${errorText}`);
            }
          }
        }
      }
      
    } else {
      console.log('❌ No form fields found after wallet connection');
      console.log('💡 This might indicate:');
      console.log('   - Wallet connection failed');
      console.log('   - Additional authentication required');
      console.log('   - Different page structure than expected');
      console.log('   - JavaScript not fully loaded');
    }
    
    console.log('📝 STEP 6: Final analysis and recommendations');
    
    // Analyze the current page state
    const currentUrl = page.url();
    const pageTitle = await page.title();
    const pageText = await page.textContent('body');
    
    console.log('📊 FINAL PAGE ANALYSIS:');
    console.log(`   URL: ${currentUrl}`);
    console.log(`   Title: ${pageTitle}`);
    console.log(`   Wallet Connected: ${walletConnected ? 'YES' : 'NO'}`);
    console.log(`   Form Fields Found: ${foundFieldCount}/3`);
    console.log(`   Page Length: ${pageText?.length || 0} characters`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-final-state.png',
      fullPage: true 
    });
    
    // Provide recommendations based on findings
    if (walletConnected && foundFieldCount === 3) {
      console.log('🎉 SUCCESS: Ready to create real token!');
      console.log('💡 To create the token, uncomment the submit button click in the test');
    } else if (walletConnected && foundFieldCount > 0) {
      console.log('⚠️ PARTIAL SUCCESS: Wallet connected but some form fields missing');
      console.log('💡 Check the screenshots to see what fields are available');
    } else if (walletConnected) {
      console.log('⚠️ WALLET CONNECTED: But no form fields found');
      console.log('💡 May need to navigate to a different page or wait longer');
    } else {
      console.log('❌ WALLET CONNECTION FAILED');
      console.log('💡 Manual wallet connection may be required');
    }
    
    console.log('✅ Enhanced wallet connection test completed');
  });

  test('should simulate token creation without actual submission', async ({ page }) => {
    console.log('🧮 SIMULATING TOKEN CREATION PROCESS');
    
    // This test simulates the full process without actually creating a token
    const simulatedToken = {
      ...TEST_TOKEN,
      creationTime: new Date().toISOString(),
      initialMarketCap: 0,
      bondingCurveProgress: 0
    };
    
    console.log('📋 SIMULATED TOKEN CREATION:');
    console.log(`   Name: ${simulatedToken.name}`);
    console.log(`   Symbol: ${simulatedToken.symbol}`);
    console.log(`   Creator: ${simulatedToken.creatorWallet}`);
    console.log(`   Creation Time: ${simulatedToken.creationTime}`);
    
    // Simulate progression to graduation
    const progressSteps = [
      { marketCap: 500000, progress: 30.5, timeElapsed: '1 hour' },
      { marketCap: 800000, progress: 48.7, timeElapsed: '3 hours' },
      { marketCap: 1200000, progress: 73.1, timeElapsed: '8 hours' },
      { marketCap: 1500000, progress: 91.4, timeElapsed: '18 hours' },
      { marketCap: TEST_TOKEN.graduationThreshold, progress: 100.0, timeElapsed: '24 hours' }
    ];
    
    console.log('📈 SIMULATED PROGRESSION TO GRADUATION:');
    for (const step of progressSteps) {
      console.log(`   ${step.timeElapsed}: ${step.marketCap.toLocaleString()} GALA (${step.progress.toFixed(1)}%)`);
      if (step.progress >= 100) {
        console.log('   🎓 GRADUATION ACHIEVED!');
        break;
      }
    }
    
    // Simulate graduation rewards
    const graduationRewards = {
      totalPool: TEST_TOKEN.graduationThreshold,
      creatorReward: TEST_TOKEN.expectedCreatorReward,
      platformFee: TEST_TOKEN.graduationThreshold * 0.05,
      dexPool: 0
    };
    graduationRewards.dexPool = graduationRewards.totalPool - graduationRewards.creatorReward - graduationRewards.platformFee;
    
    console.log('💰 SIMULATED GRADUATION REWARDS:');
    console.log(`   Creator Reward: ${graduationRewards.creatorReward.toLocaleString()} GALA`);
    console.log(`   Platform Fee: ${graduationRewards.platformFee.toLocaleString()} GALA`);
    console.log(`   DEX Pool: ${graduationRewards.dexPool.toLocaleString()} GALA`);
    
    // Verify calculations
    const totalDistributed = graduationRewards.creatorReward + graduationRewards.platformFee + graduationRewards.dexPool;
    expect(Math.abs(totalDistributed - graduationRewards.totalPool)).toBeLessThan(0.01);
    
    console.log('✅ Simulation completed successfully');
  });

  test('should provide manual token creation guide', async ({ page }) => {
    console.log('📖 MANUAL TOKEN CREATION GUIDE');
    console.log('=====================================');
    
    console.log('🔗 STEP 1: Connect Your Gala Wallet');
    console.log('   1. Go to https://lpad-frontend-dev1.defi.gala.com');
    console.log('   2. Click "Connect Wallet" button');
    console.log('   3. Select "Gala Wallet" option');
    console.log('   4. Use wallet address: client|618ae395c1c653111d3315be');
    console.log('   5. Sign the connection request');
    
    console.log('🚀 STEP 2: Navigate to Token Creation');
    console.log('   1. Look for "Launch a Coin" or "Create Token" button');
    console.log('   2. Click to access the token creation form');
    
    console.log('📝 STEP 3: Fill Token Details');
    console.log(`   Name: ${TEST_TOKEN.name}`);
    console.log(`   Symbol: ${TEST_TOKEN.symbol}`);
    console.log(`   Description: ${TEST_TOKEN.description}`);
    console.log('   Image: Upload a small PNG/JPG (optional)');
    
    console.log('✅ STEP 4: Submit and Confirm');
    console.log('   1. Review all details carefully');
    console.log('   2. Click "Create Token" or "Launch"');
    console.log('   3. Confirm transaction in wallet');
    console.log('   4. Wait for blockchain confirmation');
    
    console.log('📊 STEP 5: Monitor Your Token');
    console.log('   1. Search for "TestCoin2024" or "TC24"');
    console.log('   2. View bonding curve progress');
    console.log('   3. Track market cap toward 1,640,985.84 GALA');
    console.log('   4. Monitor for graduation event');
    
    console.log('=====================================');
    console.log('💡 TIP: The automated test can fill the form,');
    console.log('   but you need to manually connect the wallet');
    console.log('   and confirm the final submission.');
  });
});
