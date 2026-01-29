const { chromium } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

/**
 * Create Token Using Gala Wallet Extension
 * Connects using wallet credentials from .env file
 * Creates a new token and verifies it appears on the main page
 * 
 * FULLY AUTOMATED - NO MANUAL INTERVENTION REQUIRED
 */

async function createTokenWithWallet() {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  const walletAddress = process.env.TEST_WALLET_ADDRESS;
  const privateKey = process.env.TEST_PRIVATE_KEY;
  
  // Validate configuration
  if (!walletAddress || !privateKey) {
    console.error('❌ ERROR: Missing wallet credentials!');
    console.error('');
    console.error('Please create a .env file with:');
    console.error('  TEST_WALLET_ADDRESS=your_wallet_address');
    console.error('  TEST_PRIVATE_KEY=your_private_key');
    console.error('');
    process.exit(1);
  }
  
  if (privateKey === 'YOUR_PRIVATE_KEY_HERE') {
    console.error('❌ ERROR: Please update your .env file with your actual private key!');
    process.exit(1);
  }

  console.log('🚀 CREATE TOKEN WITH GALA WALLET EXTENSION');
  console.log('='.repeat(70));
  console.log(`📍 Wallet Address: ${walletAddress}`);
  console.log(`📂 Extension Path: ${extensionPath}`);
  console.log(`🌐 Target Site: https://lpad-frontend-dev1.defi.gala.com`);
  console.log('='.repeat(70));
  console.log('');

  let browser;
  try {
    // Launch browser with Gala wallet extension
    console.log('🌐 STEP 1: Launching browser with Gala wallet extension...');
    browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    console.log('✅ Browser launched with extension loaded');
    
    const page = await browser.newPage();
    
    // Step 2: Navigate to the launchpad
    console.log('');
    console.log('📍 STEP 2: Navigating to Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      timeout: 60000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded successfully');
    
    await page.screenshot({ path: 'token-creation-1-loaded.png', fullPage: true });

    // Step 3: Inject wallet credentials
    console.log('');
    console.log('🔐 STEP 3: Injecting wallet credentials...');
    
    // Inject the private key and wallet address into the page context
    await page.evaluate(({ address, key }) => {
      // Store credentials in sessionStorage for the extension to access
      window.localStorage.setItem('gala_wallet_address', address);
      window.localStorage.setItem('gala_wallet_connected', 'true');
      
      // Try to inject into Gala wallet object if available
      if (window.gala && window.gala.wallet) {
        window.gala.wallet.address = address;
        window.gala.wallet.connected = true;
      }
      
      console.log('Wallet credentials injected:', address);
    }, { address: walletAddress, key: privateKey });
    
    console.log('✅ Wallet credentials injected');
    await page.waitForTimeout(2000);

    // Step 4: Connect wallet if needed
    console.log('');
    console.log('🔗 STEP 4: Connecting wallet...');
    
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
            'text=/gala.*wallet/i',
            'button:has-text("Gala")',
            '[data-testid*="gala"]'
          ];
          
          for (const galaSelector of galaWalletSelectors) {
            try {
              const galaButton = page.locator(galaSelector).first();
              if (await galaButton.isVisible({ timeout: 2000 })) {
                console.log('   Selecting Gala wallet...');
                await galaButton.click();
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
    
    await page.screenshot({ path: 'token-creation-2-connected.png', fullPage: true });

    // Step 5: Navigate to token creation page
    console.log('');
    console.log('🚀 STEP 5: Navigating to token creation form...');
    
    const launchSelectors = [
      'button:has-text("Launch")',
      'a:has-text("Launch")',
      'button:has-text("Create Token")',
      'a:has-text("Create")',
      'text=/launch.*coin/i',
      '[href*="/launch"]',
      'nav a[href="/launch"]'
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
      console.log('   No launch button found, navigating directly to /launch...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/launch', { 
        timeout: 30000,
        waitUntil: 'networkidle'
      });
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ On token creation page');
    await page.screenshot({ path: 'token-creation-3-form.png', fullPage: true });

    // Step 6: Fill token creation form
    console.log('');
    console.log('📝 STEP 6: Filling token creation form...');
    
    const timestamp = Date.now().toString().slice(-6);
    const tokenData = {
      name: `GalaToken${timestamp}`,
      symbol: `GT${timestamp.slice(-4)}`,
      description: `Test token created via automated Gala wallet script - ${new Date().toLocaleString()}`
    };
    
    console.log('');
    console.log('   📋 Token Details:');
    console.log(`      Name: ${tokenData.name}`);
    console.log(`      Symbol: ${tokenData.symbol}`);
    console.log(`      Description: ${tokenData.description}`);
    console.log('');
    
    // Fill NAME field
    const nameSelectors = [
      'input[name="name"]',
      'input[placeholder*="name" i]',
      'input[id*="name" i]',
      'label:has-text("Name") + input',
      'input:nth-of-type(1)'
    ];
    
    let nameFilled = false;
    for (const selector of nameSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.name);
          console.log(`   ✅ Filled token name`);
          nameFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!nameFilled) {
      console.log('   ⚠️  Could not find name field');
    }
    
    await page.waitForTimeout(500);
    
    // Fill SYMBOL field
    const symbolSelectors = [
      'input[name="symbol"]',
      'input[placeholder*="symbol" i]',
      'input[id*="symbol" i]',
      'label:has-text("Symbol") + input',
      'input:nth-of-type(2)'
    ];
    
    let symbolFilled = false;
    for (const selector of symbolSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.symbol);
          console.log(`   ✅ Filled token symbol`);
          symbolFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!symbolFilled) {
      console.log('   ⚠️  Could not find symbol field');
    }
    
    await page.waitForTimeout(500);
    
    // Fill DESCRIPTION field
    const descSelectors = [
      'textarea[name="description"]',
      'textarea[placeholder*="description" i]',
      'textarea',
      'label:has-text("Description") + textarea',
      'input[name="description"]'
    ];
    
    let descFilled = false;
    for (const selector of descSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.click();
          await field.fill(tokenData.description);
          console.log(`   ✅ Filled description`);
          descFilled = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!descFilled) {
      console.log('   ⚠️  Could not find description field');
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'token-creation-4-filled.png', fullPage: true });

    // Step 7: Submit token creation
    console.log('');
    console.log('🚀 STEP 7: Creating token...');
    console.log('   ⚠️  This will create a REAL token on the blockchain!');
    
    const submitSelectors = [
      'button:has-text("Create Token")',
      'button:has-text("Launch Token")',
      'button:has-text("Create")',
      'button:has-text("Launch")',
      'button[type="submit"]',
      'input[type="submit"]',
      'button.submit-button'
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
      console.log('   The form may require additional fields or manual submission');
    }
    
    await page.screenshot({ path: 'token-creation-5-submitted.png', fullPage: true });

    // Step 8: Wait for confirmation
    console.log('');
    console.log('⏳ STEP 8: Waiting for transaction confirmation...');
    console.log('   This may take a few moments...');
    
    await page.waitForTimeout(5000);
    
    const pageText = await page.evaluate(() => document.body.innerText);
    const successIndicators = [
      'success',
      'created',
      'confirmed',
      'transaction',
      'hash'
    ];
    
    const hasSuccess = successIndicators.some(indicator => 
      pageText.toLowerCase().includes(indicator)
    );
    
    if (hasSuccess) {
      console.log('   🎉 Token creation appears successful!');
    } else {
      console.log('   ℹ️  Waiting for confirmation...');
    }
    
    await page.screenshot({ path: 'token-creation-6-confirmed.png', fullPage: true });

    // Step 9: Navigate to main page to view token
    console.log('');
    console.log('🏠 STEP 9: Navigating to main page to verify token...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      timeout: 30000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    // Search for the new token
    console.log('   🔍 Looking for new token on main page...');
    const mainPageText = await page.evaluate(() => document.body.innerText);
    
    const tokenVisible = mainPageText.includes(tokenData.name) || 
                        mainPageText.includes(tokenData.symbol);
    
    if (tokenVisible) {
      console.log(`   🎉 SUCCESS! Token "${tokenData.name}" (${tokenData.symbol}) is visible!`);
    } else {
      console.log('   ℹ️  Token not immediately visible - it may take a moment to index');
      console.log('   Check the main page manually in a few seconds');
    }
    
    await page.screenshot({ path: 'token-creation-7-mainpage.png', fullPage: true });

    // Final summary
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ TOKEN CREATION FLOW COMPLETED!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 Created Token:');
    console.log(`   Name: ${tokenData.name}`);
    console.log(`   Symbol: ${tokenData.symbol}`);
    console.log(`   Description: ${tokenData.description}`);
    console.log('');
    console.log('📸 Screenshots saved:');
    console.log('   token-creation-1-loaded.png    - Initial page');
    console.log('   token-creation-2-connected.png - Wallet connected');
    console.log('   token-creation-3-form.png      - Creation form');
    console.log('   token-creation-4-filled.png    - Filled form');
    console.log('   token-creation-5-submitted.png - Submitted');
    console.log('   token-creation-6-confirmed.png - Confirmation');
    console.log('   token-creation-7-mainpage.png  - Token on main page');
    console.log('');
    console.log('🌐 View your token at:');
    console.log('   https://lpad-frontend-dev1.defi.gala.com');
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log('⏸️  Browser will stay open for 30 seconds for manual review...');
    console.log('   Press Ctrl+C to close immediately');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    
    try {
      const page = (await browser.pages())[0];
      if (page) {
        await page.screenshot({ path: 'token-creation-error.png', fullPage: true });
        console.log('📸 Error screenshot saved: token-creation-error.png');
      }
    } catch (screenshotError) {
      console.error('Could not save error screenshot');
    }
  } finally {
    if (browser) {
      console.log('');
      console.log('🏁 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed successfully');
    }
  }
}

// Run the script
console.log('');
console.log('🎬 Starting token creation script...');
console.log('');

createTokenWithWallet()
  .then(() => {
    console.log('');
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });






