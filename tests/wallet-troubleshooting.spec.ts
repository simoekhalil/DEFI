import { test, expect } from '@playwright/test';

/**
 * Manual Wallet Connection Test with Troubleshooting
 * Helps debug wallet connection issues and provides step-by-step guidance
 */

test.describe('Manual Wallet Connection Troubleshooting', () => {
  
  test('should guide through wallet connection troubleshooting', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for manual troubleshooting
    
    console.log('🔧 GALA WALLET CONNECTION TROUBLESHOOTING');
    console.log('='.repeat(60));
    console.log('This test will help you connect your Gala wallet properly');
    console.log('='.repeat(60));
    
    // Navigate to the site
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📋 STEP 1: Initial Page Analysis');
    console.log('-'.repeat(40));
    
    // Check if popup blocker is active
    const title = await page.title();
    console.log(`✅ Page loaded: ${title}`);
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-troubleshooting-start.png',
      fullPage: true 
    });
    
    console.log('📋 STEP 2: Wallet Extension Check');
    console.log('-'.repeat(40));
    console.log('🔍 Please manually check the following:');
    console.log('1. Is Gala wallet extension installed?');
    console.log('2. Is the extension enabled in your browser?');
    console.log('3. Are you logged into your Gala wallet?');
    console.log('4. Is the wallet unlocked?');
    console.log('');
    console.log('⏳ Waiting 30 seconds for you to check...');
    await page.waitForTimeout(30000);
    
    console.log('📋 STEP 3: Find Connect Wallet Button');
    console.log('-'.repeat(40));
    
    // Look for connect wallet button with multiple selectors
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      'text=/connect.*wallet/i',
      '[data-testid*="connect"]',
      '.connect-wallet',
      'button[class*="connect"]'
    ];
    
    let connectButton = null;
    let foundSelector = '';
    
    for (const selector of connectSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          connectButton = element;
          foundSelector = selector;
          console.log(`✅ Found connect button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!connectButton) {
      console.log('❌ No connect wallet button found');
      console.log('🔍 Let me check what buttons are available...');
      
      // List all buttons on the page
      const allButtons = await page.locator('button').all();
      console.log(`📊 Found ${allButtons.length} buttons on the page:`);
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          const buttonClass = await allButtons[i].getAttribute('class');
          console.log(`   ${i + 1}. "${buttonText}" (class: ${buttonClass})`);
        } catch (e) {
          console.log(`   ${i + 1}. [Button text not readable]`);
        }
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/wallet-no-connect-button.png',
        fullPage: true 
      });
      
      return;
    }
    
    console.log('📋 STEP 4: Test Connect Button Click');
    console.log('-'.repeat(40));
    console.log(`🖱️ About to click: ${foundSelector}`);
    console.log('⚠️ Watch for popup blockers or blank tabs!');
    console.log('⏳ Clicking in 5 seconds...');
    await page.waitForTimeout(5000);
    
    // Highlight the button before clicking
    await connectButton.evaluate(el => {
      el.style.border = '3px solid red';
      el.style.backgroundColor = 'yellow';
    });
    
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-button-highlighted.png',
      fullPage: true 
    });
    
    // Click the connect button
    await connectButton.click();
    console.log('✅ Connect button clicked');
    
    console.log('📋 STEP 5: Monitor for Wallet Response');
    console.log('-'.repeat(40));
    console.log('🔍 Checking for wallet modal, popup, or new tab...');
    
    // Wait and check for various wallet connection responses
    await page.waitForTimeout(3000);
    
    // Check for modal/popup on the same page
    const modalSelectors = [
      '.modal',
      '.popup',
      '[data-testid*="wallet"]',
      '.wallet-connect',
      '[role="dialog"]',
      '.MuiDialog-root'
    ];
    
    let modalFound = false;
    for (const selector of modalSelectors) {
      try {
        const modal = page.locator(selector).first();
        if (await modal.isVisible({ timeout: 2000 })) {
          modalFound = true;
          console.log(`✅ Wallet modal found: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue checking
      }
    }
    
    if (!modalFound) {
      console.log('⚠️ No wallet modal found on current page');
      console.log('🔍 This might indicate:');
      console.log('   1. Popup was blocked');
      console.log('   2. New tab opened (check browser tabs)');
      console.log('   3. Wallet extension not responding');
      console.log('   4. Different wallet connection flow');
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-after-click.png',
      fullPage: true 
    });
    
    console.log('📋 STEP 6: Manual Wallet Connection');
    console.log('-'.repeat(40));
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('');
    console.log('If you see a BLANK TAB:');
    console.log('1. Close the blank tab');
    console.log('2. Disable popup blocker for this site');
    console.log('3. Open Gala wallet extension manually');
    console.log('4. Make sure you\'re logged in');
    console.log('5. Try clicking Connect Wallet again');
    console.log('');
    console.log('If NOTHING HAPPENS:');
    console.log('1. Check if Gala wallet extension is installed');
    console.log('2. Make sure extension is enabled');
    console.log('3. Try refreshing the page');
    console.log('4. Try a different browser');
    console.log('');
    console.log('⏳ Waiting 2 minutes for you to troubleshoot...');
    console.log('   The test will check for connection every 10 seconds');
    
    // Monitor for wallet connection
    let walletConnected = false;
    const maxAttempts = 12; // 2 minutes
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await page.waitForTimeout(10000); // Wait 10 seconds
      
      // Check for wallet connection indicators
      const connectionIndicators = [
        'text=/connected/i',
        'text=/disconnect/i',
        'text=/0x[a-fA-F0-9]{40}/',
        'text=/client\\|[a-fA-F0-9]{24}/',
        '.wallet-connected',
        '[data-testid*="wallet-address"]'
      ];
      
      for (const indicator of connectionIndicators) {
        try {
          const element = page.locator(indicator).first();
          if (await element.isVisible({ timeout: 1000 })) {
            walletConnected = true;
            console.log(`✅ WALLET CONNECTED! Detected via: ${indicator}`);
            break;
          }
        } catch (e) {
          // Continue checking
        }
      }
      
      if (walletConnected) {
        break;
      }
      
      console.log(`   Checking for connection... (${attempt + 1}/${maxAttempts})`);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-final-state.png',
      fullPage: true 
    });
    
    if (walletConnected) {
      console.log('🎉 SUCCESS! Wallet is now connected');
      console.log('✅ You can now proceed with token creation');
    } else {
      console.log('❌ Wallet connection not detected');
      console.log('🔧 Additional troubleshooting needed');
      console.log('');
      console.log('💡 NEXT STEPS:');
      console.log('1. Check browser console for errors (F12)');
      console.log('2. Try different browser (Chrome, Firefox, Edge)');
      console.log('3. Reinstall Gala wallet extension');
      console.log('4. Contact Gala support if issue persists');
    }
    
    console.log('📊 TROUBLESHOOTING COMPLETE');
    console.log('Screenshots saved to tests/screenshots/ for analysis');
  });
});





