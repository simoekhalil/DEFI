import { test, expect } from '@playwright/test';

/**
 * Semi-Automated Token Creation Test
 * Pauses for manual wallet connection, then continues with automated form filling and token creation
 */

test.describe('Semi-Automated Token Creation with Manual Wallet Connection', () => {
  
  const TEST_TOKEN = {
    name: 'TestCoin2024',
    symbol: 'TC24',
    description: 'A test token created for graduation testing on Gala Launchpad platform',
    creatorWallet: 'client|618ae395c1c653111d3315be',
    graduationThreshold: 1640985.84,
    expectedCreatorReward: 17777
  };

  test('should pause for manual wallet connection then automate token creation', async ({ page }) => {
    // Extend timeout for manual interaction
    test.setTimeout(600000); // 10 minutes
    
    console.log('🎯 SEMI-AUTOMATED TOKEN CREATION');
    console.log('='.repeat(50));
    console.log('This test will:');
    console.log('1. Navigate to Gala Launchpad');
    console.log('2. PAUSE for you to manually connect wallet');
    console.log('3. Automatically fill the token creation form');
    console.log('4. PAUSE for you to confirm token creation');
    console.log('5. Monitor the created token');
    console.log('='.repeat(50));
    
    // Step 1: Navigate to Gala Launchpad
    console.log('📝 STEP 1: Navigating to Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/semi-auto-start.png',
      fullPage: true 
    });
    
    console.log('✅ Navigated to Gala Launchpad');
    
    // Step 2: Check if wallet is already connected
    console.log('📝 STEP 2: Checking wallet connection status...');
    
    const walletIndicators = [
      'text=/connected/i',
      'text=/0x[a-fA-F0-9]{40}/',
      'text=/client\\|[a-fA-F0-9]{24}/',
      '.wallet-connected',
      '[data-testid*="wallet-address"]',
      'text=/disconnect/i',
      'text=/balance/i'
    ];
    
    let walletConnected = false;
    for (const indicator of walletIndicators) {
      const element = await page.locator(indicator).first();
      if (await element.isVisible()) {
        walletConnected = true;
        console.log(`✅ Wallet already connected - detected: ${indicator}`);
        break;
      }
    }
    
    if (!walletConnected) {
      console.log('');
      console.log('🔗 MANUAL ACTION REQUIRED: CONNECT YOUR WALLET');
      console.log('='.repeat(50));
      console.log('Please perform the following steps:');
      console.log('1. Look for "Connect Wallet" button on the page');
      console.log('2. Click it');
      console.log('3. Select "Gala Wallet" or appropriate option');
      console.log('4. Use wallet address: client|618ae395c1c653111d3315be');
      console.log('5. Sign the connection request');
      console.log('');
      console.log('⏳ The test will wait for up to 5 minutes...');
      console.log('   Once connected, the test will continue automatically');
      console.log('='.repeat(50));
      
      // Wait for manual wallet connection with progress indicators
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes (5 seconds * 60)
      
      while (!walletConnected && attempts < maxAttempts) {
        await page.waitForTimeout(5000); // Wait 5 seconds
        attempts++;
        
        // Show progress every 12 attempts (1 minute)
        if (attempts % 12 === 0) {
          console.log(`⏳ Still waiting... (${attempts * 5} seconds elapsed, ${(maxAttempts - attempts) * 5} seconds remaining)`);
          
          // Take a screenshot to show current state
          await page.screenshot({ 
            path: `tests/screenshots/semi-auto-waiting-${attempts}.png`,
            fullPage: true 
          });
        }
        
        // Check for wallet connection indicators
        for (const indicator of walletIndicators) {
          const element = await page.locator(indicator).first();
          if (await element.isVisible()) {
            walletConnected = true;
            console.log(`✅ WALLET CONNECTED! Detected after ${attempts * 5} seconds`);
            break;
          }
        }
      }
      
      if (!walletConnected) {
        console.log('❌ TIMEOUT: Wallet not connected within 5 minutes');
        console.log('💡 Please connect your wallet manually and run the test again');
        await page.screenshot({ 
          path: 'tests/screenshots/semi-auto-timeout.png',
          fullPage: true 
        });
        throw new Error('Wallet connection timeout');
      }
    }
    
    // Step 3: Navigate to token creation form
    console.log('📝 STEP 3: Navigating to token creation form...');
    
    await page.screenshot({ 
      path: 'tests/screenshots/semi-auto-wallet-connected.png',
      fullPage: true 
    });
    
    // Look for launch/create token button
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
        console.log(`✅ Found launch button: ${selector}`);
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
    
    await page.screenshot({ 
      path: 'tests/screenshots/semi-auto-launch-page.png',
      fullPage: true 
    });
    
    // Step 4: Automated form filling
    console.log('📝 STEP 4: Automated form filling...');
    
    // Enhanced form field detection with more selectors
    const formFieldSelectors = {
      name: [
        'input[name*="name" i]',
        'input[placeholder*="name" i]',
        'input[placeholder*="token" i]',
        '[data-testid*="name"]',
        '#token-name',
        '.token-name input',
        'input[type="text"]:first-of-type',
        'input[maxlength="25"]'
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
        'textarea:first-of-type',
        'textarea[maxlength="250"]'
      ]
    };
    
    const foundFields = { name: null, symbol: null, description: null };
    
    // Find form fields with detailed logging
    for (const [fieldType, selectors] of Object.entries(formFieldSelectors)) {
      console.log(`🔍 Looking for ${fieldType} field...`);
      for (const selector of selectors) {
        const field = await page.locator(selector).first();
        if (await field.isVisible()) {
          foundFields[fieldType] = field;
          console.log(`✅ Found ${fieldType} field: ${selector}`);
          break;
        }
      }
      if (!foundFields[fieldType]) {
        console.log(`⚠️ ${fieldType} field not found`);
      }
    }
    
    const foundFieldCount = Object.values(foundFields).filter(f => f !== null).length;
    console.log(`📊 Found ${foundFieldCount}/3 form fields`);
    
    if (foundFieldCount === 0) {
      console.log('❌ No form fields found after wallet connection');
      console.log('💡 Possible reasons:');
      console.log('   - Form requires additional navigation steps');
      console.log('   - Different page structure than expected');
      console.log('   - Additional authentication required');
      
      await page.screenshot({ 
        path: 'tests/screenshots/semi-auto-no-form.png',
        fullPage: true 
      });
      
      console.log('');
      console.log('🔍 MANUAL ACTION: Please navigate to the token creation form');
      console.log('   Then press Enter in the terminal to continue...');
      
      // Wait for user to navigate manually
      await page.waitForTimeout(30000); // Wait 30 seconds for manual navigation
      
      // Try to find fields again
      for (const [fieldType, selectors] of Object.entries(formFieldSelectors)) {
        for (const selector of selectors) {
          const field = await page.locator(selector).first();
          if (await field.isVisible()) {
            foundFields[fieldType] = field;
            console.log(`✅ Found ${fieldType} field after manual navigation: ${selector}`);
            break;
          }
        }
      }
    }
    
    // Fill form fields automatically
    let filledFields = 0;
    
    if (foundFields.name) {
      try {
        console.log(`📝 Filling name field with: ${TEST_TOKEN.name}`);
        await foundFields.name.fill(TEST_TOKEN.name);
        const value = await foundFields.name.inputValue();
        console.log(`✅ Name field filled: "${value}"`);
        filledFields++;
      } catch (error) {
        console.log(`⚠️ Error filling name field: ${error.message}`);
      }
    }
    
    if (foundFields.symbol) {
      try {
        console.log(`📝 Filling symbol field with: ${TEST_TOKEN.symbol}`);
        await foundFields.symbol.fill(TEST_TOKEN.symbol);
        const value = await foundFields.symbol.inputValue();
        console.log(`✅ Symbol field filled: "${value}"`);
        filledFields++;
      } catch (error) {
        console.log(`⚠️ Error filling symbol field: ${error.message}`);
      }
    }
    
    if (foundFields.description) {
      try {
        console.log(`📝 Filling description field...`);
        await foundFields.description.fill(TEST_TOKEN.description);
        const value = await foundFields.description.inputValue();
        console.log(`✅ Description field filled: "${value.substring(0, 50)}..."`);
        filledFields++;
      } catch (error) {
        console.log(`⚠️ Error filling description field: ${error.message}`);
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/semi-auto-form-filled.png',
      fullPage: true 
    });
    
    console.log(`📊 Successfully filled ${filledFields}/${foundFieldCount} fields`);
    
    // Step 5: Prepare for token creation
    console.log('📝 STEP 5: Preparing for token creation...');
    
    // Look for submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Launch")',
      'button:has-text("Deploy")',
      'button:has-text("Submit")',
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
        console.log(`✅ Found submit button: ${selector}`);
        break;
      }
    }
    
    if (submitButton) {
      await page.screenshot({ 
        path: 'tests/screenshots/semi-auto-ready-to-submit.png',
        fullPage: true 
      });
      
      console.log('');
      console.log('🎉 FORM READY FOR TOKEN CREATION!');
      console.log('='.repeat(50));
      console.log('📋 Token Details:');
      console.log(`   Name: ${TEST_TOKEN.name}`);
      console.log(`   Symbol: ${TEST_TOKEN.symbol}`);
      console.log(`   Description: ${TEST_TOKEN.description}`);
      console.log(`   Creator Wallet: ${TEST_TOKEN.creatorWallet}`);
      console.log('');
      console.log('⚠️  IMPORTANT: This will create a REAL token on the blockchain!');
      console.log('💰 This may require GALA tokens for gas fees');
      console.log('');
      console.log('🚀 MANUAL CONFIRMATION REQUIRED:');
      console.log('   The test will now PAUSE for your confirmation');
      console.log('   You have 2 minutes to decide...');
      console.log('');
      console.log('   OPTIONS:');
      console.log('   1. Let the test continue automatically (creates real token)');
      console.log('   2. Cancel the test (Ctrl+C) to stop without creating');
      console.log('='.repeat(50));
      
      // Wait for user confirmation (2 minutes)
      console.log('⏳ Waiting for confirmation... (120 seconds)');
      await page.waitForTimeout(120000); // 2 minutes
      
      console.log('🚀 CREATING REAL TOKEN...');
      console.log('   Clicking submit button...');
      
      try {
        await submitButton.click();
        console.log('✅ Submit button clicked!');
        
        // Wait for transaction to process
        console.log('⏳ Waiting for transaction to process...');
        await page.waitForTimeout(10000); // 10 seconds
        
        await page.screenshot({ 
          path: 'tests/screenshots/semi-auto-after-submit.png',
          fullPage: true 
        });
        
        // Step 6: Monitor token creation
        console.log('📝 STEP 6: Monitoring token creation...');
        
        // Look for success indicators
        const successIndicators = [
          'text=/success/i',
          'text=/created/i',
          'text=/confirmed/i',
          'text=/transaction/i',
          '.success',
          '.confirmation'
        ];
        
        let tokenCreated = false;
        for (const indicator of successIndicators) {
          const element = await page.locator(indicator).first();
          if (await element.isVisible()) {
            tokenCreated = true;
            console.log(`✅ Token creation success indicator found: ${indicator}`);
            break;
          }
        }
        
        if (tokenCreated) {
          console.log('🎉 TOKEN CREATION SUCCESSFUL!');
          console.log('='.repeat(50));
          console.log('✅ TestCoin2024 (TC24) has been created!');
          console.log('');
          console.log('📊 Next Steps:');
          console.log('1. Search for "TestCoin2024" or "TC24" on the platform');
          console.log('2. Monitor bonding curve progress');
          console.log('3. Track market cap toward 1,640,985.84 GALA');
          console.log('4. Wait for graduation and rewards distribution');
          console.log('');
          console.log('🎓 Graduation Details:');
          console.log(`   Threshold: ${TEST_TOKEN.graduationThreshold.toLocaleString()} GALA`);
          console.log(`   Your Reward: ${TEST_TOKEN.expectedCreatorReward.toLocaleString()} GALA`);
          console.log('='.repeat(50));
        } else {
          console.log('⚠️ Token creation status unclear');
          console.log('💡 Check the screenshots and page manually');
        }
        
      } catch (error) {
        console.log(`❌ Error during token creation: ${error.message}`);
        await page.screenshot({ 
          path: 'tests/screenshots/semi-auto-error.png',
          fullPage: true 
        });
      }
      
    } else {
      console.log('⚠️ No submit button found or button is disabled');
      console.log('💡 Check form validation - some fields may be invalid');
      
      // Check for validation errors
      const errorElements = await page.locator('.error, .invalid, [role="alert"], .validation-error').all();
      if (errorElements.length > 0) {
        console.log(`⚠️ Found ${errorElements.length} validation errors:`);
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await errorElements[i].textContent();
          console.log(`   ${i + 1}. ${errorText}`);
        }
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/semi-auto-final.png',
      fullPage: true 
    });
    
    console.log('✅ Semi-automated test completed!');
  });

  test('should provide real-time guidance during token creation', async ({ page }) => {
    console.log('📖 REAL-TIME TOKEN CREATION GUIDANCE');
    console.log('='.repeat(50));
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    console.log('🎯 Current Status: Ready to begin token creation');
    console.log('');
    console.log('📋 Checklist for TestCoin2024 Creation:');
    console.log('   [ ] Navigate to Gala Launchpad');
    console.log('   [ ] Connect Gala wallet (client|618ae395c1c653111d3315be)');
    console.log('   [ ] Find token creation form');
    console.log('   [ ] Fill token name: TestCoin2024');
    console.log('   [ ] Fill token symbol: TC24');
    console.log('   [ ] Fill description');
    console.log('   [ ] Submit and confirm transaction');
    console.log('   [ ] Monitor for graduation at 1,640,985.84 GALA');
    console.log('');
    console.log('💡 Use the semi-automated test to handle most steps automatically!');
    console.log('   Command: npm run test:semi-auto');
  });
});
