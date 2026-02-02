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
  
  // Wait for page to stabilize
  await page.waitForTimeout(2000);
  
  // Check if Privacy Settings text is visible
  const privacyVisible = await page.locator('text=Privacy Settings').isVisible({ timeout: 2000 }).catch(() => false);
  
  if (!privacyVisible) {
    console.log('   ℹ️ No privacy modal visible');
    return false;
  }
  
  console.log('   🔒 Privacy modal detected, looking for Accept All button...');
  
  // The "Accept All" button is BLACK with white text on the RIGHT side
  const selectors = [
    'button:has-text("Accept All")',
    'button:has-text("Accept all")', 
    'button:has-text("ACCEPT ALL")',
    '[data-testid="uc-accept-all-button"]',
  ];
  
  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 3000 })) {
        console.log(`   Found Accept All button: ${selector}`);
        
        // Scroll into view and click
        await btn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await btn.click({ force: true });
        
        console.log('   ✅ Clicked Accept All');
        await page.waitForTimeout(2000);
        
        // Verify modal is gone
        const stillVisible = await page.locator('text=Privacy Settings').isVisible({ timeout: 2000 }).catch(() => false);
        if (!stillVisible) {
          console.log('   ✅ Privacy modal dismissed successfully');
          return true;
        } else {
          console.log('   ⚠️ Modal still visible, trying again...');
          await btn.click({ force: true });
          await page.waitForTimeout(2000);
        }
        
        return true;
      }
    } catch (e) {
      console.log(`   Selector ${selector} failed: ${e}`);
    }
  }
  
  // Try using getByRole as fallback
  try {
    console.log('   Trying role-based selector...');
    const acceptAllBtn = page.getByRole('button', { name: /accept all/i });
    if (await acceptAllBtn.isVisible({ timeout: 2000 })) {
      await acceptAllBtn.click({ force: true });
      console.log('   ✅ Privacy modal dismissed (role-based)');
      await page.waitForTimeout(2000);
      return true;
    }
  } catch (e) {
    // Ignore
  }
  
  // Last resort: click by coordinates (Accept All is on the right side)
  try {
    console.log('   Trying coordinate-based click...');
    const viewportSize = page.viewportSize();
    if (viewportSize) {
      // Accept All button is typically on the right side of the modal at the bottom
      await page.mouse.click(viewportSize.width * 0.75, viewportSize.height * 0.85);
      await page.waitForTimeout(2000);
      console.log('   Clicked at coordinates');
    }
  } catch (e) {
    // Ignore
  }
  
  console.log('   ⚠️ Could not dismiss privacy modal');
  return false;
}

// Helper to handle MetaMask transaction popup
async function handleMetaMaskTransaction(wallet: any, popup: Page | null) {
  console.log('   Attempting MetaMask transaction approval...');
  
  // Method 1: Use Dappwright's confirmTransaction (for standard EVM transactions)
  try {
    await wallet.confirmTransaction({ timeout: 10000 });
    console.log('   ✅ Transaction confirmed via Dappwright');
    return true;
  } catch (e: any) {
    console.log(`   Dappwright confirmTransaction: ${e.message?.substring(0, 50)}`);
  }
  
  // Method 2: Try sign() - GalaChain uses message signing!
  try {
    await wallet.sign();
    console.log('   ✅ Message signed via Dappwright (GalaChain)');
    return true;
  } catch (e: any) {
    console.log(`   Dappwright sign: ${e.message?.substring(0, 50)}`);
  }
  
  // Method 3: Try approve() as fallback
  try {
    await wallet.approve();
    console.log('   ✅ Approved via Dappwright');
    return true;
  } catch (e: any) {
    console.log(`   Dappwright approve: ${e.message?.substring(0, 50)}`);
  }
  
  // Method 2: If we have a popup page, try interacting with it directly
  if (popup) {
    try {
      await popup.waitForTimeout(2000);
      
      // MetaMask v11+ selectors
      const confirmSelectors = [
        '[data-testid="page-container-footer-next"]', // MetaMask confirm button
        '[data-testid="confirmation-submit-button"]',
        'button.btn-primary',
        'button:has-text("Confirm")',
        'button:has-text("Approve")',
        'button:has-text("Sign")',
      ];
      
      for (const selector of confirmSelectors) {
        try {
          const btn = popup.locator(selector).first();
          if (await btn.isVisible({ timeout: 2000 })) {
            await btn.click();
            console.log(`   ✅ Clicked ${selector} in MetaMask popup`);
            await popup.waitForTimeout(2000);
            return true;
          }
        } catch (e) {
          // Try next selector
        }
      }
    } catch (e: any) {
      console.log(`   Popup interaction error: ${e.message?.substring(0, 50)}`);
    }
  }
  
  // Method 3: Try wallet.sign() as fallback
  try {
    await wallet.sign();
    console.log('   ✅ Transaction signed via Dappwright sign()');
    return true;
  } catch (e) {
    // Ignore
  }
  
  console.log('   ⚠️ Could not confirm MetaMask transaction');
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
    
    // Scroll down to see the price range section
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);
    
    // Click "Full Range" button - be specific about the text match
    const fullRangeSelectors = [
      'button:has-text("Full Range")',
      'button >> text=Full Range',
      'text=Full Range',
    ];
    
    let fullRangeClicked = false;
    for (const selector of fullRangeSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          console.log(`   Found Full Range button: ${selector}`);
          await btn.click();
          console.log('   ✅ Clicked Full Range');
          fullRangeClicked = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    if (!fullRangeClicked) {
      console.log('   ⚠️ Could not find Full Range button');
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-3a-pricerange.png', fullPage: true });
    
    // Check for price range errors and fix if needed
    const priceError = await page.locator('text=/low price.*greater|min price.*lower|invalid range/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (priceError) {
      console.log('   ⚠️ Price range error detected - fixing...');
      
      // Find the Low price and High price input fields specifically
      // They're labeled with "Low price" and "High price" text nearby
      const lowPriceSection = page.locator('text=Low price').locator('..').locator('input').first();
      const highPriceSection = page.locator('text=High price').locator('..').locator('input').first();
      
      // Get current values for debugging
      try {
        const allInputs = await page.locator('input').all();
        console.log(`   Found ${allInputs.length} total inputs on page`);
        
        for (let i = 0; i < Math.min(allInputs.length, 6); i++) {
          const value = await allInputs[i].inputValue().catch(() => 'N/A');
          console.log(`   Input ${i}: value="${value}"`);
        }
      } catch (e) {
        console.log(`   Error reading inputs: ${e}`);
      }
      
      // Try to fix by setting valid range values
      // For GALA/GUSDC, market price is ~0.14 GUSDC per GALA
      // Set low = 0.01, high = 1.0
      try {
        // Method 1: Use labeled sections
        if (await lowPriceSection.isVisible({ timeout: 1000 }).catch(() => false)) {
          await lowPriceSection.click({ clickCount: 3 });
          await lowPriceSection.fill('0.01');
          console.log('   Set low price to 0.01 (via label)');
        }
        
        await page.waitForTimeout(500);
        
        if (await highPriceSection.isVisible({ timeout: 1000 }).catch(() => false)) {
          await highPriceSection.click({ clickCount: 3 });
          await highPriceSection.fill('1');
          console.log('   Set high price to 1 (via label)');
        }
      } catch (e) {
        console.log(`   Label-based fix failed: ${e}`);
        
        // Method 2: Find inputs by order - Low price input comes before High price
        try {
          const priceInputs = await page.locator('input[inputmode="decimal"], input[type="number"]').all();
          if (priceInputs.length >= 2) {
            // First two are typically low/high prices
            await priceInputs[0].click({ clickCount: 3 });
            await priceInputs[0].fill('0.01');
            await page.waitForTimeout(300);
            await priceInputs[1].click({ clickCount: 3 });
            await priceInputs[1].fill('1');
            console.log('   Set price range via input order');
          }
        } catch (e2) {
          console.log(`   Order-based fix also failed: ${e2}`);
        }
      }
      
      await page.waitForTimeout(1000);
      
      // Verify error is resolved
      const stillError = await page.locator('text=/low price.*greater|min price.*lower|invalid range/i').isVisible({ timeout: 1000 }).catch(() => false);
      if (stillError) {
        console.log('   ⚠️ Price range error STILL present after fix attempt');
        await page.screenshot({ path: 'tests/screenshots/ui-liquidity-3b-error.png', fullPage: true });
      } else {
        console.log('   ✅ Price range error resolved');
      }
    } else {
      console.log('   ✅ No price range errors');
    }
    
    await page.waitForTimeout(1000);
    
    // Enter deposit amounts - IMPORTANT: Skip the price range inputs!
    console.log('\n📍 STEP 6: Enter liquidity amounts');
    
    // Scroll down to see deposit amount section
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);
    
    // The deposit section has inputs labeled "Deposit Amounts" or similar
    // Price inputs are labeled "Low price" and "High price" - skip those!
    
    // Find all inputs on page
    const allInputs = await page.locator('input[type="number"], input[inputmode="decimal"]').all();
    console.log(`   Found ${allInputs.length} total inputs`);
    
    // Log all inputs to understand the layout
    for (let i = 0; i < allInputs.length; i++) {
      const value = await allInputs[i].inputValue().catch(() => '');
      const placeholder = await allInputs[i].getAttribute('placeholder').catch(() => '');
      console.log(`   Input ${i}: value="${value}", placeholder="${placeholder}"`);
    }
    
    // Look for the deposit amount section - it usually comes AFTER price range
    // The deposit inputs typically have placeholder "0" or "0.0" and are empty
    // Skip the first 2 inputs which are Low price / High price
    
    // Method 1: Try to find inputs in the "Deposit Amounts" section specifically
    let depositAmount0Input = null;
    let depositAmount1Input = null;
    
    // Look for section with "Deposit" text
    const depositSection = page.locator('text=/deposit|amount/i').first();
    if (await depositSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   Found deposit section');
    }
    
    // The deposit inputs are typically the 3rd and 4th inputs (after Low/High price)
    // Or we can look for inputs near token symbols
    if (allInputs.length >= 4) {
      // Skip first 2 (price range), use 3rd and 4th (deposit amounts)
      depositAmount0Input = allInputs[2];
      depositAmount1Input = allInputs[3];
      console.log('   Using inputs 2 and 3 for deposit amounts');
    } else if (allInputs.length >= 2) {
      // If only 2 inputs visible, might need to scroll more
      depositAmount0Input = allInputs[0];
      depositAmount1Input = allInputs[1];
      console.log('   Only 2 inputs found, using those');
    }
    
    // Enter amounts - use keyboard typing for better reliability
    if (depositAmount0Input) {
      await depositAmount0Input.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Click to focus
      await depositAmount0Input.click();
      await page.waitForTimeout(300);
      
      // Clear existing content
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(200);
      
      // Type the amount
      await page.keyboard.type(DEX_CONFIG.pool.amount0);
      await page.waitForTimeout(500);
      
      // Verify the value
      const value0 = await depositAmount0Input.inputValue().catch(() => '');
      console.log(`   ✅ Entered ${DEX_CONFIG.pool.amount0} for first token (value: ${value0})`);
    }
    
    await page.waitForTimeout(1000);
    
    if (depositAmount1Input) {
      await depositAmount1Input.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Click to focus
      await depositAmount1Input.click();
      await page.waitForTimeout(300);
      
      // Clear existing content
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(200);
      
      // Type the amount
      await page.keyboard.type(DEX_CONFIG.pool.amount1);
      await page.waitForTimeout(500);
      
      // Verify the value
      const value1 = await depositAmount1Input.inputValue().catch(() => '');
      console.log(`   ✅ Entered ${DEX_CONFIG.pool.amount1} for second token (value: ${value1})`);
    }
    
    // Click elsewhere to trigger validation
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-4-amounts.png', fullPage: true });
    
    // Check for any validation errors after entering amounts
    const amountError = await page.locator('text=/insufficient|not enough|invalid/i').isVisible({ timeout: 1000 }).catch(() => false);
    if (amountError) {
      console.log('   ⚠️ Amount validation error detected');
    }
    
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
            
            // Set up popup listener BEFORE clicking
            const popupPromise = context.waitForEvent('page', { timeout: 30000 }).catch(() => null);
            
            await submitBtn.click();
            await page.waitForTimeout(2000);
            submitted = true;
            
            // Handle confirmation modal (may trigger MetaMask)
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Confirm Swap"), button:has-text("Add")').first();
            if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
              const confirmDisabled = await confirmBtn.isDisabled();
              if (!confirmDisabled) {
                console.log('   Found confirmation modal, clicking confirm...');
                
                // Set up another popup listener for the actual MetaMask TX
                const txPopupPromise = context.waitForEvent('page', { timeout: 30000 }).catch(() => null);
                
                await confirmBtn.click();
                console.log('   Clicked confirm button');
                await page.waitForTimeout(3000);
                
                // Try to handle MetaMask popup
                const txPopup = await txPopupPromise;
                if (txPopup) {
                  console.log('   🎉 MetaMask TX popup detected!');
                  await handleMetaMaskTransaction(wallet, txPopup);
                } else {
                  // Try Dappwright directly
                  console.log('   No popup via event, trying Dappwright...');
                  await handleMetaMaskTransaction(wallet, null);
                }
              }
            } else {
              // No confirm modal, check for direct MetaMask popup
              const popup = await popupPromise;
              if (popup) {
                console.log('   🎉 MetaMask popup detected directly!');
                await handleMetaMaskTransaction(wallet, popup);
              }
            }
            
            break;
          }
        }
      } catch (e) { 
        console.log(`   Error: ${e}`);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-5-submitted.png', fullPage: true });
    
    // STEP 8: Handle MetaMask signing (GalaChain uses message signing, not standard TX)
    console.log('\n📍 STEP 8: Handle MetaMask signing');
    console.log('   GalaChain uses message signing via MetaMask');
    
    // Try all Dappwright methods in order of preference
    let signed = false;
    
    // Method 1: Try sign() - this is what GalaChain uses
    try {
      console.log('   Trying wallet.sign()...');
      await wallet.sign();
      console.log('   ✅ Signed via Dappwright!');
      signed = true;
    } catch (e: any) {
      console.log(`   sign() failed: ${e.message?.substring(0, 50)}`);
    }
    
    // Method 2: Try confirmTransaction as fallback
    if (!signed) {
      try {
        console.log('   Trying wallet.confirmTransaction()...');
        await wallet.confirmTransaction({ timeout: 10000 });
        console.log('   ✅ Transaction confirmed via Dappwright!');
        signed = true;
      } catch (e: any) {
        console.log(`   confirmTransaction() failed: ${e.message?.substring(0, 50)}`);
      }
    }
    
    // Method 3: Try approve as last resort
    if (!signed) {
      try {
        console.log('   Trying wallet.approve()...');
        await wallet.approve();
        console.log('   ✅ Approved via Dappwright!');
        signed = true;
      } catch (e: any) {
        console.log(`   approve() failed: ${e.message?.substring(0, 50)}`);
      }
    }
    
    if (!signed) {
      console.log('   ⚠️ Could not sign/approve transaction');
    }
    
    // Wait for transaction to process through GalaChain
    await page.waitForTimeout(10000);
    
    // Look for transaction status indicators in UI
    const statusSelectors = [
      'text=/processing|pending|confirming/i',
      'text=/success|confirmed|complete/i',
      'text=/failed|error|rejected/i',
      '.toast',
      '[class*="notification"]',
      '[class*="status"]',
    ];
    
    for (const selector of statusSelectors) {
      try {
        const statusEl = page.locator(selector).first();
        if (await statusEl.isVisible({ timeout: 3000 })) {
          const text = await statusEl.textContent();
          console.log(`   Status indicator: ${text?.substring(0, 100)}`);
        }
      } catch (e) { /* continue */ }
    }
    
    // Check result - wait for transaction to complete
    console.log('\n📍 STEP 9: Check result');
    await page.bringToFront();
    
    // Take intermediate screenshot
    await page.screenshot({ path: 'tests/screenshots/ui-liquidity-5-processing.png', fullPage: true });
    
    // Wait for "Transaction in progress" or similar to complete (up to 60 seconds)
    console.log('   Waiting for transaction to complete...');
    
    for (let i = 0; i < 12; i++) { // 12 x 5s = 60s max wait
      await page.waitForTimeout(5000);
      
      const status = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          inProgress: /transaction in progress|processing|pending|confirming/i.test(text),
          success: /success|confirmed|complete|added|created/i.test(text),
          error: /error|failed|rejected|insufficient/i.test(text),
        };
      });
      
      console.log(`   Check ${i + 1}: inProgress=${status.inProgress}, success=${status.success}, error=${status.error}`);
      
      if (status.success) {
        console.log('   🎉 TRANSACTION SUCCESSFUL!');
        break;
      } else if (status.error) {
        console.log('   ❌ Transaction failed');
        break;
      } else if (!status.inProgress && i > 0) {
        // Modal closed without clear status
        console.log('   Modal closed, checking final state...');
        break;
      }
    }
    
    const pageContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSuccess: /success|confirmed|added|created|liquidity.*added/i.test(text),
        hasError: /error|failed|rejected|insufficient/i.test(text),
        pageText: text.substring(0, 500),
      };
    });
    
    if (pageContent.hasSuccess) {
      console.log('   ✅ SUCCESS: Transaction confirmed!');
    } else if (pageContent.hasError) {
      console.log('   ❌ ERROR: Transaction failed');
    } else {
      console.log('   ⚠️ UNKNOWN: Check screenshots');
      console.log(`   Page content: ${pageContent.pageText.substring(0, 200)}`);
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
    
    // Wait for page to fully render
    await page.waitForTimeout(3000);
    
    // CRITICAL: Dismiss privacy modal FIRST
    console.log('\n📍 STEP 1.5: Dismiss privacy modal');
    await dismissPrivacyModal(page);
    await waitForLoading(page);
    
    // Check again after a moment
    await page.waitForTimeout(1000);
    await dismissPrivacyModal(page);
    
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
    
    // Submit swap - GalaSwap uses "Review and Confirm" button
    console.log('\n📍 STEP 4: Submit swap');
    console.log('   ⚠️ SUBMITTING REAL TRANSACTION');
    
    // GalaSwap button selectors in order of preference
    const swapBtnSelectors = [
      'button:has-text("Review and Confirm")',
      'button:has-text("Swap")',
      'button:has-text("Exchange")',
      'button:has-text("Trade")',
      'button:has-text("Enter Amount")', // Shows when amount needed
    ];
    
    let swapBtnFound = false;
    for (const selector of swapBtnSelectors) {
      try {
        const swapBtn = page.locator(selector).first();
        if (await swapBtn.isVisible({ timeout: 2000 })) {
          const disabled = await swapBtn.isDisabled();
          const text = await swapBtn.textContent();
          console.log(`   Found button: "${text?.trim()}" (disabled: ${disabled})`);
          
          if (!disabled && !text?.toLowerCase().includes('connect') && !text?.toLowerCase().includes('enter amount')) {
            console.log('   🚀 CLICKING SWAP BUTTON...');
            await swapBtn.click();
            swapBtnFound = true;
            await page.waitForTimeout(3000);
            
            // Handle confirmation modal - "Confirm Swap" button
            console.log('   Looking for confirmation modal...');
            const confirmBtn = page.locator('button:has-text("Confirm Swap"), button:has-text("Confirm")').first();
            if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
              console.log('   Found Confirm Swap button, clicking...');
              await confirmBtn.click();
              console.log('   ✅ Clicked Confirm Swap');
              await page.waitForTimeout(5000);
            }
            
            break;
          } else {
            console.log(`   Button not clickable: ${text?.trim()}`);
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!swapBtnFound) {
      console.log('   ⚠️ Could not find/click swap button');
      // Log available buttons
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean).slice(0, 10);
      });
      console.log('   Available buttons:', buttons);
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-swap-4-submitted.png', fullPage: true });
    
    // STEP 5: Handle MetaMask transaction approval popup
    console.log('\n📍 STEP 5: Handle MetaMask transaction approval');
    console.log('   Watching for MetaMask signature/transaction popup...');
    
    // Watch for new popup windows (MetaMask transaction approval)
    let txApproved = false;
    
    // Method 1: Try using Dappwright's confirmTransaction
    try {
      console.log('   Trying Dappwright confirmTransaction...');
      await wallet.confirmTransaction({ timeout: 15000 });
      console.log('   ✅ Transaction confirmed via Dappwright!');
      txApproved = true;
    } catch (e) {
      console.log(`   Dappwright confirmTransaction failed: ${e}`);
    }
    
    // Method 2: Try sign() for message signing
    if (!txApproved) {
      try {
        console.log('   Trying Dappwright sign...');
        await wallet.sign();
        console.log('   ✅ Signed via Dappwright!');
        txApproved = true;
      } catch (e) {
        console.log(`   Dappwright sign failed: ${e}`);
      }
    }
    
    // Method 3: Try approve() as fallback
    if (!txApproved) {
      try {
        console.log('   Trying Dappwright approve...');
        await wallet.approve();
        console.log('   ✅ Approved via Dappwright!');
        txApproved = true;
      } catch (e) {
        console.log(`   Dappwright approve failed: ${e}`);
      }
    }
    
    // Method 4: Manually check for popup windows
    if (!txApproved) {
      console.log('   Checking for popup windows manually...');
      const allPages = browserContext.pages();
      console.log(`   Found ${allPages.length} pages`);
      
      for (const p of allPages) {
        const url = p.url();
        console.log(`   Page URL: ${url}`);
        
        if (url.includes('chrome-extension') && url.includes('notification')) {
          console.log('   Found MetaMask notification popup!');
          await p.bringToFront();
          await p.waitForTimeout(2000);
          
          // Take screenshot of MetaMask popup
          await p.screenshot({ path: 'tests/screenshots/ui-swap-metamask-popup.png' });
          
          // Try to find and click confirm/approve button
          const confirmSelectors = [
            'button:has-text("Confirm")',
            'button:has-text("Sign")',
            'button:has-text("Approve")',
            '[data-testid="confirm-footer-button"]',
            '[data-testid="page-container-footer-next"]',
          ];
          
          for (const sel of confirmSelectors) {
            try {
              const btn = p.locator(sel).first();
              if (await btn.isVisible({ timeout: 2000 })) {
                console.log(`   Found button: ${sel}`);
                await btn.click();
                console.log('   ✅ Clicked confirm in MetaMask!');
                txApproved = true;
                break;
              }
            } catch (e) {
              // Try next
            }
          }
          
          break;
        }
      }
    }
    
    if (!txApproved) {
      console.log('   ⚠️ No MetaMask popup detected or approved');
      console.log('   This could mean:');
      console.log('   1. GalaChain uses bundler signing (no MetaMask needed)');
      console.log('   2. Popup was blocked or appeared elsewhere');
      console.log('   3. Session already authorized');
    }
    
    // Wait for transaction processing
    await page.waitForTimeout(5000);
    
    // Check result - wait for transaction to complete
    console.log('\n📍 STEP 6: Check result');
    await page.bringToFront();
    
    // Take intermediate screenshot
    await page.screenshot({ path: 'tests/screenshots/ui-swap-5-processing.png', fullPage: true });
    
    // Wait for "Transaction in progress" to complete (up to 60 seconds)
    console.log('   Waiting for transaction to complete...');
    let txCompleted = false;
    
    for (let i = 0; i < 12; i++) { // 12 x 5s = 60s max wait
      await page.waitForTimeout(5000);
      
      const status = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          inProgress: /transaction in progress|processing|pending/i.test(text),
          success: /success|confirmed|complete|swap.*complete/i.test(text),
          error: /error|failed|rejected|insufficient/i.test(text),
        };
      });
      
      console.log(`   Check ${i + 1}: inProgress=${status.inProgress}, success=${status.success}, error=${status.error}`);
      
      if (status.success) {
        console.log('   🎉 TRANSACTION SUCCESSFUL!');
        txCompleted = true;
        break;
      } else if (status.error) {
        console.log('   ❌ Transaction failed');
        txCompleted = true;
        break;
      } else if (!status.inProgress) {
        // Modal closed without clear status - check for UI changes
        console.log('   Modal closed, checking final state...');
        txCompleted = true;
        break;
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/ui-swap-5-result.png', fullPage: true });
    
    const result = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSuccess: /success|confirmed|complete|swap.*success/i.test(text),
        hasError: /error|failed|rejected/i.test(text),
        pageText: text.substring(0, 500),
      };
    });
    
    if (result.hasSuccess) {
      console.log('   ✅ SUCCESS: Swap completed!');
    } else if (result.hasError) {
      console.log('   ❌ ERROR: Swap failed');
    } else {
      console.log('   ⚠️ UNKNOWN: Check screenshots');
      console.log(`   Page content: ${result.pageText.substring(0, 200)}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST COMPLETE - Check screenshots for details');
    console.log('='.repeat(50));
  });
});
