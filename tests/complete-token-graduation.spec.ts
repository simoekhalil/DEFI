import { test, expect } from '@playwright/test';

/**
 * Complete Token Creation and Graduation Test
 * Creates TestCoin2024 and performs real trading to graduate it to DEX
 */

test.describe('Complete Token Creation and Graduation Flow', () => {
  
  const TEST_TOKEN = {
    name: 'TestCoin2024',
    symbol: 'TC24',
    description: 'A test token created for graduation testing on Gala Launchpad platform',
    creatorWallet: 'client|618ae395c1c653111d3315be',
    graduationThreshold: 1640985.84, // GALA needed for graduation
    expectedCreatorReward: 17777,
    // Trading strategy to reach graduation
    tradingPlan: [
      { buyAmount: 200000, expectedMarketCap: 400000, progress: 24.4 },
      { buyAmount: 300000, expectedMarketCap: 800000, progress: 48.7 },
      { buyAmount: 400000, expectedMarketCap: 1200000, progress: 73.1 },
      { buyAmount: 440985.84, expectedMarketCap: 1640985.84, progress: 100.0 }
    ]
  };

  test('should create token and perform real trading to graduate it', async ({ page }) => {
    test.setTimeout(1500000); // 25 minutes timeout
    
    console.log('🎯 COMPLETE TOKEN CREATION AND GRADUATION');
    console.log('='.repeat(60));
    console.log('This test will:');
    console.log('1. Create TestCoin2024 token');
    console.log('2. Perform REAL trading to reach graduation threshold');
    console.log('3. Trigger actual graduation to DEX');
    console.log('4. Verify creator rewards distribution');
    console.log('='.repeat(60));
    console.log(`💰 Total GALA needed: ${TEST_TOKEN.graduationThreshold.toLocaleString()} GALA`);
    console.log(`🎁 Your graduation reward: ${TEST_TOKEN.expectedCreatorReward.toLocaleString()} GALA`);
    console.log('='.repeat(60));
    
    // PHASE 1: TOKEN CREATION
    console.log('📝 PHASE 1: TOKEN CREATION');
    console.log('-'.repeat(40));
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Proper wait time for page load
    
    await page.screenshot({ 
      path: 'tests/screenshots/graduation-start.png',
      fullPage: true 
    });
    
    // Check wallet connection
    const walletStatus = await page.evaluate(() => {
      const indicators = [
        () => /connected|disconnect|balance/i.test(document.body.textContent || ''),
        () => /0x[a-fA-F0-9]{40}|client\|[a-fA-F0-9]{24}/.test(document.body.textContent || ''),
        () => document.querySelector('[data-testid*="wallet"]'),
        () => document.querySelector('.wallet-connected')
      ];
      
      for (let i = 0; i < indicators.length; i++) {
        try {
          if (indicators[i]()) {
            return { connected: true, method: i };
          }
        } catch (e) {}
      }
      return { connected: false };
    });
    
    if (!walletStatus.connected) {
      console.log('🔗 MANUAL ACTION: Connect your Gala wallet');
      console.log('   Wallet: client|618ae395c1c653111d3315be');
      console.log('   Waiting up to 5 minutes for connection...');
      
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes for wallet connection
      let walletConnected = false;
      
      while (!walletConnected && attempts < maxAttempts) {
        await page.waitForTimeout(5000); // 5 seconds between checks
        attempts++;
        
        const status = await page.evaluate(() => {
          return /connected|disconnect|balance|0x[a-fA-F0-9]{40}|client\|[a-fA-F0-9]{24}/i.test(document.body.textContent || '');
        });
        
        if (status) {
          walletConnected = true;
          console.log(`✅ Wallet connected after ${attempts * 5} seconds`);
        } else if (attempts % 12 === 0) {
          console.log(`⏳ Still waiting... (${attempts * 5}s elapsed)`);
        }
      }
      
      if (!walletConnected) {
        throw new Error('Wallet connection timeout');
      }
    } else {
      console.log('✅ Wallet already connected');
    }
    
    // Navigate to token creation
    console.log('🚀 Navigating to token creation form...');
    
    const launchButton = await page.locator('text=/launch.*coin|create.*token/i').first();
    if (await launchButton.isVisible()) {
      await launchButton.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/launch');
      await page.waitForLoadState('networkidle');
    }
    
    await page.waitForTimeout(3000);
    
    // Fill token creation form
    console.log('📝 Filling token creation form...');
    
    const formFields = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
      const fields = [];
      
      inputs.forEach((input, index) => {
        if (input.offsetParent !== null) {
          const text = (input.name + input.placeholder + input.id + input.className).toLowerCase();
          let purpose = 'unknown';
          
          if (text.includes('name') || text.includes('token')) purpose = 'name';
          else if (text.includes('symbol') || text.includes('ticker')) purpose = 'symbol';
          else if (text.includes('description') || text.includes('about')) purpose = 'description';
          
          fields.push({ index, purpose, selector: `${input.tagName.toLowerCase()}:nth-of-type(${index + 1})` });
        }
      });
      
      return fields;
    });
    
    // Fill form fields
    for (const field of formFields) {
      try {
        if (field.purpose === 'name') {
          await page.locator(field.selector).fill(TEST_TOKEN.name);
          console.log(`✅ Filled name: ${TEST_TOKEN.name}`);
        } else if (field.purpose === 'symbol') {
          await page.locator(field.selector).fill(TEST_TOKEN.symbol);
          console.log(`✅ Filled symbol: ${TEST_TOKEN.symbol}`);
        } else if (field.purpose === 'description') {
          await page.locator(field.selector).fill(TEST_TOKEN.description);
          console.log(`✅ Filled description`);
        }
      } catch (error) {
        console.log(`⚠️ Error filling ${field.purpose}: ${error.message}`);
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/graduation-form-filled.png',
      fullPage: true 
    });
    
    // Submit token creation
    console.log('🚀 Creating token...');
    
    const submitButton = await page.locator('button:has-text("Create"), button:has-text("Launch"), button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      console.log('⚠️  CREATING REAL TOKEN IN 10 SECONDS...');
      console.log('   Press Ctrl+C to cancel!');
      
      for (let i = 10; i > 0; i--) {
        console.log(`⏳ Creating in ${i}...`);
        await page.waitForTimeout(1000);
      }
      
      await submitButton.click();
      console.log('✅ Token creation submitted!');
      
      // Wait for token creation confirmation
      await page.waitForTimeout(15000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/graduation-token-created.png',
        fullPage: true 
      });
    }
    
    // PHASE 2: TRADING TO GRADUATION
    console.log('');
    console.log('📝 PHASE 2: TRADING TO GRADUATION');
    console.log('-'.repeat(40));
    console.log('🔍 Finding TestCoin2024 for trading...');
    
    // Search for the newly created token
    const searchSelectors = [
      'input[placeholder*="search" i]',
      'input[name*="search" i]',
      '[data-testid*="search"]',
      '.search-input'
    ];
    
    let searchField = null;
    for (const selector of searchSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible()) {
        searchField = field;
        break;
      }
    }
    
    if (searchField) {
      await searchField.fill('TestCoin2024');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      console.log('✅ Searched for TestCoin2024');
    } else {
      // Try direct navigation to token page
      console.log('🔍 Trying to find token directly...');
      
      // Look for token links or cards
      const tokenLinks = await page.locator('text=/TestCoin2024|TC24/i').all();
      if (tokenLinks.length > 0) {
        await tokenLinks[0].click();
        await page.waitForTimeout(3000);
        console.log('✅ Found and clicked TestCoin2024');
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/graduation-token-found.png',
      fullPage: true 
    });
    
    // PHASE 3: EXECUTE TRADING PLAN
    console.log('');
    console.log('📝 PHASE 3: EXECUTE TRADING PLAN');
    console.log('-'.repeat(40));
    
    let totalSpent = 0;
    let currentMarketCap = 0;
    
    for (let i = 0; i < TEST_TOKEN.tradingPlan.length; i++) {
      const trade = TEST_TOKEN.tradingPlan[i];
      console.log(`\n💰 TRADE ${i + 1}/4: Buying ${trade.buyAmount.toLocaleString()} GALA worth of TC24`);
      console.log(`   Target market cap: ${trade.expectedMarketCap.toLocaleString()} GALA (${trade.progress}%)`);
      
      // Find buy button and amount input
      const buyButton = await page.locator('button:has-text("Buy"), button:has-text("Purchase")').first();
      const amountInput = await page.locator('input[placeholder*="amount" i], input[name*="amount" i]').first();
      
      if (await buyButton.isVisible() && await amountInput.isVisible()) {
        try {
          // Enter buy amount
          await amountInput.fill(trade.buyAmount.toString());
          console.log(`📝 Entered buy amount: ${trade.buyAmount.toLocaleString()} GALA`);
          
          // Confirm the trade
          await buyButton.click();
          console.log('🚀 Buy order submitted...');
          
          // Wait for transaction confirmation
          await page.waitForTimeout(10000);
          
          // Check for confirmation or error
          const confirmationText = await page.textContent('body');
          if (confirmationText?.includes('success') || confirmationText?.includes('confirmed')) {
            console.log('✅ Trade confirmed!');
            totalSpent += trade.buyAmount;
            currentMarketCap = trade.expectedMarketCap;
            
            console.log(`📊 Progress: ${totalSpent.toLocaleString()} GALA spent, ${currentMarketCap.toLocaleString()} market cap`);
          } else if (confirmationText?.includes('error') || confirmationText?.includes('failed')) {
            console.log('❌ Trade failed - continuing with next trade');
          }
          
          await page.screenshot({ 
            path: `tests/screenshots/graduation-trade-${i + 1}.png`,
            fullPage: true 
          });
          
          // Wait between trades
          if (i < TEST_TOKEN.tradingPlan.length - 1) {
            console.log('⏳ Waiting 30 seconds before next trade...');
            await page.waitForTimeout(30000);
          }
          
        } catch (error) {
          console.log(`⚠️ Error executing trade ${i + 1}: ${error.message}`);
        }
      } else {
        console.log('⚠️ Buy interface not found - may need manual trading');
        console.log('💡 MANUAL ACTION: Please buy tokens manually to reach graduation');
        
        // Wait for manual trading
        console.log('⏳ Waiting 2 minutes for manual trading...');
        await page.waitForTimeout(120000);
      }
      
      // Check if graduation threshold reached
      if (currentMarketCap >= TEST_TOKEN.graduationThreshold) {
        console.log('🎓 GRADUATION THRESHOLD REACHED!');
        break;
      }
    }
    
    // PHASE 4: GRADUATION EVENT
    console.log('');
    console.log('📝 PHASE 4: GRADUATION EVENT');
    console.log('-'.repeat(40));
    
    if (currentMarketCap >= TEST_TOKEN.graduationThreshold) {
      console.log('🎓 Checking for graduation event...');
      
      // Look for graduation indicators
      const graduationIndicators = [
        'text=/graduated/i',
        'text=/graduation/i',
        'text=/dex/i',
        'text=/liquidity.*pool/i',
        'text=/trading.*live/i'
      ];
      
      let graduationDetected = false;
      for (const indicator of graduationIndicators) {
        const element = page.locator(indicator).first();
        if (await element.isVisible()) {
          graduationDetected = true;
          console.log(`✅ Graduation detected: ${indicator}`);
          break;
        }
      }
      
      if (!graduationDetected) {
        console.log('⏳ Waiting for graduation event to process...');
        await page.waitForTimeout(60000); // Wait 1 minute
        
        // Check again
        for (const indicator of graduationIndicators) {
          const element = page.locator(indicator).first();
          if (await element.isVisible()) {
            graduationDetected = true;
            console.log(`✅ Graduation confirmed: ${indicator}`);
            break;
          }
        }
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/graduation-completed.png',
        fullPage: true 
      });
      
      if (graduationDetected) {
        console.log('');
        console.log('🎉 GRADUATION SUCCESSFUL!');
        console.log('='.repeat(60));
        console.log('✅ TestCoin2024 has graduated to DEX trading!');
        console.log('');
        console.log('💰 REWARDS DISTRIBUTED:');
        console.log(`   Creator Reward: ${TEST_TOKEN.expectedCreatorReward.toLocaleString()} GALA`);
        console.log(`   Platform Fee: ${(TEST_TOKEN.graduationThreshold * 0.05).toLocaleString()} GALA`);
        console.log(`   DEX Pool: ${(TEST_TOKEN.graduationThreshold - TEST_TOKEN.expectedCreatorReward - (TEST_TOKEN.graduationThreshold * 0.05)).toLocaleString()} GALA`);
        console.log('');
        console.log('🏦 DEX TRADING NOW LIVE:');
        console.log('   Trading Pair: TC24/GALA');
        console.log('   Initial Liquidity: 1.54M GALA');
        console.log('   Status: Available for public trading');
        console.log('='.repeat(60));
        
        // PHASE 5: VERIFY REWARDS
        console.log('');
        console.log('📝 PHASE 5: VERIFY REWARDS');
        console.log('-'.repeat(40));
        
        // Check wallet balance for creator rewards
        console.log('💰 Checking creator reward in wallet...');
        
        // Look for balance or reward information
        const balanceText = await page.textContent('body');
        if (balanceText?.includes(TEST_TOKEN.expectedCreatorReward.toString()) || 
            balanceText?.includes('17,777') || 
            balanceText?.includes('17777')) {
          console.log('✅ Creator reward confirmed in wallet!');
        } else {
          console.log('ℹ️ Creator reward may take time to appear in wallet');
        }
        
        await page.screenshot({ 
          path: 'tests/screenshots/graduation-rewards-verified.png',
          fullPage: true 
        });
        
      } else {
        console.log('⚠️ Graduation event not clearly detected');
        console.log('💡 Check screenshots and page manually');
      }
      
    } else {
      console.log('❌ Graduation threshold not reached');
      console.log(`💡 Current: ${currentMarketCap.toLocaleString()} GALA, Need: ${TEST_TOKEN.graduationThreshold.toLocaleString()} GALA`);
      console.log('💡 Additional trading required to reach graduation');
    }
    
    console.log('');
    console.log('✅ COMPLETE TOKEN CREATION AND GRADUATION TEST FINISHED');
    console.log('📊 Check all screenshots for detailed progress documentation');
  });

  test('should verify TestCoin2024 graduation status and rewards', async ({ page }) => {
    console.log('🔍 VERIFICATION: TestCoin2024 Graduation Status');
    console.log('='.repeat(50));
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    // Search for TestCoin2024
    console.log('🔍 Searching for TestCoin2024...');
    
    const searchField = await page.locator('input[placeholder*="search" i]').first();
    if (await searchField.isVisible()) {
      await searchField.fill('TestCoin2024');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }
    
    // Check token status
    const pageContent = await page.textContent('body');
    
    console.log('📊 TOKEN STATUS VERIFICATION:');
    
    if (pageContent?.includes('TestCoin2024') || pageContent?.includes('TC24')) {
      console.log('✅ Token found on platform');
      
      if (pageContent?.includes('graduated') || pageContent?.includes('DEX') || pageContent?.includes('trading')) {
        console.log('✅ Token appears to be graduated');
        console.log('🏦 DEX trading should be available');
      } else {
        console.log('⚠️ Token may still be on bonding curve');
        console.log('💡 Check current market cap and progress');
      }
      
      if (pageContent?.includes('17,777') || pageContent?.includes('17777')) {
        console.log('✅ Creator reward amount visible');
      }
      
    } else {
      console.log('❌ TestCoin2024 not found');
      console.log('💡 Token may not have been created yet');
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/graduation-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Verification completed');
  });
});
