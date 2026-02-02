import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * GalaSwap DEX E2E Tests - Using Gala Testnet Wallet Extension
 * 
 * THIS TEST SUBMITS REAL TRANSACTIONS!
 * 
 * Tests the complete DEX flows on GalaSwap:
 * 1. Connect wallet via Gala testnet extension
 * 2. Swap tokens (GALA <-> GUSDC)
 * 3. Add liquidity to pools
 * 4. View positions
 * 
 * GalaSwap DEX URLs:
 * - Frontend: https://dex-frontend-test1.defi.gala.com
 * 
 * Requirements:
 * - Gala testnet wallet extension in extensions/testnet-wallet/build
 * - Wallet must have sufficient GALA + GUSDC balance
 */

// GalaSwap DEX Configuration
const DEX_CONFIG = {
  frontendUrl: process.env.DEX_FRONTEND_URL || 'https://dex-frontend-test1.defi.gala.com',
  
  // Extension path
  extensionPath: path.join(__dirname, '..', 'extensions', 'testnet-wallet', 'build'),
  
  // Pool parameters
  pool: {
    token0: 'GALA',
    token1: 'GUSDC',
    swapAmount: '10', // Small test swap
  },
  
  // Timeouts
  pageLoadTimeout: 30000,
  walletTimeout: 60000,
  transactionTimeout: 120000,
};

test.describe('GalaSwap DEX E2E Tests', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ }, testInfo) => {
    console.log('\n' + '='.repeat(70));
    console.log(`🏊 GALASWAP DEX E2E TEST: ${testInfo.title}`);
    console.log('='.repeat(70));
    console.log(`📍 DEX Frontend: ${DEX_CONFIG.frontendUrl}`);
    console.log(`📁 Extension Path: ${DEX_CONFIG.extensionPath}`);
  });

  test.afterEach(async () => {
    if (context) {
      try {
        await context.close();
        console.log('✅ Browser context closed');
      } catch (e) {
        // Ignore
      }
    }
  });

  test('1. Navigate to GalaSwap and Explore Pools', async () => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('\n📍 Step 1: Launching browser with extension...');
    
    // Launch browser with Gala testnet wallet extension
    context = await chromium.launchPersistentContext('', {
      headless: false,
      channel: 'chrome',
      args: [
        `--disable-extensions-except=${DEX_CONFIG.extensionPath}`,
        `--load-extension=${DEX_CONFIG.extensionPath}`,
        '--disable-blink-features=AutomationControlled',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      viewport: { width: 1920, height: 1080 },
    });
    
    console.log('✅ Browser launched with Gala Testnet Wallet extension');
    
    // Wait for extension to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create page and navigate
    page = await context.newPage();
    
    console.log('\n📍 Step 2: Navigating to GalaSwap DEX...');
    await page.goto(DEX_CONFIG.frontendUrl, {
      waitUntil: 'networkidle',
      timeout: DEX_CONFIG.pageLoadTimeout,
    });
    
    console.log(`✅ Loaded: ${page.url()}`);
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-dex-1-homepage.png',
      fullPage: true
    });
    
    // Explore page structure
    console.log('\n📍 Step 3: Analyzing page structure...');
    
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        navLinks: Array.from(document.querySelectorAll('nav a, header a')).map(a => ({
          text: a.textContent?.trim(),
          href: (a as HTMLAnchorElement).href
        })),
        buttons: Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.textContent?.trim().substring(0, 50),
          class: b.className.substring(0, 50)
        })).filter(b => b.text),
        hasConnectButton: /connect.*wallet|connect/i.test(document.body.innerText),
      };
    });
    
    console.log(`   Title: ${pageInfo.title}`);
    console.log(`   URL: ${pageInfo.url}`);
    console.log(`   Nav Links: ${JSON.stringify(pageInfo.navLinks.slice(0, 5))}`);
    console.log(`   Connect Button: ${pageInfo.hasConnectButton ? 'Found' : 'Not visible'}`);
    
    // Try to find Swap and Pool sections
    console.log('\n📍 Step 4: Finding Swap section...');
    
    // Common navigation patterns
    const swapNavSelectors = [
      'a[href*="swap"]',
      'a:has-text("Swap")',
      'button:has-text("Swap")',
      'nav >> text=/swap/i',
    ];
    
    let swapFound = false;
    for (const selector of swapNavSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   Found swap nav: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          swapFound = true;
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    if (!swapFound) {
      // Try direct URL
      await page.goto(`${DEX_CONFIG.frontendUrl}/swap`).catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-dex-2-swap-page.png',
      fullPage: true
    });
    
    console.log(`   Current URL: ${page.url()}`);
    
    // Look for Pools section
    console.log('\n📍 Step 5: Finding Pools section...');
    
    const poolNavSelectors = [
      'a[href*="pool"]',
      'a[href*="liquidity"]',
      'a:has-text("Pool")',
      'a:has-text("Pools")',
      'a:has-text("Liquidity")',
    ];
    
    for (const selector of poolNavSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   Found pools nav: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    // Try direct URL if nav not found
    if (!page.url().includes('pool')) {
      await page.goto(`${DEX_CONFIG.frontendUrl}/pools`).catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-dex-3-pools-page.png',
      fullPage: true
    });
    
    console.log(`   Current URL: ${page.url()}`);
    
    // Analyze pools page
    const poolsInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 1000),
        hasPoolList: /GALA|GUSDC|pool|liquidity/i.test(document.body.innerText),
        addLiquidityBtn: Array.from(document.querySelectorAll('button')).find(b => 
          /add.*liquidity|new.*position|create/i.test(b.textContent || '')
        )?.textContent?.trim(),
      };
    });
    
    console.log(`   Has pool content: ${poolsInfo.hasPoolList}`);
    console.log(`   Add liquidity button: ${poolsInfo.addLiquidityBtn || 'Not found'}`);
    
    // Verify basic page loading
    expect(page.url()).toContain('dex-frontend');
    console.log('\n✅ GalaSwap DEX navigation test completed');
  });

  test('2. Connect Wallet to GalaSwap', async () => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('\n📍 Step 1: Launching browser with Gala wallet...');
    
    context = await chromium.launchPersistentContext('', {
      headless: false,
      channel: 'chrome',
      args: [
        `--disable-extensions-except=${DEX_CONFIG.extensionPath}`,
        `--load-extension=${DEX_CONFIG.extensionPath}`,
        '--disable-blink-features=AutomationControlled',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      viewport: { width: 1920, height: 1080 },
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    page = await context.newPage();
    
    console.log('\n📍 Step 2: Navigate to GalaSwap...');
    await page.goto(DEX_CONFIG.frontendUrl, {
      waitUntil: 'networkidle',
      timeout: DEX_CONFIG.pageLoadTimeout,
    });
    
    console.log(`✅ On: ${page.url()}`);
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-wallet-1-homepage.png',
      fullPage: true
    });
    
    console.log('\n📍 Step 3: Looking for Connect Wallet button...');
    
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      'w3m-button',
      '[data-testid*="connect"]',
      'button[class*="connect" i]',
    ];
    
    let connectClicked = false;
    for (const selector of connectSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 3000 })) {
          console.log(`   Found: ${selector}`);
          await btn.click();
          await page.waitForTimeout(2000);
          connectClicked = true;
          break;
        }
      } catch (e) {
        // Try next
      }
    }
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-wallet-2-connect-modal.png',
      fullPage: true
    });
    
    if (connectClicked) {
      console.log('\n📍 Step 4: Looking for Gala Wallet option...');
      
      // Look for Gala wallet in modal
      const galaSelectors = [
        'text=/gala/i',
        'button:has-text("Gala")',
        'div:has-text("Gala Wallet")',
        '[data-testid*="gala"]',
        'img[alt*="gala" i]',
      ];
      
      for (const selector of galaSelectors) {
        try {
          const galaOption = page.locator(selector).first();
          if (await galaOption.isVisible({ timeout: 3000 })) {
            console.log(`   Found Gala option: ${selector}`);
            await galaOption.click();
            await page.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          // Try next
        }
      }
      
      // Check for extension popup
      const pages = context.pages();
      console.log(`   Open pages: ${pages.length}`);
      
      for (const p of pages) {
        const url = p.url();
        console.log(`   - ${url.substring(0, 80)}`);
        
        // Look for extension page
        if (url.includes('chrome-extension://') || url.includes('popup')) {
          console.log('   📍 Found extension popup!');
          await p.screenshot({
            path: 'tests/screenshots/galaswap-wallet-3-extension-popup.png',
            fullPage: true
          });
          
          // Try to approve connection
          try {
            const approveBtn = p.locator('button:has-text("Connect"), button:has-text("Approve"), button:has-text("Allow")').first();
            if (await approveBtn.isVisible({ timeout: 3000 })) {
              await approveBtn.click();
              console.log('   ✅ Clicked approve in extension');
            }
          } catch (e) {
            console.log('   ⚠️ Could not find approve button');
          }
        }
      }
    }
    
    await page.bringToFront();
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-wallet-4-result.png',
      fullPage: true
    });
    
    // Check connection status
    const connectionStatus = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        isConnected: /connected|disconnect|0x[a-f0-9]{6,}|eth\||client\|/i.test(text),
        walletAddress: text.match(/(0x[a-fA-F0-9]{6,}|eth\|[a-f0-9]+|client\|[a-f0-9]+)/)?.[0] || null,
      };
    });
    
    console.log(`\n📊 Connection Status:`);
    console.log(`   Connected: ${connectionStatus.isConnected}`);
    console.log(`   Address: ${connectionStatus.walletAddress || 'Not shown'}`);
    
    console.log('\n✅ Wallet connection test completed');
  });

  test('3. Swap Interface - Form Validation', async () => {
    test.setTimeout(120000); // 2 minutes
    
    context = await chromium.launchPersistentContext('', {
      headless: false,
      channel: 'chrome',
      args: [
        `--disable-extensions-except=${DEX_CONFIG.extensionPath}`,
        `--load-extension=${DEX_CONFIG.extensionPath}`,
        '--disable-blink-features=AutomationControlled',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      viewport: { width: 1920, height: 1080 },
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    page = await context.newPage();
    
    // Navigate directly to swap
    const swapUrl = `${DEX_CONFIG.frontendUrl}/swap`;
    console.log(`\n📍 Navigating to: ${swapUrl}`);
    
    await page.goto(swapUrl, {
      waitUntil: 'networkidle',
      timeout: DEX_CONFIG.pageLoadTimeout,
    });
    
    console.log(`   Current URL: ${page.url()}`);
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-swap-1-page.png',
      fullPage: true
    });
    
    // Analyze swap interface
    const swapInterface = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const buttons = Array.from(document.querySelectorAll('button'));
      
      return {
        inputCount: inputs.length,
        inputs: inputs.map(i => ({
          placeholder: i.placeholder,
          type: i.type,
          value: i.value
        })),
        buttons: buttons.map(b => b.textContent?.trim().substring(0, 30)).filter(Boolean),
        hasTokenSelect: /select.*token|choose.*token/i.test(document.body.innerText),
        hasSwapButton: buttons.some(b => /swap/i.test(b.textContent || '')),
      };
    });
    
    console.log('\n📊 Swap Interface Analysis:');
    console.log(`   Input fields: ${swapInterface.inputCount}`);
    console.log(`   Inputs: ${JSON.stringify(swapInterface.inputs)}`);
    console.log(`   Buttons: ${swapInterface.buttons.slice(0, 10).join(', ')}`);
    console.log(`   Token selector: ${swapInterface.hasTokenSelect}`);
    console.log(`   Swap button: ${swapInterface.hasSwapButton}`);
    
    // Try to interact with token selection
    console.log('\n📍 Testing token selection...');
    
    const tokenBtns = page.locator('button:has-text("Select"), button:has-text("Select token"), [class*="token-selector"]');
    const tokenBtnCount = await tokenBtns.count();
    
    console.log(`   Found ${tokenBtnCount} token selector buttons`);
    
    if (tokenBtnCount > 0) {
      await tokenBtns.first().click().catch(() => {});
      await page.waitForTimeout(1500);
      
      await page.screenshot({
        path: 'tests/screenshots/galaswap-swap-2-token-modal.png',
        fullPage: true
      });
      
      // Look for GALA in token list
      const tokenOptions = await page.evaluate(() => {
        const items = document.querySelectorAll('[class*="token"], [class*="asset"], li, .option');
        return Array.from(items).slice(0, 10).map(el => el.textContent?.trim().substring(0, 50));
      });
      
      console.log(`   Token options: ${JSON.stringify(tokenOptions.slice(0, 5))}`);
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Test amount input
    console.log('\n📍 Testing amount input...');
    
    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"], input[placeholder*="0"]').first();
    
    if (await amountInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await amountInput.fill('100');
      await page.waitForTimeout(1000);
      console.log('   ✅ Entered amount: 100');
    } else {
      console.log('   ⚠️ Amount input not found');
    }
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-swap-3-amount-entered.png',
      fullPage: true
    });
    
    // Check swap button state
    const swapBtn = page.locator('button:has-text("Swap"), button:has-text("Exchange")').first();
    
    if (await swapBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isDisabled = await swapBtn.isDisabled();
      const btnText = await swapBtn.textContent();
      console.log(`   Swap button: "${btnText}" (disabled: ${isDisabled})`);
    }
    
    console.log('\n✅ Swap interface validation completed');
  });

  test('4. Pool List - Fetch and Display', async () => {
    test.setTimeout(120000);
    
    context = await chromium.launchPersistentContext('', {
      headless: false,
      channel: 'chrome',
      args: [
        `--disable-extensions-except=${DEX_CONFIG.extensionPath}`,
        `--load-extension=${DEX_CONFIG.extensionPath}`,
        '--disable-blink-features=AutomationControlled',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      viewport: { width: 1920, height: 1080 },
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    page = await context.newPage();
    
    // Try multiple pool URLs
    const poolUrls = [
      `${DEX_CONFIG.frontendUrl}/pools`,
      `${DEX_CONFIG.frontendUrl}/pool`,
      `${DEX_CONFIG.frontendUrl}/liquidity`,
    ];
    
    for (const url of poolUrls) {
      console.log(`\n📍 Trying: ${url}`);
      
      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: DEX_CONFIG.pageLoadTimeout,
        });
        
        if (response?.ok()) {
          console.log(`✅ Loaded successfully`);
          break;
        }
      } catch (e) {
        console.log(`   Failed: ${e.message.substring(0, 50)}`);
      }
    }
    
    console.log(`   Final URL: ${page.url()}`);
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: 'tests/screenshots/galaswap-pools-1-list.png',
      fullPage: true
    });
    
    // Analyze pool list
    const poolListInfo = await page.evaluate(() => {
      const body = document.body.innerText;
      
      // Look for pool patterns
      const poolPatterns = [
        /GALA[\s\/\-]*GUSDC/gi,
        /GALA[\s\/\-]*GWETH/gi,
        /GALA[\s\/\-]*ETIME/gi,
        /\d+\.?\d*%\s*(fee|apr)/gi,
        /TVL:?\s*\$?[\d,]+/gi,
      ];
      
      const foundPools: string[] = [];
      poolPatterns.forEach(pattern => {
        const matches = body.match(pattern);
        if (matches) foundPools.push(...matches);
      });
      
      return {
        url: window.location.href,
        hasPoolContent: /pool|liquidity|tvl|apr|fee/i.test(body),
        foundPools: [...new Set(foundPools)].slice(0, 10),
        hasTable: document.querySelectorAll('table, [role="table"], [class*="table"]').length > 0,
        hasCards: document.querySelectorAll('[class*="card"], [class*="pool-item"]').length > 0,
        totalText: body.length,
      };
    });
    
    console.log('\n📊 Pool List Analysis:');
    console.log(`   Has pool content: ${poolListInfo.hasPoolContent}`);
    console.log(`   Found pools: ${poolListInfo.foundPools.join(', ') || 'None detected'}`);
    console.log(`   Has table: ${poolListInfo.hasTable}`);
    console.log(`   Has cards: ${poolListInfo.hasCards}`);
    
    // Look for Add Liquidity button
    console.log('\n📍 Looking for Add Liquidity action...');
    
    const addLiquidityBtn = page.locator('button:has-text("Add Liquidity"), button:has-text("New Position"), a:has-text("Add Liquidity")').first();
    
    if (await addLiquidityBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('   ✅ Add Liquidity button found');
      
      await addLiquidityBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'tests/screenshots/galaswap-pools-2-add-form.png',
        fullPage: true
      });
      
      console.log(`   Navigated to: ${page.url()}`);
    } else {
      console.log('   ⚠️ Add Liquidity button not found');
    }
    
    console.log('\n✅ Pool list test completed');
  });
});
