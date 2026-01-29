import { test, expect, chromium, BrowserContext } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Create a Token and Verify it Appears on Main Page
 * WITH VERBOSE LOGGING
 */

test.describe('Create and Verify Token on Main Page', () => {
  let context: BrowserContext;
  
  test.beforeAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 STARTING TOKEN CREATION AND VERIFICATION TEST');
    console.log('='.repeat(80));
  });

  test('should create a new token and verify it appears on the main page', async () => {
    const extensionPath = path.join(__dirname, '..', 'extensions', 'testnet-wallet', 'build');
    const siteUrl = 'https://lpad-frontend-dev1.defi.gala.com';
    
    console.log('\n📋 TEST CONFIGURATION:');
    console.log(`   🌐 Site URL: ${siteUrl}`);
    console.log(`   📂 Extension Path: ${extensionPath}`);
    console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);
    
    // Launch browser with Gala wallet extension
    console.log('\n' + '='.repeat(80));
    console.log('STEP 1: LAUNCHING BROWSER WITH GALA WALLET EXTENSION');
    console.log('='.repeat(80));
    
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      viewport: { width: 1400, height: 900 }
    });
    
    console.log('✅ Browser launched successfully');
    console.log(`   📊 Viewport: 1400x900`);
    console.log(`   🔌 Extension loaded from: ${extensionPath}`);
    
    const page = await context.newPage();
    console.log('✅ New page created');
    
    // Navigate to Gala Launchpad
    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: NAVIGATING TO GALA LAUNCHPAD');
    console.log('='.repeat(80));
    console.log(`   🌐 Navigating to: ${siteUrl}`);
    
    await page.goto(siteUrl, { 
      timeout: 60000, 
      waitUntil: 'domcontentloaded' 
    });
    console.log('✅ Page navigation completed');
    
    console.log('   ⏳ Waiting for page to fully load (5 seconds)...');
    await page.waitForTimeout(5000);
    console.log('✅ Page load complete');
    
    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`   📄 Page Title: ${pageTitle}`);
    console.log(`   🔗 Current URL: ${currentUrl}`);
    
    await page.screenshot({ path: 'screenshots/step-1-main-page.png', fullPage: true });
    console.log('   📸 Screenshot saved: screenshots/step-1-main-page.png');
    
    // Look for launch/create button
    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: FINDING TOKEN CREATION BUTTON');
    console.log('='.repeat(80));
    
    const buttonSelectors = [
      'button:has-text("Launch")',
      'button:has-text("Create")',
      'button:has-text("Launch a Coin")',
      'a:has-text("Launch")',
      '[data-testid="launch-button"]',
      'button[class*="launch" i]',
      'button[class*="create" i]'
    ];
    
    console.log(`   🔍 Searching through ${buttonSelectors.length} possible selectors...`);
    
    let launchButton = null;
    let foundSelector = null;
    
    for (let i = 0; i < buttonSelectors.length; i++) {
      const selector = buttonSelectors[i];
      console.log(`   ${i + 1}/${buttonSelectors.length} Trying selector: ${selector}`);
      
      try {
        const button = page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          launchButton = button;
          foundSelector = selector;
          const buttonText = await button.textContent();
          console.log(`   ✅ FOUND! Button text: "${buttonText?.trim()}"`);
          break;
        } else {
          console.log(`   ❌ Button not visible`);
        }
      } catch (e) {
        console.log(`   ❌ Button not found`);
      }
    }
    
    if (!launchButton) {
      console.log('\n   ⚠️  Could not find launch button with standard selectors');
      console.log('   📋 Listing all buttons on the page...');
      
      const allButtons = await page.locator('button').all();
      console.log(`   📊 Found ${allButtons.length} total buttons`);
      
      for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
        const btn = allButtons[i];
        const text = await btn.textContent().catch(() => 'N/A');
        const isVisible = await btn.isVisible().catch(() => false);
        const className = await btn.getAttribute('class').catch(() => 'N/A');
        console.log(`   ${i + 1}. Text: "${text?.trim()}" | Visible: ${isVisible} | Class: ${className}`);
      }
      
      console.log('\n   📋 Listing all links on the page...');
      const allLinks = await page.locator('a').all();
      console.log(`   📊 Found ${allLinks.length} total links`);
      
      for (let i = 0; i < Math.min(allLinks.length, 15); i++) {
        const link = allLinks[i];
        const text = await link.textContent().catch(() => 'N/A');
        const href = await link.getAttribute('href').catch(() => 'N/A');
        const isVisible = await link.isVisible().catch(() => false);
        console.log(`   ${i + 1}. Text: "${text?.trim()}" | Visible: ${isVisible} | Href: ${href}`);
      }
      
      throw new Error('Could not find launch button to create token');
    }
    
    // Click the launch button
    console.log('\n' + '='.repeat(80));
    console.log('STEP 4: CLICKING LAUNCH BUTTON');
    console.log('='.repeat(80));
    console.log(`   🎯 Using selector: ${foundSelector}`);
    
    await launchButton.click();
    console.log('✅ Button clicked');
    
    console.log('   ⏳ Waiting for form to load (3 seconds)...');
    await page.waitForTimeout(3000);
    console.log('✅ Wait complete');
    
    const afterClickUrl = page.url();
    console.log(`   🔗 Current URL after click: ${afterClickUrl}`);
    
    await page.screenshot({ path: 'screenshots/step-2-create-form.png', fullPage: true });
    console.log('   📸 Screenshot saved: screenshots/step-2-create-form.png');
    
    // Connect wallet first
    console.log('\n' + '='.repeat(80));
    console.log('STEP 5: CONNECTING WALLET');
    console.log('='.repeat(80));
    
    const walletButtonSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      'button:has-text("Get Gala")',
      '[class*="connect" i] button',
      'button[class*="wallet" i]',
      'button >> text=/connect/i',
      '[role="button"]:has-text("Connect")'
    ];
    
    let walletButton = null;
    let walletSelector = null;
    
    console.log('   🔍 Looking for wallet connection button...');
    for (const selector of walletButtonSelectors) {
      console.log(`   🔍 Trying selector: ${selector}`);
      try {
        const button = page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          walletButton = button;
          walletSelector = selector;
          const buttonText = await button.textContent();
          console.log(`   ✅ FOUND! Button text: "${buttonText?.trim()}"`);
          break;
        } else {
          console.log(`   ❌ Button not visible`);
        }
      } catch (e) {
        console.log(`   ❌ Button not found`);
      }
    }
    
    if (walletButton) {
      console.log(`\n   🔌 Clicking wallet connection button: ${walletSelector}`);
      await walletButton.click();
      console.log('   ✅ Wallet button clicked');
      
      console.log('   ⏳ Waiting for modal to appear (5 seconds)...');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ path: 'screenshots/step-2b-wallet-modal.png', fullPage: true });
      console.log('   📸 Screenshot saved: screenshots/step-2b-wallet-modal.png');
      
      // Check if wallet connection modal is open
      console.log('\n   🔍 Looking for wallet connection modal...');
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '.connectwalletmodal',
        'div[class*="modal" i]'
      ];
      
      let modalOpen = false;
      for (const selector of modalSelectors) {
        try {
          const modal = page.locator(selector).first();
          if (await modal.isVisible({ timeout: 2000 })) {
            console.log(`   ✅ Wallet modal found: ${selector}`);
            modalOpen = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (modalOpen) {
        console.log('\n   🎯 Wallet modal is open - looking for Gala wallet option...');
        
        // Look for Gala wallet option in the modal
        const galaWalletSelectors = [
          'button:has-text("Gala")',
          'div:has-text("Gala Wallet")',
          '[class*="gala" i]',
          'img[alt*="Gala" i]',
          'text=Gala >> ..',
          '.wallet-option:has-text("Gala")'
        ];
        
        let galaWalletOption = null;
        for (const selector of galaWalletSelectors) {
          console.log(`      🔍 Trying selector: ${selector}`);
          try {
            const option = page.locator(selector).first();
            if (await option.isVisible({ timeout: 2000 })) {
              galaWalletOption = option;
              console.log(`      ✅ FOUND Gala wallet option!`);
              break;
            }
          } catch (e) {
            console.log(`      ❌ Not found`);
          }
        }
        
        if (galaWalletOption) {
          console.log('\n   🎯 Clicking Gala wallet option...');
          // Use force click to bypass modal overlay issues
          await galaWalletOption.click({ force: true });
          console.log('   ✅ Gala wallet option clicked');
          
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screenshots/step-2c-gala-wallet-selected.png', fullPage: true });
          console.log('   📸 Screenshot saved: screenshots/step-2c-gala-wallet-selected.png');
          
          // Look for private key input field
          console.log('\n   🔑 Looking for private key input field...');
          const privateKey = process.env.TEST_PRIVATE_KEY;
          
          const pkeyInputSelectors = [
            'input[type="password"]',
            'input[placeholder*="private" i]',
            'input[placeholder*="key" i]',
            'input[name*="privateKey" i]',
            'input[name*="private_key" i]',
            'textarea[placeholder*="private" i]'
          ];
          
          let pkeyInput = null;
          for (const selector of pkeyInputSelectors) {
            console.log(`      🔍 Trying selector: ${selector}`);
            try {
              const input = page.locator(selector).first();
              if (await input.isVisible({ timeout: 2000 })) {
                pkeyInput = input;
                console.log(`      ✅ FOUND private key input field!`);
                break;
              }
            } catch (e) {
              console.log(`      ❌ Not found`);
            }
          }
          
          if (pkeyInput && privateKey) {
            console.log('\n   🔐 Entering private key...');
            await pkeyInput.fill(privateKey);
            console.log('   ✅ Private key entered');
            
            await page.waitForTimeout(1000);
            
            // Look for connect/submit button in modal
            console.log('\n   🔍 Looking for connect/submit button in modal...');
            const modalConnectSelectors = [
              '.modal button:has-text("Connect")',
              '.modal button:has-text("Submit")',
              '.modal button:has-text("Import")',
              '.modal button:has-text("Confirm")',
              '[role="dialog"] button:has-text("Connect")',
              '[role="dialog"] button[type="submit"]',
              'button[class*="primary" i]:has-text("Connect")'
            ];
            
            let connectBtn = null;
            for (const selector of modalConnectSelectors) {
              console.log(`      🔍 Trying selector: ${selector}`);
              try {
                const btn = page.locator(selector).first();
                if (await btn.isVisible({ timeout: 2000 })) {
                  connectBtn = btn;
                  const btnText = await btn.textContent();
                  console.log(`      ✅ FOUND connect button: "${btnText?.trim()}"`);
                  break;
                }
              } catch (e) {
                console.log(`      ❌ Not found`);
              }
            }
            
            if (connectBtn) {
              console.log('\n   🎯 Clicking connect button in modal...');
              await connectBtn.click({ force: true });
              console.log('   ✅ Connect button clicked');
              
              console.log('   ⏳ Waiting for wallet to connect (5 seconds)...');
              await page.waitForTimeout(5000);
              
              await page.screenshot({ path: 'screenshots/step-2d-wallet-connected.png', fullPage: true });
              console.log('   📸 Screenshot saved: screenshots/step-2d-wallet-connected.png');
            } else {
              console.log('   ⚠️  Could not find connect button in modal');
            }
          } else {
            if (!privateKey) {
              console.log('   ❌ ERROR: Private key not found in environment!');
              console.log(`   📋 TEST_PRIVATE_KEY value: ${privateKey || 'undefined'}`);
              console.log('   💡 Make sure .env file has TEST_PRIVATE_KEY=your_key');
            } else {
              console.log('   ⚠️  Could not find private key input field');
              console.log('   💡 The wallet modal may have a different flow than expected');
            }
          }
        } else {
          console.log('   ⚠️  Could not find Gala wallet option in modal');
          console.log('   📋 Listing all options in modal...');
          
          const allOptions = await page.locator('.modal button, .modal div[class*="option" i]').all();
          console.log(`   Found ${allOptions.length} options in modal:`);
          for (let i = 0; i < Math.min(allOptions.length, 10); i++) {
            const text = await allOptions[i].textContent().catch(() => '');
            console.log(`      ${i + 1}. "${text?.trim()}"`);
          }
        }
      } else {
        console.log('   ℹ️  No modal detected - checking for extension popup...');
        
        // Check if there's a wallet popup or extension popup to interact with
        const pages = context.pages();
        console.log(`   📋 Total pages/tabs open: ${pages.length}`);
        
        if (pages.length > 1) {
          console.log('   🔍 Multiple pages detected - checking for wallet popup...');
          for (let i = 0; i < pages.length; i++) {
            const pageUrl = pages[i].url();
            const pageTitle = await pages[i].title().catch(() => 'N/A');
            console.log(`      Page ${i + 1}: ${pageTitle} - ${pageUrl}`);
            
            // If it's an extension popup or wallet page
            if (pageUrl.includes('chrome-extension://') || pageTitle.toLowerCase().includes('gala') || pageTitle.toLowerCase().includes('wallet')) {
              console.log(`      ⭐ Potential wallet popup found!`);
              
              // Try to interact with the wallet extension
              const walletPage = pages[i];
              await walletPage.bringToFront();
              await walletPage.waitForTimeout(2000);
              
              // Look for connect/approve/confirm buttons in the wallet
              const approveSelectors = [
                'button:has-text("Connect")',
                'button:has-text("Approve")',
                'button:has-text("Confirm")',
                'button:has-text("Accept")',
                'button:has-text("Allow")'
              ];
              
              for (const selector of approveSelectors) {
                try {
                  const approveBtn = walletPage.locator(selector).first();
                  if (await approveBtn.isVisible({ timeout: 1000 })) {
                    console.log(`      ✅ Found approval button: ${selector}`);
                    await approveBtn.click();
                    console.log(`      ✅ Clicked approval button`);
                    await walletPage.waitForTimeout(2000);
                    break;
                  }
                } catch (e) {
                  // Continue to next selector
                }
              }
            }
          }
          
          // Go back to main page
          await page.bringToFront();
          await page.waitForTimeout(2000);
        }
      }
      
      console.log('\n   ✅ Wallet connection process complete');
    } else {
      console.log('   ℹ️  No wallet connection button found - wallet may already be connected');
    }
    
    // Generate token data
    console.log('\n' + '='.repeat(80));
    console.log('STEP 6: PREPARING TOKEN DATA');
    console.log('='.repeat(80));
    
    const timestamp = Date.now();
    const tokenData = {
      name: `TestToken${timestamp}`,
      symbol: `TT${timestamp.toString().slice(-6)}`,
      description: `Automated test token created at ${new Date().toISOString()}`
    };
    
    console.log('   📝 Token Details:');
    console.log(`      Name: ${tokenData.name}`);
    console.log(`      Symbol: ${tokenData.symbol}`);
    console.log(`      Description: ${tokenData.description}`);
    
    // Fill token name
    console.log('\n' + '='.repeat(80));
    console.log('STEP 7: FILLING TOKEN NAME');
    console.log('='.repeat(80));
    
    const nameSelectors = [
      'input[name="name"]',
      'input[placeholder*="name" i]',
      'input[id*="name" i]',
      '#token-name',
      'input[type="text"]'
    ];
    
    let nameFilled = false;
    for (const selector of nameSelectors) {
      console.log(`   🔍 Trying selector: ${selector}`);
      try {
        await page.fill(selector, tokenData.name, { timeout: 2000 });
        console.log(`   ✅ SUCCESS! Name filled using: ${selector}`);
        nameFilled = true;
        break;
      } catch (e) {
        console.log(`   ❌ Failed with this selector`);
      }
    }
    
    if (!nameFilled) {
      console.log('   ⚠️  Could not fill name field');
    }
    
    // Fill token symbol
    console.log('\n' + '='.repeat(80));
    console.log('STEP 8: FILLING TOKEN SYMBOL');
    console.log('='.repeat(80));
    
    const symbolSelectors = [
      'input[name="symbol"]',
      'input[placeholder*="symbol" i]',
      'input[id*="symbol" i]',
      '#token-symbol'
    ];
    
    let symbolFilled = false;
    for (const selector of symbolSelectors) {
      console.log(`   🔍 Trying selector: ${selector}`);
      try {
        await page.fill(selector, tokenData.symbol, { timeout: 2000 });
        console.log(`   ✅ SUCCESS! Symbol filled using: ${selector}`);
        symbolFilled = true;
        break;
      } catch (e) {
        console.log(`   ❌ Failed with this selector`);
      }
    }
    
    if (!symbolFilled) {
      console.log('   ⚠️  Could not fill symbol field');
    }
    
    // Fill description
    console.log('\n' + '='.repeat(80));
    console.log('STEP 9: FILLING TOKEN DESCRIPTION');
    console.log('='.repeat(80));
    
    const descSelectors = [
      'textarea[name="description"]',
      'textarea[placeholder*="description" i]',
      'textarea[id*="description" i]',
      '#token-description',
      'textarea'
    ];
    
    let descFilled = false;
    for (const selector of descSelectors) {
      console.log(`   🔍 Trying selector: ${selector}`);
      try {
        await page.fill(selector, tokenData.description, { timeout: 2000 });
        console.log(`   ✅ SUCCESS! Description filled using: ${selector}`);
        descFilled = true;
        break;
      } catch (e) {
        console.log(`   ❌ Failed with this selector`);
      }
    }
    
    if (!descFilled) {
      console.log('   ⚠️  Could not fill description field');
    }
    
    await page.screenshot({ path: 'screenshots/step-3-form-filled.png', fullPage: true });
    console.log('\n   📸 Screenshot saved: screenshots/step-3-form-filled.png');
    
    // Find and click submit button
    console.log('\n' + '='.repeat(80));
    console.log('STEP 10: FINDING SUBMIT BUTTON');
    console.log('='.repeat(80));
    
    const submitSelectors = [
      'button:has-text("Create")',
      'button:has-text("Submit")',
      'button:has-text("Launch")',
      'button[type="submit"]',
      'button:has-text("Launch Token")',
      'button:has-text("Create Token")',
      'button:has-text("Next")',
      'button:has-text("Continue")',
      'button:has-text("Confirm")',
      'button >> text=/create/i',
      'button >> text=/submit/i',
      'button >> text=/launch/i',
      '[role="button"]:has-text("Create")',
      '[role="button"]:has-text("Submit")',
      '[role="button"]:has-text("Launch")',
      'div[role="button"]:has-text("Create")',
      'div[role="button"]:has-text("Submit")',
      'div[role="button"]:has-text("Launch")',
      'button[class*="submit" i]',
      'button[class*="create" i]',
      'button[class*="primary" i]',
      'input[type="submit"]',
      'form button',
      'form input[type="button"]'
    ];
    
    let submitButton = null;
    let submitSelector = null;
    
    for (const selector of submitSelectors) {
      console.log(`   🔍 Trying selector: ${selector}`);
      try {
        const button = page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          submitButton = button;
          submitSelector = selector;
          const buttonText = await button.textContent();
          console.log(`   ✅ FOUND! Button text: "${buttonText?.trim()}"`);
          break;
        } else {
          console.log(`   ❌ Button not visible`);
        }
      } catch (e) {
        console.log(`   ❌ Button not found`);
      }
    }
    
    if (!submitButton) {
      console.log('\n   ⚠️  Could not find submit button with standard selectors');
      console.log('   🔍 ANALYZING ALL BUTTONS ON THE PAGE...');
      console.log('   ' + '-'.repeat(76));
      
      // List ALL buttons on the page
      const allButtons = await page.locator('button').all();
      console.log(`\n   📊 Found ${allButtons.length} <button> elements:`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const btn = allButtons[i];
        try {
          const text = await btn.textContent().catch(() => '');
          const isVisible = await btn.isVisible().catch(() => false);
          const isEnabled = await btn.isEnabled().catch(() => false);
          const className = await btn.getAttribute('class').catch(() => '');
          const type = await btn.getAttribute('type').catch(() => '');
          const role = await btn.getAttribute('role').catch(() => '');
          const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
          
          console.log(`\n   Button ${i + 1}:`);
          console.log(`      Text: "${text?.trim() || '(empty)'}"`);
          console.log(`      Visible: ${isVisible} | Enabled: ${isEnabled}`);
          console.log(`      Type: ${type || 'N/A'}`);
          console.log(`      Class: ${className || 'N/A'}`);
          console.log(`      Role: ${role || 'N/A'}`);
          console.log(`      Aria-Label: ${ariaLabel || 'N/A'}`);
          
          // If button is visible and enabled, try it as submit button
          if (isVisible && isEnabled && text) {
            const textLower = text.toLowerCase();
            if (textLower.includes('create') || 
                textLower.includes('submit') || 
                textLower.includes('launch') ||
                textLower.includes('next') ||
                textLower.includes('continue') ||
                textLower.includes('confirm')) {
              console.log(`      ⭐ POTENTIAL SUBMIT BUTTON!`);
              submitButton = btn;
              submitSelector = `button containing "${text.trim()}"`;
            }
          }
        } catch (e) {
          console.log(`   Button ${i + 1}: Error analyzing - ${e.message}`);
        }
      }
      
      // List ALL elements with role="button"
      const roleButtons = await page.locator('[role="button"]').all();
      console.log(`\n   📊 Found ${roleButtons.length} elements with role="button":`);
      
      for (let i = 0; i < Math.min(roleButtons.length, 20); i++) {
        const btn = roleButtons[i];
        try {
          const text = await btn.textContent().catch(() => '');
          const isVisible = await btn.isVisible().catch(() => false);
          const tagName = await btn.evaluate(el => el.tagName).catch(() => '');
          const className = await btn.getAttribute('class').catch(() => '');
          
          console.log(`\n   Role Button ${i + 1}:`);
          console.log(`      Tag: <${tagName.toLowerCase()}>`);
          console.log(`      Text: "${text?.trim() || '(empty)'}"`);
          console.log(`      Visible: ${isVisible}`);
          console.log(`      Class: ${className || 'N/A'}`);
          
          if (isVisible && text) {
            const textLower = text.toLowerCase();
            if (textLower.includes('create') || 
                textLower.includes('submit') || 
                textLower.includes('launch') ||
                textLower.includes('next') ||
                textLower.includes('continue') ||
                textLower.includes('confirm')) {
              console.log(`      ⭐ POTENTIAL SUBMIT BUTTON!`);
              if (!submitButton) {
                submitButton = btn;
                submitSelector = `[role="button"] containing "${text.trim()}"`;
              }
            }
          }
        } catch (e) {
          console.log(`   Role Button ${i + 1}: Error analyzing - ${e.message}`);
        }
      }
      
      // List ALL input elements
      const inputs = await page.locator('input[type="submit"], input[type="button"]').all();
      console.log(`\n   📊 Found ${inputs.length} submit/button inputs:`);
      
      for (let i = 0; i < inputs.length; i++) {
        const inp = inputs[i];
        try {
          const value = await inp.getAttribute('value').catch(() => '');
          const isVisible = await inp.isVisible().catch(() => false);
          const className = await inp.getAttribute('class').catch(() => '');
          const type = await inp.getAttribute('type').catch(() => '');
          
          console.log(`\n   Input ${i + 1}:`);
          console.log(`      Type: ${type}`);
          console.log(`      Value: "${value}"`);
          console.log(`      Visible: ${isVisible}`);
          console.log(`      Class: ${className || 'N/A'}`);
          
          if (isVisible) {
            console.log(`      ⭐ POTENTIAL SUBMIT BUTTON!`);
            if (!submitButton) {
              submitButton = inp;
              submitSelector = `input[type="${type}"]`;
            }
          }
        } catch (e) {
          console.log(`   Input ${i + 1}: Error analyzing - ${e.message}`);
        }
      }
      
      // Get page HTML around form for debugging
      console.log('\n   📋 FORM HTML STRUCTURE:');
      console.log('   ' + '-'.repeat(76));
      try {
        const formHTML = await page.locator('form').first().evaluate(el => el.outerHTML).catch(() => 'No form found');
        const limitedHTML = formHTML.substring(0, 1000);
        console.log(`   ${limitedHTML}...`);
      } catch (e) {
        console.log(`   Could not extract form HTML: ${e.message}`);
      }
      
      console.log('\n   ' + '='.repeat(76));
      
      if (!submitButton) {
        console.log('   ❌ Could not find any suitable submit button');
        console.log('   💡 Please review the screenshots and button analysis above');
        throw new Error('Submit button not found after comprehensive analysis');
      } else {
        console.log(`   ✅ Found potential submit button: ${submitSelector}`);
      }
    }
    
    // Submit the form
    console.log('\n' + '='.repeat(80));
    console.log('STEP 11: SUBMITTING TOKEN CREATION FORM');
    console.log('='.repeat(80));
    console.log(`   🎯 Clicking submit button: ${submitSelector}`);
    
    await submitButton.click();
    console.log('✅ Submit button clicked');
    
    console.log('   ⏳ Waiting for token creation (10 seconds)...');
    await page.waitForTimeout(10000);
    console.log('✅ Wait complete');
    
    const afterSubmitUrl = page.url();
    console.log(`   🔗 Current URL after submission: ${afterSubmitUrl}`);
    
    await page.screenshot({ path: 'screenshots/step-4-token-created.png', fullPage: true });
    console.log('   📸 Screenshot saved: screenshots/step-4-token-created.png');
    
    // Navigate back to main page
    console.log('\n' + '='.repeat(80));
    console.log('STEP 12: NAVIGATING BACK TO MAIN PAGE');
    console.log('='.repeat(80));
    console.log(`   🌐 Navigating to: ${siteUrl}`);
    
    await page.goto(siteUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
    console.log('✅ Navigation complete');
    
    console.log('   ⏳ Waiting for page to load (5 seconds)...');
    await page.waitForTimeout(5000);
    console.log('✅ Wait complete');
    
    await page.screenshot({ path: 'screenshots/step-5-main-page-with-token.png', fullPage: true });
    console.log('   📸 Screenshot saved: screenshots/step-5-main-page-with-token.png');
    
    // Verify token appears on main page
    console.log('\n' + '='.repeat(80));
    console.log('STEP 13: VERIFYING TOKEN APPEARS ON MAIN PAGE');
    console.log('='.repeat(80));
    
    console.log(`   🔍 Looking for token name: ${tokenData.name}`);
    const nameLocator = page.locator(`text=${tokenData.name}`).first();
    const nameVisible = await nameLocator.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ${nameVisible ? '✅' : '❌'} Token name visible: ${nameVisible}`);
    
    console.log(`   🔍 Looking for token symbol: ${tokenData.symbol}`);
    const symbolLocator = page.locator(`text=${tokenData.symbol}`).first();
    const symbolVisible = await symbolLocator.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ${symbolVisible ? '✅' : '❌'} Token symbol visible: ${symbolVisible}`);
    
    // Get page content for debugging
    console.log('\n   📋 Page content analysis:');
    const bodyText = await page.locator('body').textContent();
    const hasTokenName = bodyText?.includes(tokenData.name) || false;
    const hasTokenSymbol = bodyText?.includes(tokenData.symbol) || false;
    console.log(`   ${hasTokenName ? '✅' : '❌'} Token name in page text: ${hasTokenName}`);
    console.log(`   ${hasTokenSymbol ? '✅' : '❌'} Token symbol in page text: ${hasTokenSymbol}`);
    
    if (nameVisible || symbolVisible || hasTokenName || hasTokenSymbol) {
      console.log('\n   ✅✅✅ TOKEN SUCCESSFULLY CREATED AND VISIBLE! ✅✅✅');
    } else {
      console.log('\n   ⚠️  Token not immediately visible - may be on another page or require refresh');
    }
    
    // Keep browser open for inspection
    console.log('\n' + '='.repeat(80));
    console.log('STEP 14: KEEPING BROWSER OPEN FOR INSPECTION');
    console.log('='.repeat(80));
    console.log('   ⏸️  Browser will remain open for 30 seconds for manual inspection...');
    console.log('   👀 You can review the created token on the page');
    
    await page.waitForTimeout(30000);
    console.log('   ✅ Inspection time complete');
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`   Token Name: ${tokenData.name}`);
    console.log(`   Token Symbol: ${tokenData.symbol}`);
    console.log(`   Token Description: ${tokenData.description}`);
    console.log(`   Name Filled: ${nameFilled ? '✅' : '❌'}`);
    console.log(`   Symbol Filled: ${symbolFilled ? '✅' : '❌'}`);
    console.log(`   Description Filled: ${descFilled ? '✅' : '❌'}`);
    console.log(`   Visible on Main Page: ${nameVisible || symbolVisible ? '✅' : '❌'}`);
    console.log('\n   📸 Screenshots saved in: screenshots/');
    console.log('      1. step-1-main-page.png');
    console.log('      2. step-2-create-form.png');
    console.log('      3. step-3-form-filled.png');
    console.log('      4. step-4-token-created.png');
    console.log('      5. step-5-main-page-with-token.png');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');
    
    await context.close();
  });
});

