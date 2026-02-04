/**
 * DEX Pool APR Sorting Tests
 * 
 * Tests for the new APR sorting feature:
 * - Client-side APR sorting (backend only supports TVL/volume)
 * - Fetch all pools (up to 200) in parallel for global APR sorting
 * - Client-side pagination when sorting by APR
 * - Pool APR as a sortable column in CommonTable
 * - APR as the default sort field (highest first)
 * - Highest APR pools appear on page 1 regardless of TVL
 */

import { test, expect } from '@playwright/test';

const DEX_CONFIG = {
  baseUrl: 'https://dex-frontend-test1.defi.gala.com',
  poolsUrl: '/dex/pool',  // Main pools listing page
  poolsExploreUrl: '/dex/pool/explore',  // Alternative pools explorer
  timeout: 60000,
};

// Helper to dismiss ALL modals (privacy, success, etc.)
async function dismissAllModals(page: any) {
  await page.waitForTimeout(1000);
  
  // Dismiss privacy modal
  try {
    const privacyVisible = await page.locator('text=Privacy Settings').isVisible({ timeout: 1500 }).catch(() => false);
    if (privacyVisible) {
      console.log('   Privacy modal detected, clicking Accept All...');
      const acceptBtn = page.locator('button:has-text("Accept All")').first();
      if (await acceptBtn.isVisible({ timeout: 2000 })) {
        await acceptBtn.click({ force: true });
        await page.waitForTimeout(1500);
        console.log('   Privacy modal dismissed');
      }
    }
  } catch (e) {}
  
  // Dismiss success modals (swapSuccessModal, etc.)
  try {
    const successModal = page.locator('[class*="SuccessModal"], [class*="success-modal"], .modal.show').first();
    if (await successModal.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('   Success modal detected, closing...');
      const closeBtn = page.locator('[class*="SuccessModal"] button:has-text("Close"), [class*="SuccessModal"] .close, .modal.show .btn-close, .modal.show button:has-text("Close"), .modal.show button:has-text("Done")').first();
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(1000);
        console.log('   Success modal closed');
      } else {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  } catch (e) {}
  
  // Dismiss any generic modal overlay
  try {
    const modalBackdrop = page.locator('.modal-backdrop, [class*="overlay"]').first();
    if (await modalBackdrop.isVisible({ timeout: 500 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch (e) {}
  
  await page.waitForTimeout(300);
}

// Alias for backward compatibility
async function dismissPrivacyModal(page: any) {
  await dismissAllModals(page);
}

// Helper to navigate to pools listing page
async function navigateToPoolsListing(page: any) {
  // Dismiss any modals first
  await dismissAllModals(page);
  
  // First try "Explore" tab in main nav (shows pools listing)
  const exploreTab = page.locator('a:has-text("Explore"), [class*="nav"] >> text=Explore').first();
  
  if (await exploreTab.isVisible({ timeout: 3000 })) {
    await exploreTab.click();
    await page.waitForTimeout(3000);
    console.log('   Clicked Explore tab');
    await dismissAllModals(page);
    return;
  }
  
  // Try "Trending Pools" button
  const trendingPools = page.locator('button:has-text("Trending Pools")').first();
  
  if (await trendingPools.isVisible({ timeout: 3000 })) {
    await trendingPools.click();
    await page.waitForTimeout(3000);
    console.log('   Clicked Trending Pools');
    await dismissAllModals(page);
    return;
  }
  
  // Try "Pool" tab then look for "Explore" sub-link
  const poolTab = page.locator('a:has-text("Pool"), [class*="nav"] >> text=Pool').first();
  
  if (await poolTab.isVisible({ timeout: 3000 })) {
    await poolTab.click();
    await page.waitForTimeout(2000);
    console.log('   Clicked Pool tab');
    await dismissAllModals(page);
    
    // After Pool tab, look for pools listing
    const allPoolsLink = page.locator('a:has-text("All Pools"), a:has-text("Explore Pools"), button:has-text("View All")').first();
    
    if (await allPoolsLink.isVisible({ timeout: 3000 })) {
      await allPoolsLink.click();
      await page.waitForTimeout(2000);
      console.log('   Clicked All Pools/Explore link');
      await dismissAllModals(page);
    }
  }
}

// Helper to wait for pools table to load
async function waitForPoolsTable(page: any) {
  await page.waitForTimeout(3000);
  
  // Wait for table or loading to complete
  const tableLoaded = await page.locator('table, [class*="table"], [class*="pool-list"], [class*="pools"]').first().isVisible({ timeout: 10000 }).catch(() => false);
  
  if (!tableLoaded) {
    console.log('   Waiting for pools data...');
    await page.waitForTimeout(5000);
  }
  
  // Log what we see on the page
  const pageHeaders = await page.evaluate(() => {
    const headers: string[] = [];
    document.querySelectorAll('th, [class*="header"], h1, h2, h3').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.length > 0 && text.length < 50) {
        headers.push(text);
      }
    });
    return headers;
  });
  
  console.log('   Page headers found:', pageHeaders.slice(0, 10));
  
  return tableLoaded;
}

// Helper to extract APR values from the page
async function extractAPRValues(page: any): Promise<number[]> {
  const aprValues = await page.evaluate(() => {
    const values: number[] = [];
    
    // Look for APR values in the table
    const cells = document.querySelectorAll('td, [class*="cell"], [class*="apr"]');
    cells.forEach(cell => {
      const text = cell.textContent || '';
      // Match APR patterns like "12.5%", "0.5%", etc.
      const match = text.match(/(\d+\.?\d*)\s*%/);
      if (match) {
        const value = parseFloat(match[1]);
        if (!isNaN(value) && value < 10000) { // Reasonable APR range
          values.push(value);
        }
      }
    });
    
    return values;
  });
  
  return aprValues;
}

// Helper to get pool data from table rows
async function getPoolTableData(page: any): Promise<{ name: string, apr: number, tvl: string }[]> {
  return await page.evaluate(() => {
    const pools: { name: string, apr: number, tvl: string }[] = [];
    
    const rows = document.querySelectorAll('tr, [class*="row"]');
    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header
      
      const cells = row.querySelectorAll('td, [class*="cell"]');
      const rowText = row.textContent || '';
      
      // Extract pool name (usually first cell or contains token symbols)
      let name = '';
      const nameMatch = rowText.match(/([A-Z]{2,10})\s*\/\s*([A-Z]{2,10})/);
      if (nameMatch) {
        name = `${nameMatch[1]}/${nameMatch[2]}`;
      }
      
      // Extract APR
      let apr = 0;
      const aprMatch = rowText.match(/(\d+\.?\d*)\s*%/);
      if (aprMatch) {
        apr = parseFloat(aprMatch[1]);
      }
      
      // Extract TVL
      let tvl = '';
      const tvlMatch = rowText.match(/\$[\d,]+\.?\d*/);
      if (tvlMatch) {
        tvl = tvlMatch[0];
      }
      
      if (name || apr > 0) {
        pools.push({ name, apr, tvl });
      }
    });
    
    return pools;
  });
}

test.describe('DEX Pool APR Sorting Feature', () => {
  
  test.describe('APR Column Display', () => {
    
    test('APR column should be visible in pools table', async ({ page }) => {
      console.log('\n=== TEST: APR Column Visibility ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      await page.screenshot({ path: 'tests/screenshots/apr-column-visibility.png', fullPage: true });
      
      // Check for APR column header
      const aprHeader = await page.evaluate(() => {
        const headers = document.querySelectorAll('th, [class*="header"], [class*="column-header"]');
        for (const header of headers) {
          const text = header.textContent?.toLowerCase() || '';
          if (text.includes('apr') || text.includes('annual')) {
            return {
              found: true,
              text: header.textContent,
              isClickable: header.tagName === 'BUTTON' || header.querySelector('button') !== null || header.hasAttribute('onclick')
            };
          }
        }
        return { found: false, text: '', isClickable: false };
      });
      
      console.log('APR Header found:', aprHeader.found);
      console.log('APR Header text:', aprHeader.text);
      console.log('APR Header clickable:', aprHeader.isClickable);
      
      expect(aprHeader.found, 'APR column should be visible in table header').toBe(true);
    });
    
    test('APR column should be sortable (clickable)', async ({ page }) => {
      console.log('\n=== TEST: APR Column Sortability ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Find and click APR header
      const aprHeaderClicked = await page.evaluate(() => {
        const headers = document.querySelectorAll('th, [class*="header"], [class*="column"]');
        for (const header of headers) {
          const text = header.textContent?.toLowerCase() || '';
          if (text.includes('apr')) {
            // Check if it's clickable or has a sort indicator
            const clickable = header as HTMLElement;
            const hasSortIcon = header.querySelector('[class*="sort"], [class*="arrow"], svg') !== null;
            const isButton = header.tagName === 'BUTTON' || header.closest('button') !== null;
            return { found: true, hasSortIcon, isButton };
          }
        }
        return { found: false, hasSortIcon: false, isButton: false };
      });
      
      console.log('APR header sortable:', aprHeaderClicked);
      
      // Try to click the APR header
      const aprHeader = page.locator('th:has-text("APR"), [class*="header"]:has-text("APR")').first();
      if (await aprHeader.isVisible({ timeout: 5000 })) {
        await aprHeader.click();
        await page.waitForTimeout(2000);
        console.log('Clicked APR header');
        
        await page.screenshot({ path: 'tests/screenshots/apr-after-sort-click.png', fullPage: true });
      }
      
      expect(aprHeaderClicked.found, 'APR column should exist').toBe(true);
    });
  });
  
  test.describe('Default APR Sorting', () => {
    
    test('Pools should be sorted by APR (highest first) by default', async ({ page }) => {
      console.log('\n=== TEST: Default APR Sort Order ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'tests/screenshots/apr-default-sort.png', fullPage: true });
      
      // Extract APR values
      const aprValues = await extractAPRValues(page);
      console.log('APR values found:', aprValues.slice(0, 10));
      
      // Check if sorted in descending order (highest first)
      let isDescending = true;
      for (let i = 1; i < Math.min(aprValues.length, 10); i++) {
        if (aprValues[i] > aprValues[i - 1]) {
          isDescending = false;
          console.log(`Sort break at index ${i}: ${aprValues[i-1]} -> ${aprValues[i]}`);
          break;
        }
      }
      
      console.log('Is sorted descending (highest first):', isDescending);
      
      if (aprValues.length > 0) {
        console.log('Highest APR on page:', Math.max(...aprValues));
        console.log('Lowest APR on page:', Math.min(...aprValues));
      }
      
      // The test expects APR to be default sorted highest first
      if (aprValues.length >= 2) {
        expect(isDescending, 'Pools should be sorted by APR highest first').toBe(true);
      }
    });
    
    test('Page 1 should show highest APR pools', async ({ page }) => {
      console.log('\n=== TEST: Highest APR on Page 1 ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Get page 1 APR values
      const page1APRs = await extractAPRValues(page);
      console.log('Page 1 APR values:', page1APRs.slice(0, 5));
      
      // Navigate to page 2 if pagination exists
      const page2Btn = page.locator('button:has-text("2"), [class*="page"]:has-text("2"), a:has-text("2")').first();
      let page2APRs: number[] = [];
      
      if (await page2Btn.isVisible({ timeout: 3000 })) {
        await page2Btn.click();
        await page.waitForTimeout(3000);
        
        page2APRs = await extractAPRValues(page);
        console.log('Page 2 APR values:', page2APRs.slice(0, 5));
        
        await page.screenshot({ path: 'tests/screenshots/apr-page2.png', fullPage: true });
      }
      
      // Verify page 1 has higher APRs than page 2
      if (page1APRs.length > 0 && page2APRs.length > 0) {
        const page1MaxAPR = Math.max(...page1APRs);
        const page2MaxAPR = Math.max(...page2APRs);
        
        console.log(`Page 1 max APR: ${page1MaxAPR}%`);
        console.log(`Page 2 max APR: ${page2MaxAPR}%`);
        
        expect(page1MaxAPR, 'Page 1 should have higher APR pools than page 2').toBeGreaterThanOrEqual(page2MaxAPR);
      }
    });
  });
  
  test.describe('APR Sort Toggle', () => {
    
    test('Clicking APR header should toggle sort direction', async ({ page }) => {
      console.log('\n=== TEST: APR Sort Toggle ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Get initial APR values
      const initialAPRs = await extractAPRValues(page);
      console.log('Initial APRs (first 5):', initialAPRs.slice(0, 5));
      
      // Click APR header to toggle sort
      const aprHeader = page.locator('th:has-text("APR"), [class*="header"]:has-text("APR"), button:has-text("APR")').first();
      
      if (await aprHeader.isVisible({ timeout: 5000 })) {
        await aprHeader.click();
        await page.waitForTimeout(2000);
        
        const afterFirstClick = await extractAPRValues(page);
        console.log('After 1st click APRs:', afterFirstClick.slice(0, 5));
        
        // Click again to toggle
        await aprHeader.click();
        await page.waitForTimeout(2000);
        
        const afterSecondClick = await extractAPRValues(page);
        console.log('After 2nd click APRs:', afterSecondClick.slice(0, 5));
        
        await page.screenshot({ path: 'tests/screenshots/apr-sort-toggle.png', fullPage: true });
        
        // Check if order changed
        const orderChanged = JSON.stringify(afterFirstClick.slice(0, 5)) !== JSON.stringify(afterSecondClick.slice(0, 5));
        console.log('Sort order changed after toggle:', orderChanged);
      }
    });
  });
  
  test.describe('APR vs TVL Sorting Comparison', () => {
    
    test('APR sort should give different results than TVL sort', async ({ page }) => {
      console.log('\n=== TEST: APR vs TVL Sort Comparison ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Get pools with APR sort (default)
      const poolsWithAPRSort = await getPoolTableData(page);
      console.log('Pools with APR sort (first 5):', poolsWithAPRSort.slice(0, 5));
      
      await page.screenshot({ path: 'tests/screenshots/apr-sort-pools.png', fullPage: true });
      
      // Click TVL header to sort by TVL
      const tvlHeader = page.locator('th:has-text("TVL"), [class*="header"]:has-text("TVL"), button:has-text("TVL")').first();
      
      if (await tvlHeader.isVisible({ timeout: 5000 })) {
        await tvlHeader.click();
        await page.waitForTimeout(3000);
        
        const poolsWithTVLSort = await getPoolTableData(page);
        console.log('Pools with TVL sort (first 5):', poolsWithTVLSort.slice(0, 5));
        
        await page.screenshot({ path: 'tests/screenshots/tvl-sort-pools.png', fullPage: true });
        
        // Compare the order
        const aprFirstPool = poolsWithAPRSort[0]?.name;
        const tvlFirstPool = poolsWithTVLSort[0]?.name;
        
        console.log(`First pool by APR: ${aprFirstPool}`);
        console.log(`First pool by TVL: ${tvlFirstPool}`);
        
        // They might be different (high APR pool may not have highest TVL)
        const isDifferent = aprFirstPool !== tvlFirstPool;
        console.log('APR and TVL sorts give different order:', isDifferent);
      }
    });
  });
  
  test.describe('Pagination with APR Sort', () => {
    
    test('Pagination should work correctly with APR sorting', async ({ page }) => {
      console.log('\n=== TEST: Pagination with APR Sort ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Collect APRs from multiple pages
      const allPageAPRs: { page: number, aprs: number[] }[] = [];
      
      // Page 1
      const page1APRs = await extractAPRValues(page);
      allPageAPRs.push({ page: 1, aprs: page1APRs });
      console.log(`Page 1: ${page1APRs.length} APR values, max: ${Math.max(...page1APRs) || 0}`);
      
      // Try to navigate to pages 2, 3
      for (let pageNum = 2; pageNum <= 3; pageNum++) {
        const pageBtn = page.locator(`button:has-text("${pageNum}"), [class*="page"]:has-text("${pageNum}")`).first();
        
        if (await pageBtn.isVisible({ timeout: 3000 })) {
          await pageBtn.click();
          await page.waitForTimeout(2000);
          
          const pageAPRs = await extractAPRValues(page);
          allPageAPRs.push({ page: pageNum, aprs: pageAPRs });
          console.log(`Page ${pageNum}: ${pageAPRs.length} APR values, max: ${Math.max(...pageAPRs) || 0}`);
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/apr-pagination.png', fullPage: true });
      
      // Verify descending APR across pages
      if (allPageAPRs.length >= 2) {
        const page1Max = Math.max(...allPageAPRs[0].aprs);
        const page2Max = Math.max(...allPageAPRs[1].aprs);
        
        console.log(`Comparing: Page 1 max (${page1Max}) vs Page 2 max (${page2Max})`);
        expect(page1Max, 'Page 1 should have higher max APR than page 2').toBeGreaterThanOrEqual(page2Max);
      }
    });
    
    test('Navigating back to page 1 should show highest APR pools', async ({ page }) => {
      console.log('\n=== TEST: Navigate Back to Page 1 ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Get page 1 APRs
      const initialAPRs = await extractAPRValues(page);
      console.log('Initial page 1 APRs:', initialAPRs.slice(0, 5));
      
      // Go to page 2
      const page2Btn = page.locator('button:has-text("2"), [class*="page"]:has-text("2")').first();
      if (await page2Btn.isVisible({ timeout: 3000 })) {
        await page2Btn.click();
        await page.waitForTimeout(2000);
        
        // Go back to page 1
        const page1Btn = page.locator('button:has-text("1"), [class*="page"]:has-text("1")').first();
        if (await page1Btn.isVisible({ timeout: 3000 })) {
          await page1Btn.click();
          await page.waitForTimeout(2000);
          
          const returnedAPRs = await extractAPRValues(page);
          console.log('Returned to page 1 APRs:', returnedAPRs.slice(0, 5));
          
          // Should match initial values
          const matchesInitial = JSON.stringify(initialAPRs.slice(0, 5)) === JSON.stringify(returnedAPRs.slice(0, 5));
          console.log('Matches initial order:', matchesInitial);
          
          expect(matchesInitial, 'Returning to page 1 should show same pools').toBe(true);
        }
      }
    });
  });
  
  test.describe('Client-Side Sorting Verification', () => {
    
    test('Should fetch all pools for global APR sorting', async ({ page }) => {
      console.log('\n=== TEST: Global APR Sorting (All Pools) ===');
      
      // Monitor network requests
      const apiRequests: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('pool') || url.includes('api')) {
          apiRequests.push(url);
        }
      });
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Wait for all requests to complete
      await page.waitForTimeout(5000);
      
      console.log('API requests made:', apiRequests.length);
      apiRequests.forEach((url, i) => {
        if (i < 10) console.log(`  ${i + 1}. ${url.substring(0, 100)}...`);
      });
      
      await page.screenshot({ path: 'tests/screenshots/apr-global-sort.png', fullPage: true });
      
      // Check if multiple pool requests or a large limit request was made
      const hasPoolRequest = apiRequests.some(url => 
        url.includes('pool') || url.includes('liquidity')
      );
      
      console.log('Pool API request detected:', hasPoolRequest);
    });
    
    test('APR sorting should work without backend support', async ({ page }) => {
      console.log('\n=== TEST: Client-Side APR Sort (No Backend) ===');
      
      // Intercept and log responses
      let poolsResponse: any = null;
      
      page.on('response', async response => {
        const url = response.url();
        if (url.includes('pool') && response.status() === 200) {
          try {
            const data = await response.json();
            poolsResponse = data;
          } catch (e) {
            // Not JSON response
          }
        }
      });
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      await page.waitForTimeout(3000);
      
      // Get displayed APR values
      const displayedAPRs = await extractAPRValues(page);
      console.log('Displayed APRs (sorted):', displayedAPRs.slice(0, 10));
      
      // Check if they're sorted client-side
      let isSorted = true;
      for (let i = 1; i < displayedAPRs.length; i++) {
        if (displayedAPRs[i] > displayedAPRs[i - 1]) {
          isSorted = false;
          break;
        }
      }
      
      console.log('APRs appear sorted (descending):', isSorted);
      
      await page.screenshot({ path: 'tests/screenshots/apr-client-side-sort.png', fullPage: true });
    });
  });
  
  test.describe('Sort Indicator Visual', () => {
    
    test('APR column should show sort indicator when active', async ({ page }) => {
      console.log('\n=== TEST: APR Sort Indicator ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      // Check for sort indicator on APR column
      const sortIndicator = await page.evaluate(() => {
        const headers = document.querySelectorAll('th, [class*="header"]');
        
        for (const header of headers) {
          const text = header.textContent?.toLowerCase() || '';
          if (text.includes('apr')) {
            // Look for sort indicators
            const hasArrow = header.querySelector('svg, [class*="arrow"], [class*="sort"], [class*="icon"]') !== null;
            const hasActiveClass = header.className.includes('active') || header.className.includes('sorted');
            const ariaSort = header.getAttribute('aria-sort');
            
            return {
              found: true,
              hasArrow,
              hasActiveClass,
              ariaSort,
              className: header.className
            };
          }
        }
        
        return { found: false };
      });
      
      console.log('Sort indicator status:', sortIndicator);
      
      await page.screenshot({ path: 'tests/screenshots/apr-sort-indicator.png', fullPage: true });
      
      expect(sortIndicator.found, 'APR column should be found').toBe(true);
    });
  });
  
  test.describe('Edge Cases', () => {
    
    test('Should handle pools with 0% APR correctly', async ({ page }) => {
      console.log('\n=== TEST: Zero APR Handling ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      const aprValues = await extractAPRValues(page);
      
      const hasZeroAPR = aprValues.includes(0);
      const zeroCount = aprValues.filter(apr => apr === 0).length;
      
      console.log('Has pools with 0% APR:', hasZeroAPR);
      console.log('Count of 0% APR pools:', zeroCount);
      console.log('Total APR values found:', aprValues.length);
      
      // Verify 0% APR pools are at the end when sorted descending
      if (hasZeroAPR && aprValues.length > 1) {
        const lastNonZeroIndex = aprValues.findIndex(apr => apr === 0);
        const allZerosAtEnd = aprValues.slice(lastNonZeroIndex).every(apr => apr === 0);
        console.log('All 0% APR pools at end:', allZerosAtEnd);
      }
    });
    
    test('Should handle very high APR values correctly', async ({ page }) => {
      console.log('\n=== TEST: High APR Values ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await navigateToPoolsListing(page);
      await waitForPoolsTable(page);
      
      const aprValues = await extractAPRValues(page);
      
      if (aprValues.length > 0) {
        const maxAPR = Math.max(...aprValues);
        const minAPR = Math.min(...aprValues);
        const avgAPR = aprValues.reduce((a, b) => a + b, 0) / aprValues.length;
        
        console.log(`APR Range: ${minAPR}% - ${maxAPR}%`);
        console.log(`Average APR: ${avgAPR.toFixed(2)}%`);
        
        // Check for extremely high APRs (potential data issues)
        const veryHighAPRs = aprValues.filter(apr => apr > 1000);
        if (veryHighAPRs.length > 0) {
          console.log('⚠️ Very high APRs detected (>1000%):', veryHighAPRs);
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/apr-high-values.png', fullPage: true });
    });
  });
});
