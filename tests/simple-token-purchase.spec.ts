import { test, expect } from '@playwright/test';

/**
 * Simple Token Purchase Test
 * Loads testnet extension and executes a basic token buy
 */

test.describe('Simple Token Purchase Flow', () => {
  
  test('should purchase tokens using testnet wallet extension', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('\n💰 SIMPLE TOKEN PURCHASE TEST');
    console.log('='.repeat(60));
    console.log('This test will:');
    console.log('1. Load Gala Launchpad with your testnet extension');
    console.log('2. Help you connect your wallet');
    console.log('3. Navigate to a token page');
    console.log('4. Execute a token purchase');
    console.log('='.repeat(60));
    
    // Step 1: Navigate to Gala Launchpad
    console.log('\n📍 Step 1: Loading Gala DeFi Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    console.log('✅ Page loaded');
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/purchase-step1-loaded.png',
      fullPage: true 
    });
    
    // Step 2: Look for Connect Wallet button
    console.log('\n🔗 Step 2: Looking for wallet connection...');
    
    // Check if wallet is already connected
    const walletConnected = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes('client|') || bodyText.includes('Disconnect') || bodyText.includes('Connected');
    });
    
    if (walletConnected) {
      console.log('✅ Wallet already connected!');
    } else {
      console.log('⏸️  Please connect your wallet manually:');
      console.log('   1. Look for "Connect Wallet" button');
      console.log('   2. Click it and select your Gala Wallet');
      console.log('   3. Approve the connection');
      console.log('\n⏳ Waiting 60 seconds for you to connect...');
      
      // Wait for wallet connection
      try {
        await page.waitForFunction(() => {
          const text = document.body.innerText;
          return text.includes('client|') || text.includes('Disconnect');
        }, { timeout: 60000 });
        console.log('✅ Wallet connected!');
      } catch (e) {
        console.log('⚠️  Timeout waiting for wallet connection, continuing anyway...');
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/purchase-step2-connected.png',
      fullPage: true 
    });
    
    // Step 3: Navigate to a token to buy
    console.log('\n🔍 Step 3: Finding a token to purchase...');
    
    // Look for any token on the main page
    const tokenLinks = await page.locator('a[href*="/token/"], a[href*="/coin/"]').all();
    
    if (tokenLinks.length > 0) {
      console.log(`✅ Found ${tokenLinks.length} tokens on the page`);
      console.log('🎯 Navigating to first token...');
      await tokenLinks[0].click();
      await page.waitForTimeout(3000);
    } else {
      // If no tokens found, try to navigate directly to a known token or create one
      console.log('⚠️  No tokens found on main page');
      console.log('🔍 Searching for TestCoin2024...');
      
      // Try search functionality
      const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('TestCoin2024');
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/purchase-step3-token-page.png',
      fullPage: true 
    });
    
    // Step 4: Find and analyze the buy interface
    console.log('\n💰 Step 4: Analyzing buy interface...');
    
    const buyInterface = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasBuyButton: bodyText.toLowerCase().includes('buy'),
        hasAmount: bodyText.toLowerCase().includes('amount'),
        hasPrice: bodyText.toLowerCase().includes('price'),
        hasGala: bodyText.toLowerCase().includes('gala'),
        visibleText: bodyText.substring(0, 1000) // First 1000 chars
      };
    });
    
    console.log('📊 Buy Interface Analysis:');
    console.log(`   Buy button found: ${buyInterface.hasBuyButton}`);
    console.log(`   Amount input found: ${buyInterface.hasAmount}`);
    console.log(`   Price display found: ${buyInterface.hasPrice}`);
    console.log(`   GALA token found: ${buyInterface.hasGala}`);
    
    // Step 5: Execute token purchase
    console.log('\n💸 Step 5: Preparing to buy tokens...');
    
    // Look for buy input field
    const buyInput = await page.locator('input[type="number"], input[placeholder*="amount" i]').first();
    
    if (await buyInput.count() > 0) {
      console.log('✅ Found buy amount input');
      
      // Enter a small test amount (100 GALA)
      const testBuyAmount = '100';
      console.log(`💵 Entering buy amount: ${testBuyAmount} GALA`);
      await buyInput.fill(testBuyAmount);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/purchase-step4-amount-entered.png',
        fullPage: true 
      });
      
      // Look for buy button
      const buyButton = await page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Confirm")').first();
      
      if (await buyButton.count() > 0) {
        console.log('✅ Found buy button');
        console.log('🎯 Clicking buy button...');
        
        await buyButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'tests/screenshots/purchase-step5-buy-clicked.png',
          fullPage: true 
        });
        
        // Wait for wallet confirmation popup or transaction processing
        console.log('⏳ Waiting for wallet confirmation...');
        console.log('   Please approve the transaction in your wallet popup');
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
          path: 'tests/screenshots/purchase-step6-after-confirm.png',
          fullPage: true 
        });
        
        // Check for success message
        const successMessage = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return {
            hasSuccess: text.includes('success') || text.includes('confirmed') || text.includes('complete'),
            hasError: text.includes('error') || text.includes('failed'),
            bodyText: document.body.innerText.substring(0, 500)
          };
        });
        
        console.log('\n📊 TRANSACTION RESULT:');
        console.log('='.repeat(60));
        if (successMessage.hasSuccess) {
          console.log('✅ Transaction appears successful!');
        } else if (successMessage.hasError) {
          console.log('❌ Transaction may have failed');
        } else {
          console.log('⚠️  Transaction status unclear');
        }
        console.log('\n📄 Page content:');
        console.log(successMessage.bodyText);
        console.log('='.repeat(60));
        
      } else {
        console.log('⚠️  Could not find buy button');
        console.log('📝 Manual action required:');
        console.log('   Please manually click the buy button');
        await page.waitForTimeout(30000);
      }
      
    } else {
      console.log('⚠️  Could not find buy amount input');
      console.log('📝 This token page may not support buying yet');
      console.log('📄 Page content:');
      console.log(buyInterface.visibleText);
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/purchase-final.png',
      fullPage: true 
    });
    
    console.log('\n✅ Token purchase flow test completed!');
    console.log('📸 Screenshots saved to tests/screenshots/');
    console.log('\n⏳ Keeping browser open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
  });

  test('should buy specific amount of tokens', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    
    const buyAmount = process.env.BUY_AMOUNT || '500'; // Default 500 GALA
    
    console.log(`\n💰 BUYING ${buyAmount} GALA WORTH OF TOKENS`);
    console.log('='.repeat(60));
    
    // Navigate to launchpad
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForTimeout(3000);
    
    // Find the first available token
    console.log('🔍 Looking for available tokens...');
    const tokenCard = await page.locator('[class*="token" i], [class*="coin" i]').first();
    
    if (await tokenCard.count() > 0) {
      await tokenCard.click();
      await page.waitForTimeout(2000);
      
      // Try to buy
      const amountInput = await page.locator('input[type="number"]').first();
      if (await amountInput.count() > 0) {
        await amountInput.fill(buyAmount);
        
        const buyBtn = await page.locator('button:has-text("Buy")').first();
        if (await buyBtn.count() > 0) {
          await buyBtn.click();
          
          console.log(`💸 Initiated purchase of ${buyAmount} GALA worth of tokens`);
          console.log('⏳ Waiting for confirmation...');
          await page.waitForTimeout(15000);
          
          await page.screenshot({ 
            path: 'tests/screenshots/quick-buy-result.png',
            fullPage: true 
          });
          
          console.log('✅ Purchase flow completed');
        }
      }
    }
    
    await page.waitForTimeout(10000);
  });
});






