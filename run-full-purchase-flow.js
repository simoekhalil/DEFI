const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Full Automated Token Purchase Flow
 * Clicks Connect → Finds Token → Clicks Buy
 */

(async () => {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  
  console.log('🚀 FULL AUTOMATED TOKEN PURCHASE FLOW');
  console.log('='.repeat(60));
  console.log(`Extension: ${extensionPath}\n`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    slowMo: 500 // Slow down so you can see what's happening
  });

  const context = await browser.newContext({
    bypassCSP: true
  });

  const page = await context.newPage();

  try {
    // STEP 1: Load Gala Launchpad
    console.log('📍 STEP 1: Loading Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { timeout: 60000 });
    console.log('✅ Page loaded\n');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'flow-1-loaded.png', fullPage: true });

    // STEP 2: Click Connect Wallet
    console.log('🔗 STEP 2: Clicking Connect Wallet...');
    
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      'text=Connect Wallet',
      'text=Connect'
    ];
    
    let connectClicked = false;
    for (const selector of connectSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.count() > 0) {
          console.log(`   Found: ${selector}`);
          await button.click({ timeout: 5000 });
          console.log('✅ Connect button clicked\n');
          connectClicked = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!connectClicked) {
      console.log('⚠️  No Connect button found - wallet may already be connected\n');
    }

    await page.screenshot({ path: 'flow-2-connect-clicked.png', fullPage: true });

    // STEP 3: Select Gala Wallet (if modal appears)
    console.log('💳 STEP 3: Looking for Gala Wallet option...');
    
    const galaSelectors = [
      'button:has-text("Gala")',
      'text=Gala Wallet',
      '[class*="gala" i]',
      'button:has-text("GalaChain")'
    ];

    let galaSelected = false;
    for (const selector of galaSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.count() > 0 && await button.isVisible({ timeout: 2000 })) {
          console.log(`   Found: ${selector}`);
          await button.click({ timeout: 5000 });
          console.log('✅ Gala Wallet selected\n');
          galaSelected = true;
          await page.waitForTimeout(5000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!galaSelected) {
      console.log('⚠️  No Gala Wallet selector found - may not be needed\n');
    }

    await page.screenshot({ path: 'flow-3-wallet-selected.png', fullPage: true });

    // STEP 4: Find and click on a token
    console.log('🔍 STEP 4: Finding available tokens...');
    
    const tokenSelectors = [
      'a[href*="/token/"]',
      'a[href*="/coin/"]',
      '[class*="token-card" i] a',
      '[class*="coin-card" i] a'
    ];

    let tokenClicked = false;
    for (const selector of tokenSelectors) {
      try {
        const tokens = await page.locator(selector).all();
        if (tokens.length > 0) {
          console.log(`   Found ${tokens.length} tokens using: ${selector}`);
          console.log('🎯 Clicking first token...');
          await tokens[0].click({ timeout: 5000 });
          console.log('✅ Token page opened\n');
          tokenClicked = true;
          await page.waitForTimeout(4000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!tokenClicked) {
      console.log('⚠️  No token cards found, trying explore page...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/explore', { timeout: 30000 });
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: 'flow-4-token-page.png', fullPage: true });

    // STEP 5: Analyze the buy interface
    console.log('💰 STEP 5: Analyzing buy interface...');
    
    const buyInfo = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return {
        hasBuy: text.includes('buy'),
        hasAmount: text.includes('amount'),
        hasPrice: text.includes('price'),
        url: window.location.href
      };
    });

    console.log(`   URL: ${buyInfo.url}`);
    console.log(`   Has Buy: ${buyInfo.hasBuy}`);
    console.log(`   Has Amount input: ${buyInfo.hasAmount}\n`);

    // STEP 6: Enter buy amount
    if (buyInfo.hasBuy) {
      console.log('💵 STEP 6: Entering buy amount...');
      
      const inputSelectors = [
        'input[type="number"]',
        'input[placeholder*="amount" i]',
        'input[placeholder*="gala" i]'
      ];

      let amountEntered = false;
      for (const selector of inputSelectors) {
        try {
          const input = page.locator(selector).first();
          if (await input.count() > 0 && await input.isVisible({ timeout: 2000 })) {
            console.log(`   Found input: ${selector}`);
            const buyAmount = '100'; // 100 GALA
            await input.clear();
            await input.fill(buyAmount);
            console.log(`✅ Entered amount: ${buyAmount} GALA\n`);
            amountEntered = true;
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!amountEntered) {
        console.log('⚠️  No amount input found\n');
      }

      await page.screenshot({ path: 'flow-5-amount-entered.png', fullPage: true });

      // STEP 7: Click Buy button
      console.log('🎯 STEP 7: Clicking Buy button...');
      
      const buyButtonSelectors = [
        'button:has-text("Buy")',
        'button:has-text("Purchase")',
        'button:has-text("Confirm Buy")',
        'button[type="submit"]'
      ];

      let buyClicked = false;
      for (const selector of buyButtonSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.count() > 0 && await button.isVisible({ timeout: 2000 })) {
            const isEnabled = await button.isEnabled().catch(() => false);
            if (isEnabled) {
              console.log(`   Found: ${selector}`);
              await button.click({ timeout: 5000 });
              console.log('✅ Buy button clicked\n');
              buyClicked = true;
              await page.waitForTimeout(3000);
              break;
            } else {
              console.log(`   Found but disabled: ${selector}`);
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (!buyClicked) {
        console.log('⚠️  No enabled Buy button found\n');
      }

      await page.screenshot({ path: 'flow-6-buy-clicked.png', fullPage: true });

      // STEP 8: Look for confirmation
      console.log('⏳ STEP 8: Checking for confirmation...');
      await page.waitForTimeout(2000);

      const confirmSelectors = [
        'button:has-text("Confirm")',
        'button:has-text("Approve")',
        'button:has-text("Sign")'
      ];

      for (const selector of confirmSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.count() > 0 && await button.isVisible({ timeout: 2000 })) {
            console.log(`   Found confirmation: ${selector}`);
            await button.click({ timeout: 5000 });
            console.log('✅ Confirmation clicked\n');
            await page.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      await page.screenshot({ path: 'flow-7-confirmed.png', fullPage: true });

      // STEP 9: Check result
      console.log('📊 STEP 9: Checking transaction result...');
      await page.waitForTimeout(5000);

      const result = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          success: text.includes('success') || text.includes('confirmed'),
          error: text.includes('error') || text.includes('failed'),
          pending: text.includes('pending'),
          text: document.body.innerText.substring(0, 500)
        };
      });

      console.log('\n' + '='.repeat(60));
      console.log('📊 TRANSACTION RESULT:');
      console.log('='.repeat(60));
      if (result.success) {
        console.log('✅ Transaction appears SUCCESSFUL!');
      } else if (result.error) {
        console.log('❌ Transaction FAILED');
      } else if (result.pending) {
        console.log('⏳ Transaction PENDING');
      } else {
        console.log('⚠️  Status UNCLEAR');
      }
      console.log('\nPage content:');
      console.log(result.text);
      console.log('='.repeat(60));

    } else {
      console.log('⚠️  This page does not have a buy interface\n');
    }

    await page.screenshot({ path: 'flow-final.png', fullPage: true });

    console.log('\n✅ PURCHASE FLOW COMPLETED');
    console.log('📸 Screenshots saved: flow-1-loaded.png through flow-final.png\n');
    console.log('⏳ Keeping browser open for 30 seconds for inspection...\n');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'flow-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Browser closed - Test completed');
  }
})();






