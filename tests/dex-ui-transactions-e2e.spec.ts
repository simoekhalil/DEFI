import { test, expect, BrowserContext, Page } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * DEX UI Transaction Tests - Actual Transaction Submission via Browser
 * 
 * This test uses Dappwright to automate MetaMask and submits REAL transactions
 * through the GalaSwap DEX UI.
 * 
 * Key improvements:
 * 1. Handles privacy/cookie modal ("Accept All")
 * 2. Waits for loading states to clear
 * 3. Robust MetaMask version handling
 * 4. Detailed logging for debugging
 * 5. Proper wallet connection flow
 */

// Dynamic import for dappwright
let bootstrap: any;
let MetaMaskWallet: any;

async function initDappwright() {
  const dappwright = await import('@tenkeylabs/dappwright');
  bootstrap = dappwright.bootstrap;
  MetaMaskWallet = dappwright.MetaMaskWallet;
  return true;
}

// GalaSwap DEX Test Configuration
const DEX_CONFIG = {
  baseUrl: process.env.DEX_FRONTEND_URL || 'https://dex-frontend-test1.defi.gala.com',
  
  // URLs
  poolUrl: '/dex/pool',
  addLiquidityUrl: '/dex/pool/add-liquidity',
  swapUrl: '/GUSDC/GALA',
  
  // Test pool parameters
  pool: {
    token0: 'GALA',
    token1: 'GUSDC',
    feeTier: 500, // 0.05%
    amount0: '50', // 50 GALA
    amount1: '5',  // 5 GUSDC
  },
  
  // Swap parameters
  swap: {
    fromToken: 'GALA',
    toToken: 'GUSDC',
    amount: '10', // 10 GALA
  },
  
  // Timeouts
  pageLoadTimeout: 45000,
  elementTimeout: 10000,
  transactionTimeout: 120000,
};

// Helper to dismiss privacy modal - CRITICAL: Must click Accept All
async function dismissPrivacyModal(page: Page) {
  console.log('   Checking for privacy modal...');
  
  // Wait a moment for modal to appear
  await page.waitForTimeout(1500);
  
  // The modal has "Accept All" button in black background
  const selectors = [
    'button:has-text("Accept All")',
    'button:has-text("Accept all")', 
    'button:has-text("ACCEPT ALL")',
    '[data-testid="uc-accept-all-button"]',
    '.privacy-settings button >> text=Accept',
    'button.accept-all',
  ];
  
  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 3000 })) {
        console.log(`   Found privacy button: ${selector}`);
        await btn.click({ force: true });
        console.log('   ✅ Privacy modal dismissed');
        await page.waitForTimeout(1000);
        
        // Verify modal is gone
        await page.waitForSelector('text=Privacy Settings', { state: 'hidden', timeout: 5000 }).catch(() => {});
        return true;
      }
    } catch (e) {
      // Try next
    }
  }
  
  // Try clicking by position if text-based selectors fail
  try {
    const acceptAllBtn = page.getByRole('button', { name: /accept all/i });
    if (await acceptAllBtn.isVisible({ timeout: 2000 })) {
      await acceptAllBtn.click({ force: true });
      console.log('   ✅ Privacy modal dismissed (role-based)');
      await page.waitForTimeout(1000);
      return true;
    }
  } catch (e) {
    // Ignore
  }
  
  console.log('   ℹ️ No privacy modal found or already dismissed');
  return false;
}

// Helper to wait for loading to complete
async function waitForLoading(page: Page) {
  const loadingSelectors = [
    '.loader',
    '[class*="loading"]',
    '[class*="spinner"]',
    '.animate-spin',
  ];
  
  for (const selector of loadingSelectors) {
    try {
      await page.waitForSelector(selector, { state: 'hidden', timeout: 15000 });
    } catch (e) {
      // Loading element might not exist
    }
  }
  await page.waitForTimeout(500);
}

// Helper to connect wallet - handles GalaSwap's connection flow
async function connectWallet(page: Page, wallet: any, context: BrowserContext): Promise<boolean> {
  console.log('   Checking wallet connection status...');
  
  // First check if already connected (look for address or Disconnect button)
  const isConnected = await page.evaluate(() => {
    const text = document.body.innerText;
    // Check for wallet address patterns or "Disconnect" text
    return text.includes('Disconnect') ||
           /0x[a-fA-F0-9]{4,}/.test(text) ||
           /eth\|[a-f0-9]+/i.test(text) ||
           /client\|[a-f0-9]+/i.test(text);
  });
  
  if (isConnected) {
    console.log('   ✅ Wallet already connected');
    return true;
  }
  
  // Find connect button - GalaSwap has "Connect Wallet" button in header
  console.log('   Looking for Connect Wallet button...');
  
  const connectSelectors = [
    'button:has-text("Connect Wallet")',
    'header button:has-text("Connect")',
    'nav button:has-text("Connect")',
    '[data-testid="connect-wallet"]',
    'w3m-button',
  ];
  
  let connectClicked = false;
  
  // First, try header Connect Wallet button specifically
  const headerConnectBtn = page.locator('header button:has-text("Connect Wallet"), nav button:has-text("Connect Wallet")').first();
  
  if (await headerConnectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Found Connect Wallet in header');
    
    // Set up popup listener BEFORE clicking
    const popupPromise = context.waitForEvent('page', { timeout: 30000 }).catch(() => null);
    
    await headerConnectBtn.click();
    console.log('   Clicked header Connect Wallet button');
    await page.waitForTimeout(3000);
    connectClicked = true;
    
    // Take screenshot of wallet modal
    await page.screenshot({ path: 'tests/screenshots/ui-wallet-modal.png', fullPage: true });
    
    // Look for wallet selection modal - MetaMask option
    console.log('   Looking for MetaMask in wallet modal...');
    
    const mmSelectors = [
      'button:has-text("MetaMask")',
      'div:has-text("MetaMask")',
      '[data-wallet-id*="metamask" i]',
      'img[alt*="metamask" i]',
      'text=/MetaMask/i',
    ];
    
    let mmClicked = false;
    for (const mmSelector of mmSelectors) {
      try {
        const mmBtn = page.locator(mmSelector).first();
        if (await mmBtn.isVisible({ timeout: 3000 })) {
          console.log(`   Found MetaMask option: ${mmSelector}`);
          await mmBtn.click();
          console.log('   Clicked MetaMask');
          mmClicked = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    if (!mmClicked) {
      console.log('   ⚠️ Could not find MetaMask option in modal');
      // Log available options
      const modalContent = await page.evaluate(() => {
        const modal = document.querySelector('[class*="modal"], [class*="dialog"], [role="dialog"]');
        return modal?.textContent?.substring(0, 200) || 'No modal found';
      });
      console.log(`   Modal content: ${modalContent}`);
    }
    
    // Wait for MetaMask popup - using multiple approaches
    console.log('   Waiting for MetaMask extension popup...');
    
    // Give MetaMask time to open its popup
    await page.waitForTimeout(3000);
    
    // Approach 1: Try popup promise
    const popup = await popupPromise;
    
    if (popup) {
      console.log('   🎉 MetaMask popup detected!');
      try {
        await page.waitForTimeout(2000);
        await wallet.approve();
        console.log('   ✅ Connection approved via Dappwright');
        await popup.waitForEvent('close', { timeout: 15000 }).catch(() => {});
      } catch (e: any) {
        console.warn(`   ⚠️ Approval error: ${e.message?.substring(0, 100)}`);
      }
    } else {
      console.log('   ℹ️ No popup detected via event');
      
      // Approach 2: Try Dappwright's approve directly (it finds the popup itself)
      console.log('   Trying Dappwright approve directly...');
      try {
        await wallet.approve();
        console.log('   ✅ Direct approve worked!');
      } catch (e: any) {
        console.log(`   Direct approve failed: ${e.message?.substring(0, 50)}`);
        
        // Approach 3: Look for popup pages in context
        const pages = context.pages();
        console.log(`   Found ${pages.length} pages in context`);
        
        for (const p of pages) {
          const url = p.url();
          if (url.includes('chrome-extension') && url.includes('notification')) {
            console.log(`   Found MetaMask notification page: ${url}`);
            try {
              // Try to click approve button on MetaMask page
              const confirmBtn = p.locator('button:has-text("Connect"), button[data-testid="page-container-footer-next"]');
              if (await confirmBtn.isVisible({ timeout: 3000 })) {
                await confirmBtn.click();
                console.log('   ✅ Clicked Connect in MetaMask');
              }
            } catch (e2) {
              console.log('   Could not interact with MetaMask page');
            }
          }
        }
      }
    }
    
    // Bring main page back to front
    await page.bringToFront();
    await page.waitForTimeout(3000);
    
    // Verify connection succeeded
    const nowConnected = await page.evaluate(() => {
      const text = document.body.innerText;
      // Check for connected indicators
      return text.includes('Disconnect') || 
             /0x[a-fA-F0-9]{4,}/.test(text) ||
             text.includes('eth|');
    });
    
    if (nowConnected) {
      console.log('   ✅ Wallet connected successfully!');
      return true;
    } else {
      console.log('   ⚠️ Wallet may not be connected');
    }
  }
  
  if (!connectClicked) {
    console.log('   ⚠️ Could not find Connect Wallet button');
  }
  
  return false;
}

test.describe('DEX UI Transactions - E2E with MetaMask', () => {
  let context: BrowserContext;
  let page: Page;
  let wallet: any;
  let setupComplete = false;

  test.beforeAll(async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🌐 DEX UI TRANSACTION TESTS');
    console.log('⚠️  THESE TESTS SUBMIT REAL TRANSACTIONS VIA BROWSER UI');
    console.log('='.repeat(70));
    console.log(`📍 DEX: ${DEX_CONFIG.baseUrl}`);
    
    // Validate seed phrase
    const seedPhrase = process.env.WALLET_SEED_PHRASE || process.env.TEST_SEED_PHRASE;
    if (!seedPhrase) {
      throw new Error('WALLET_SEED_PHRASE required in .env');
    }
    
    // Initialize Dappwright
    await initDappwright();
    console.log('✅ Dappwright loaded');
    
    // Bootstrap MetaMask with version fallback
    const versionsToTry = ['13.13.1', '11.9.1', '11.0.0', MetaMaskWallet?.recommendedVersion].filter(Boolean);
    
    for (const version of versionsToTry) {
      try {
        console.log(`   Trying MetaMask v${version}...`);
        const [walletInstance, _, browserContext] = await bootstrap('', {
          wallet: 'metamask',
          version: version,
          seed: seedPhrase,
          headless: false,
        });
        
        wallet = walletInstance;
        context = browserContext;
        console.log(`✅ MetaMask v${version} loaded`);
        setupComplete = true;
        break;
      } catch (e: any) {
        console.log(`   ⚠️ v${version} failed: ${e.message?.substring(0, 50)}`);
      }
    }
    
    if (!setupComplete) {
      throw new Error('Could not initialize MetaMask');
    }
  });

  test.afterAll(async () => {
    if (context) {
      try {
        await context.browser()?.close();
      } catch (e) { /* ignore */ }
    }
  });

  test('1. Add Liquidity via UI - Full Transaction', async () => {
    test.setTimeout(300000); // 5 min
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST: Add Liquidity via DEX UI');
    console.log('='.repeat(50));
    
    // Create page and navigate
    page = await context.newPage();
    console.log('\n📍 STEP 1: Navigate to Add Liquidity page');
    
    await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
      waitUntil: 'domcontentloaded',
      timeout: DEX_CONFIG.pageLoadTimeout
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    console.log(`   URL: ${page.url()}`);
    
    // CRITICAL: Dismiss privacy modal FIRST before anything else
    console.log('\n📍 STEP 1.5: Dismiss privacy modal');
    await dismissPrivacyModal(page);
    await waitForLoading(page);
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-1-page.png', fullPage: true });
    
    // Connect wallet
    console.log('\n📍 STEP 2: Connect wallet');
    const connected = await connectWallet(page, wallet, context);
    
    if (!connected) {
      console.log('   ⚠️ Wallet connection uncertain, continuing...');
    } else {
      console.log('   ✅ Wallet connected!');
    }
    
    // Wait and dismiss any new modals that appeared
    await page.waitForTimeout(2000);
    await dismissPrivacyModal(page); // Check again in case it reappeared
    
    // Verify we're on the add liquidity page, not swap
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('add-liquidity') && !currentUrl.includes('pool')) {
      console.log('   Navigating to Add Liquidity page...');
      await page.goto(`${DEX_CONFIG.baseUrl}/dex/pool/add-liquidity`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await dismissPrivacyModal(page);
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-2-connected.png', fullPage: true });
    
    // Select tokens - the UI has dropdown buttons in "Select pair" section
    console.log('\n📍 STEP 3: Select token pair');
    console.log(`   Token0: ${DEX_CONFIG.pool.token0}`);
    console.log(`   Token1: ${DEX_CONFIG.pool.token1}`);
    
    // Log all visible buttons for debugging
    const allButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim().substring(0, 40),
        class: b.className.substring(0, 50),
      })).filter(b => b.text);
    });
    console.log('   Visible buttons:', JSON.stringify(allButtons.slice(0, 10), null, 2));
    
    // The token selectors appear as dropdowns with "Select token" text
    // They have a chevron/arrow indicator
    const tokenDropdowns = page.locator('button:has-text("Select token"), [class*="select"] >> text=Select token');
    const tokenBtnCount = await tokenDropdowns.count();
    console.log(`   Found ${tokenBtnCount} token dropdown(s)`);
    
    // Helper to select a token from dropdown
    async function selectToken(tokenName: string, dropdownIndex: number) {
      try {
        // Click the dropdown
        const dropdown = page.locator('button:has-text("Select token")').nth(dropdownIndex);
        if (await dropdown.isVisible({ timeout: 3000 })) {
          console.log(`   Clicking token dropdown ${dropdownIndex}...`);
          await dropdown.click();
          await page.waitForTimeout(1500);
          
          // Look for search input in modal
          const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[type="text"]').first();
          if (await searchInput.isVisible({ timeout: 2000 })) {
            await searchInput.fill(tokenName);
            console.log(`   Searching for ${tokenName}...`);
            await page.waitForTimeout(1000);
          }
          
          // Click the token in the list - look for exact match
          const tokenSelectors = [
            `div:has-text("${tokenName}") >> nth=0`,
            `span:has-text("${tokenName}")`,
            `button:has-text("${tokenName}")`,
            `text="${tokenName}"`,
          ];
          
          for (const selector of tokenSelectors) {
            try {
              const option = page.locator(selector).first();
              if (await option.isVisible({ timeout: 1500 })) {
                await option.click();
                console.log(`   ✅ Selected ${tokenName}`);
                await page.waitForTimeout(500);
                return true;
              }
            } catch (e) { /* try next */ }
          }
          
          // Close modal if selection failed
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`   ⚠️ Error selecting ${tokenName}: ${e}`);
      }
      return false;
    }
    
    // Select first token (Token0)
    if (tokenBtnCount >= 1) {
      await selectToken(DEX_CONFIG.pool.token0, 0);
    }
    
    await page.waitForTimeout(1000);
    
    // Select second token (Token1) - re-query after first selection
    const remainingDropdowns = await page.locator('button:has-text("Select token")').count();
    console.log(`   Remaining token dropdowns: ${remainingDropdowns}`);
    
    if (remainingDropdowns >= 1) {
      await selectToken(DEX_CONFIG.pool.token1, 0); // It's now the first "Select token" button
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-3-tokens.png', fullPage: true });
    
    // Select fee tier
    console.log('\n📍 STEP 4: Select fee tier');
    const feeTierPercent = (DEX_CONFIG.pool.feeTier / 10000).toFixed(2);
    
    const feeSelectors = [
      `button:has-text("${feeTierPercent}%")`,
      'button:has-text("0.05%")',
      'button:has-text("0.30%")',
      'button:has-text("1.00%")',
    ];
    
    for (const selector of feeSelectors) {
      try {
        const feeBtn = page.locator(selector).first();
        if (await feeBtn.isVisible({ timeout: 2000 })) {
          await feeBtn.click();
          console.log(`   ✅ Selected fee tier`);
          break;
        }
      } catch (e) { /* try next */ }
    }
    
    // Set price range (full range)
    console.log('\n📍 STEP 5: Set price range');
    const fullRangeBtn = page.locator('button:has-text("Full Range"), button:has-text("Full")').first();
    if (await fullRangeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fullRangeBtn.click();
      console.log('   ✅ Selected full range');
    }
    
    await page.waitForTimeout(1000);
    
    // Enter amounts
    console.log('\n📍 STEP 6: Enter liquidity amounts');
    const amountInputs = await page.locator('input[type="number"], input[inputmode="decimal"], input[placeholder*="0"]').all();
    console.log(`   Found ${amountInputs.length} amount inputs`);
    
    if (amountInputs.length >= 1) {
      await amountInputs[0].click();
      await amountInputs[0].fill(DEX_CONFIG.pool.amount0);
      console.log(`   ✅ Entered ${DEX_CONFIG.pool.amount0} ${DEX_CONFIG.pool.token0}`);
    }
    
    if (amountInputs.length >= 2) {
      await amountInputs[1].click();
      await amountInputs[1].fill(DEX_CONFIG.pool.amount1);
      console.log(`   ✅ Entered ${DEX_CONFIG.pool.amount1} ${DEX_CONFIG.pool.token1}`);
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-4-amounts.png', fullPage: true });
    
    // Submit transaction
    console.log('\n📍 STEP 7: Submit transaction');
    console.log('   ⚠️ SUBMITTING REAL TRANSACTION');
    
    const submitSelectors = [
      'button:has-text("Add")',
      'button:has-text("Preview")',
      'button:has-text("Add Liquidity")',
      'button:has-text("Supply")',
      'button:has-text("Confirm")',
      'button[type="submit"]',
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitBtn = page.locator(selector).first();
        if (await submitBtn.isVisible({ timeout: 2000 })) {
          const disabled = await submitBtn.isDisabled();
          const btnText = await submitBtn.textContent();
          console.log(`   Found button: "${btnText?.trim()}" (disabled: ${disabled})`);
          
          if (!disabled && !btnText?.toLowerCase().includes('connect')) {
            console.log('   🚀 CLICKING SUBMIT...');
            await submitBtn.click();
            await page.waitForTimeout(2000);
            submitted = true;
            
            // Handle confirmation modal
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Add")').first();
            if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              const confirmDisabled = await confirmBtn.isDisabled();
              if (!confirmDisabled) {
                console.log('   Clicking confirm...');
                await confirmBtn.click();
                await page.waitForTimeout(2000);
              }
            }
            
            break;
          }
        }
      } catch (e) { /* try next */ }
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-5-submitted.png', fullPage: true });
    
    // Approve in MetaMask
    if (submitted) {
      console.log('\n📍 STEP 8: Approve in MetaMask');
      
      for (let i = 0; i < 3; i++) {
        try {
          await page.waitForTimeout(3000);
          await wallet.confirmTransaction();
          console.log(`   ✅ Transaction ${i + 1} approved`);
        } catch (e) {
          if (i === 0) console.log(`   ℹ️ No popup on attempt ${i + 1}`);
          break;
        }
      }
    }
    
    // Check result
    console.log('\n📍 STEP 9: Check result');
    await page.bringToFront();
    await page.waitForTimeout(5000);
    
    const pageContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSuccess: /success|confirmed|added|created/i.test(text),
        hasError: /error|failed|rejected|insufficient/i.test(text),
      };
    });
    
    if (pageContent.hasSuccess) {
      console.log('   ✅ SUCCESS: Transaction confirmed!');
    } else if (pageContent.hasError) {
      console.log('   ❌ ERROR: Transaction failed');
    } else {
      console.log('   ⚠️ UNKNOWN: Check screenshots');
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-6-result.png', fullPage: true });
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST COMPLETE - Check screenshots for details');
    console.log('='.repeat(50));
  });

  test('2. Swap Tokens via UI - Full Transaction', async () => {
    test.setTimeout(240000); // 4 min
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST: Swap Tokens via DEX UI');
    console.log('='.repeat(50));
    
    // Create new page
    page = await context.newPage();
    console.log('\n📍 STEP 1: Navigate to Swap page');
    
    await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.swapUrl}`, {
      waitUntil: 'domcontentloaded',
      timeout: DEX_CONFIG.pageLoadTimeout
    });
    
    await dismissPrivacyModal(page);
    await waitForLoading(page);
    
    console.log(`   URL: ${page.url()}`);
    await page.screenshot({ path: 'tests/screenshots/ui-swap-1-page.png', fullPage: true });
    
    // Connect wallet
    console.log('\n📍 STEP 2: Connect wallet');
    await connectWallet(page, wallet, context);
    await page.screenshot({ path: 'tests/screenshots/ui-swap-2-connected.png', fullPage: true });
    
    // The URL /GUSDC/GALA should pre-select the tokens
    // Just need to enter amount
    console.log('\n📍 STEP 3: Enter swap amount');
    
    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"]').first();
    if (await amountInput.isVisible({ timeout: 3000 })) {
      await amountInput.fill(DEX_CONFIG.swap.amount);
      console.log(`   ✅ Entered ${DEX_CONFIG.swap.amount} ${DEX_CONFIG.swap.fromToken}`);
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/ui-swap-3-amount.png', fullPage: true });
    
    // Submit swap
    console.log('\n📍 STEP 4: Submit swap');
    console.log('   ⚠️ SUBMITTING REAL TRANSACTION');
    
    const swapBtn = page.locator('button:has-text("Swap"), button:has-text("Exchange"), button:has-text("Trade")').first();
    
    if (await swapBtn.isVisible({ timeout: 3000 })) {
      const disabled = await swapBtn.isDisabled();
      const text = await swapBtn.textContent();
      console.log(`   Found button: "${text?.trim()}" (disabled: ${disabled})`);
      
      if (!disabled && !text?.toLowerCase().includes('connect')) {
        console.log('   🚀 CLICKING SWAP...');
        await swapBtn.click();
        await page.waitForTimeout(2000);
        
        // Confirm modal
        const confirmBtn = page.locator('button:has-text("Confirm Swap"), button:has-text("Confirm")').first();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-swap-4-submitted.png', fullPage: true });
    
    // Approve in MetaMask
    console.log('\n📍 STEP 5: Approve in MetaMask');
    
    for (let i = 0; i < 2; i++) {
      try {
        await page.waitForTimeout(3000);
        await wallet.confirmTransaction();
        console.log(`   ✅ Transaction ${i + 1} approved`);
      } catch (e) {
        break;
      }
    }
    
    // Check result
    console.log('\n📍 STEP 6: Check result');
    await page.bringToFront();
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'tests/screenshots/ui-swap-5-result.png', fullPage: true });
    
    const result = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSuccess: /success|confirmed|complete/i.test(text),
        hasError: /error|failed|rejected/i.test(text),
      };
    });
    
    if (result.hasSuccess) {
      console.log('   ✅ SUCCESS: Swap completed!');
    } else if (result.hasError) {
      console.log('   ❌ ERROR: Swap failed');
    } else {
      console.log('   ⚠️ UNKNOWN: Check screenshots');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST COMPLETE - Check screenshots for details');
    console.log('='.repeat(50));
  });
});
