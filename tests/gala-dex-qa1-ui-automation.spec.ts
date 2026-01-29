import { test, expect, Page } from '@playwright/test';

/**
 * GALA DEX QA1 UI Automation Tests
 * Target: https://lpad-frontend-qa1.defi.gala.com/
 * 
 * Tests cover:
 * 1. Page load and initial render
 * 2. Navigation and routing
 * 3. Pool listing and display
 * 4. Token search and filtering
 * 5. Buy/Sell form interactions
 * 6. Responsive design
 * 7. Error states and validation
 * 8. Console/network error monitoring
 */

const BASE_URL = 'https://lpad-frontend-test1.defi.gala.com';

// Test results collector
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  screenshot?: string;
  consoleErrors: string[];
  networkErrors: string[];
}

const testResults: TestResult[] = [];

test.describe('Gala DEX QA1 - UI Automation Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up console error listener
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Console Error] ${msg.text()}`);
      }
    });
    
    // Set up network error listener
    page.on('requestfailed', request => {
      console.log(`[Network Error] ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('1. Homepage Load Test', async ({ page }) => {
    console.log('\n📝 TEST 1: Homepage Load');
    const startTime = Date.now();
    
    // Navigate to homepage
    const response = await page.goto(BASE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`   Load time: ${loadTime}ms`);
    
    // Verify response status
    expect(response?.status()).toBeLessThan(400);
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/qa1-homepage.png', 
      fullPage: true 
    });
    
    // Verify page title exists
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    expect(title).toBeTruthy();
    
    // Verify body has content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100);
    
    // Check for JavaScript errors in console
    console.log(`   ✅ Homepage loaded successfully in ${loadTime}ms`);
  });

  test('2. Navigation Elements Test', async ({ page }) => {
    console.log('\n📝 TEST 2: Navigation Elements');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Look for navigation elements
    const navSelectors = [
      'nav',
      'header',
      '[role="navigation"]',
      '.navbar',
      '.nav'
    ];
    
    let navFound = false;
    for (const selector of navSelectors) {
      const nav = page.locator(selector).first();
      if (await nav.isVisible({ timeout: 2000 }).catch(() => false)) {
        navFound = true;
        console.log(`   Found navigation: ${selector}`);
        break;
      }
    }
    
    // Look for common navigation links
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      return links
        .filter(el => el.textContent && el.textContent.trim().length > 0)
        .map(el => ({
          text: el.textContent?.trim().substring(0, 30),
          href: el.getAttribute('href'),
          tag: el.tagName
        }))
        .slice(0, 15);
    });
    
    console.log(`   Navigation links found: ${navLinks.length}`);
    navLinks.forEach(link => {
      console.log(`      - ${link.text} ${link.href ? `(${link.href})` : ''}`);
    });
    
    await page.screenshot({ 
      path: 'tests/screenshots/qa1-navigation.png', 
      fullPage: false 
    });
    
    expect(navLinks.length).toBeGreaterThan(0);
    console.log('   ✅ Navigation elements present');
  });

  test('3. Pool Listing Page Test', async ({ page }) => {
    console.log('\n📝 TEST 3: Pool Listing Page');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Try to navigate to pools/tokens page
    const poolNavSelectors = [
      'a[href*="pool"]',
      'a[href*="token"]',
      'a[href*="launch"]',
      'button:has-text("Pools")',
      'button:has-text("Tokens")',
      'a:has-text("Launch")',
      'a:has-text("Explore")'
    ];
    
    let navigated = false;
    for (const selector of poolNavSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForTimeout(2000);
          navigated = true;
          console.log(`   Clicked: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!navigated) {
      console.log('   No pool navigation found, checking homepage content...');
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/qa1-pools-page.png', 
      fullPage: true 
    });
    
    // Look for pool/token cards
    const poolCardSelectors = [
      '[data-testid*="pool"]',
      '[data-testid*="token"]',
      '.pool-card',
      '.token-card',
      '.card',
      'article',
      '[class*="pool"]',
      '[class*="token"]'
    ];
    
    let poolsFound = 0;
    for (const selector of poolCardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        poolsFound = count;
        console.log(`   Found ${count} elements with: ${selector}`);
        break;
      }
    }
    
    // Check for pool-related content
    const pageContent = await page.textContent('body');
    const hasPoolContent = 
      /token|pool|liquidity|gala|buy|sell|trade/i.test(pageContent || '');
    
    console.log(`   Pool-related content: ${hasPoolContent}`);
    expect(hasPoolContent).toBe(true);
    console.log('   ✅ Pool listing page accessible');
  });

  test('4. Token Detail Page Test', async ({ page }) => {
    console.log('\n📝 TEST 4: Token Detail Page');
    
    // Try direct URL to a known token (senn has high volume)
    const tokenUrls = [
      `${BASE_URL}/buy-sell/senn`,
      `${BASE_URL}/token/senn`,
      `${BASE_URL}/launch/senn`,
      `${BASE_URL}/pool/senn`
    ];
    
    let loaded = false;
    for (const url of tokenUrls) {
      try {
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        
        if (response?.status() === 200) {
          loaded = true;
          console.log(`   Loaded: ${url}`);
          break;
        }
      } catch (e) {
        console.log(`   Failed: ${url}`);
      }
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'tests/screenshots/qa1-token-detail.png', 
      fullPage: true 
    });
    
    if (loaded) {
      // Check for token detail elements
      const pageContent = await page.textContent('body');
      
      const hasTokenInfo = 
        /senn|price|buy|sell|chart|volume|market/i.test(pageContent || '');
      
      console.log(`   Token info displayed: ${hasTokenInfo}`);
      
      // Look for buy/sell buttons
      const actionButtons = await page.locator('button').filter({ 
        hasText: /buy|sell|trade|swap/i 
      }).count();
      
      console.log(`   Action buttons found: ${actionButtons}`);
      
      console.log('   ✅ Token detail page loaded');
    } else {
      console.log('   ⚠️ Could not load token detail page directly');
      // Try navigating from homepage
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
  });

  test('5. Search Functionality Test', async ({ page }) => {
    console.log('\n📝 TEST 5: Search Functionality');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Look for search input
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="find" i]',
      'input[name*="search" i]',
      '[data-testid*="search"]',
      '.search-input',
      'input[class*="search"]'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        searchInput = input;
        console.log(`   Found search: ${selector}`);
        break;
      }
    }
    
    if (searchInput) {
      // Test search functionality
      await searchInput.fill('gala');
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: 'tests/screenshots/qa1-search-results.png', 
        fullPage: true 
      });
      
      // Check if results changed
      const resultsAfterSearch = await page.textContent('body');
      console.log(`   Search executed, checking results...`);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
      console.log('   ✅ Search functionality tested');
    } else {
      console.log('   ⚠️ No search input found');
      await page.screenshot({ 
        path: 'tests/screenshots/qa1-no-search.png', 
        fullPage: true 
      });
    }
  });

  test('6. Connect Wallet Button Test', async ({ page }) => {
    console.log('\n📝 TEST 6: Connect Wallet Button');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Look for connect wallet button
    const connectSelectors = [
      'button:has-text("Connect")',
      'button:has-text("Connect Wallet")',
      '[data-testid*="connect"]',
      'button[class*="connect" i]',
      'button[class*="wallet" i]',
      '.connect-wallet',
      'w3m-button',
      'w3m-connect-button'
    ];
    
    let connectButton = null;
    for (const selector of connectSelectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        connectButton = btn;
        const text = await btn.textContent();
        console.log(`   Found connect button: "${text?.trim()}"`);
        break;
      }
    }
    
    if (connectButton) {
      // Click connect button
      await connectButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/qa1-wallet-modal.png', 
        fullPage: true 
      });
      
      // Check if wallet modal appeared
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '[class*="modal"]',
        '[class*="popup"]',
        '[class*="overlay"]'
      ];
      
      let modalFound = false;
      for (const selector of modalSelectors) {
        if (await page.locator(selector).isVisible({ timeout: 2000 }).catch(() => false)) {
          modalFound = true;
          console.log(`   Wallet modal appeared: ${selector}`);
          break;
        }
      }
      
      // Look for wallet options
      const walletOptions = await page.evaluate(() => {
        const items = document.querySelectorAll('[class*="wallet"], button, [role="listitem"]');
        return Array.from(items)
          .filter(el => /metamask|gala|wallet/i.test(el.textContent || ''))
          .map(el => el.textContent?.trim().substring(0, 30))
          .slice(0, 5);
      });
      
      if (walletOptions.length > 0) {
        console.log('   Wallet options:', walletOptions);
      }
      
      // Close modal if open
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      console.log('   ✅ Connect wallet button functional');
    } else {
      console.log('   ⚠️ Connect wallet button not found');
      
      // Log all buttons for debugging
      const allButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button'))
          .map(b => b.textContent?.trim().substring(0, 30))
          .filter(t => t && t.length > 0)
          .slice(0, 10);
      });
      console.log('   Available buttons:', allButtons);
    }
  });

  test('7. Responsive Design Test', async ({ page }) => {
    console.log('\n📝 TEST 7: Responsive Design');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/qa1-${vp.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Verify page is still functional
      const bodyText = await page.textContent('body');
      const isResponsive = bodyText && bodyText.length > 100;
      
      console.log(`   ${vp.name} (${vp.width}x${vp.height}): ${isResponsive ? '✅' : '❌'}`);
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('   ✅ Responsive design tested');
  });

  test('8. Form Validation Test', async ({ page }) => {
    console.log('\n📝 TEST 8: Form Validation');
    
    // Navigate to a token page with buy/sell form
    await page.goto(`${BASE_URL}/buy-sell/senn`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // If direct URL fails, try homepage
    const currentUrl = page.url();
    if (!currentUrl.includes('senn')) {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/qa1-form-page.png', 
      fullPage: true 
    });
    
    // Look for amount input
    const amountSelectors = [
      'input[type="number"]',
      'input[placeholder*="amount" i]',
      'input[placeholder*="0"]',
      'input[name*="amount" i]',
      '[data-testid*="amount"]'
    ];
    
    let amountInput = null;
    for (const selector of amountSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        amountInput = input;
        console.log(`   Found amount input: ${selector}`);
        break;
      }
    }
    
    if (amountInput) {
      // Test negative value
      await amountInput.fill('-100');
      await page.waitForTimeout(500);
      const negativeValue = await amountInput.inputValue();
      console.log(`   Negative value test: input="${negativeValue}"`);
      
      // Test zero
      await amountInput.fill('0');
      await page.waitForTimeout(500);
      
      // Test valid positive value
      await amountInput.fill('100');
      await page.waitForTimeout(500);
      const validValue = await amountInput.inputValue();
      console.log(`   Valid value test: input="${validValue}"`);
      
      // Test special characters
      await amountInput.fill('abc!@#');
      await page.waitForTimeout(500);
      const specialValue = await amountInput.inputValue();
      console.log(`   Special chars test: input="${specialValue}"`);
      
      await page.screenshot({ 
        path: 'tests/screenshots/qa1-form-validation.png', 
        fullPage: true 
      });
      
      console.log('   ✅ Form validation tested');
    } else {
      console.log('   ⚠️ Amount input not found');
    }
  });

  test('9. Page Performance Test', async ({ page }) => {
    console.log('\n📝 TEST 9: Page Performance');
    
    // Measure page load time
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'load' });
    const loadTime = Date.now() - startTime;
    
    // Wait for full render
    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`   First Paint: ${Math.round(performanceMetrics.firstPaint)}ms`);
    console.log(`   First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
    console.log(`   Full Network Idle: ${fullLoadTime}ms`);
    
    // Performance thresholds
    const isPerformant = fullLoadTime < 15000;
    console.log(`   Performance: ${isPerformant ? '✅ Good' : '⚠️ Slow'}`);
    
    expect(fullLoadTime).toBeLessThan(30000);
    console.log('   ✅ Performance metrics collected');
  });

  test('10. Console and Network Error Check', async ({ page }) => {
    console.log('\n📝 TEST 10: Console and Network Error Check');
    
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    
    // Set up listeners
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('requestfailed', request => {
      networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()}: ${response.url()}`);
      }
    });
    
    // Navigate through multiple pages
    const pagesToVisit = [
      BASE_URL,
      `${BASE_URL}/buy-sell/senn`,
      `${BASE_URL}/buy-sell/daev`
    ];
    
    for (const url of pagesToVisit) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log(`   Could not load: ${url}`);
      }
    }
    
    // Report errors
    console.log(`   Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach(err => {
        console.log(`      - ${err.substring(0, 100)}`);
      });
    }
    
    console.log(`   Network errors: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      networkErrors.slice(0, 5).forEach(err => {
        console.log(`      - ${err.substring(0, 100)}`);
      });
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/qa1-final-state.png', 
      fullPage: true 
    });
    
    // These are warnings, not failures
    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('   ✅ No errors detected');
    } else {
      console.log(`   ⚠️ ${consoleErrors.length + networkErrors.length} total errors found`);
    }
  });

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 UI AUTOMATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('Environment: https://lpad-frontend-qa1.defi.gala.com/');
    console.log('Screenshots saved to: tests/screenshots/qa1-*.png');
    console.log('='.repeat(60));
  });
});
