/**
 * DEX Liquidity Pool Bug Detection Tests
 * 
 * These tests are designed to catch specific bugs related to:
 * - Incorrect market price calculations for certain token pairs
 * - Fee tier display issues
 * - Extreme/unrealistic calculated values
 * - Missing warning messages
 * 
 * Bug Reference: GALA/GWETH 0.05% fee tier issues
 * - Market price showing extremely small values (e.g., 8.88e-39)
 * - Low/High price becoming near-zero with long decimals
 * - Unrealistically huge GALA amounts calculated
 * - Fee tier showing "0.00% select" instead of "0.05%"
 */

import { test, expect } from '@playwright/test';

// Test configuration
const DEX_CONFIG = {
  baseUrl: 'https://dex-frontend-test1.defi.gala.com',
  addLiquidityUrl: '/dex/pool/add-liquidity',
  timeout: 60000,
  // Token pairs to test
  testPairs: [
    { token0: 'GALA', token1: 'GWETH', description: 'GALA/GWETH (bug reported)' },
    { token0: 'GALA', token1: 'GUSDC', description: 'GALA/GUSDC (baseline)' },
    { token0: 'GALA', token1: 'GWBTC', description: 'GALA/GWBTC' },
  ],
  feeTiers: ['0.05%', '0.30%', '1.00%'],
  smallAmounts: ['0.00020', '0.0001', '0.00001'],
};

// Helper to dismiss privacy modal - must wait and click with force
async function dismissPrivacyModal(page: any) {
  await page.waitForTimeout(2000);
  
  try {
    // Check for privacy settings text
    const privacyVisible = await page.locator('text=Privacy Settings').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (privacyVisible) {
      console.log('   Privacy modal detected, clicking Accept All...');
      const acceptBtn = page.locator('button:has-text("Accept All")').first();
      if (await acceptBtn.isVisible({ timeout: 3000 })) {
        await acceptBtn.click({ force: true });
        await page.waitForTimeout(2000);
        console.log('   Privacy modal dismissed');
      }
    }
  } catch (e) {
    // Modal not present
  }
  
  // Double check and dismiss any lingering modals
  await page.waitForTimeout(500);
}

// Helper to select a token from the dropdown modal
async function selectToken(page: any, tokenSymbol: string) {
  // Wait for token modal to be visible
  await page.waitForTimeout(1000);
  
  // Search for the token
  const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[type="text"]').first();
  if (await searchInput.isVisible({ timeout: 3000 })) {
    await searchInput.fill(tokenSymbol);
    await page.waitForTimeout(1000);
  }
  
  // Click the token option in the modal - be specific about finding it in the list
  // Avoid matching "Get GALA" or other buttons
  const tokenSelectors = [
    `.tokenmodal [class*="token"]:has-text("${tokenSymbol}")`,
    `[class*="modal"] [class*="row"]:has-text("${tokenSymbol}")`,
    `[class*="modal"] [class*="item"]:has-text("${tokenSymbol}")`,
    `[role="dialog"] div:has-text("${tokenSymbol}")`,
  ];
  
  for (const selector of tokenSelectors) {
    try {
      const option = page.locator(selector).first();
      if (await option.isVisible({ timeout: 2000 })) {
        await option.click({ force: true });
        await page.waitForTimeout(1000);
        console.log(`   Selected ${tokenSymbol} via ${selector}`);
        return true;
      }
    } catch (e) {
      // Try next selector
    }
  }
  
  // Fallback - press Escape to close any modal and try keyboard navigation
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  return false;
}

// Helper to check if a number is in scientific notation with extremely small exponent
function isExtremelySmallScientificNotation(value: string): boolean {
  const match = value.match(/[eE][-](\d+)/);
  if (match) {
    const exponent = parseInt(match[1]);
    return exponent > 20; // Exponent like -39 is problematic
  }
  return false;
}

// Helper to check if a value has too many decimal places
function hasTooManyDecimals(value: string, maxDecimals: number = 18): boolean {
  const decimalPart = value.split('.')[1];
  if (decimalPart) {
    // Count actual significant digits, not just length
    return decimalPart.length > maxDecimals;
  }
  return false;
}

// Helper to check if a value is unrealistically large
function isUnrealisticallyLarge(value: string, threshold: number = 1e15): boolean {
  const numValue = parseFloat(value.replace(/,/g, ''));
  return !isNaN(numValue) && numValue > threshold;
}

test.describe('DEX Liquidity Pool Bug Detection', () => {
  
  test.describe('Market Price Validation', () => {
    
    test('GALA/GWETH 0.05% fee tier should show valid market price', async ({ page }) => {
      console.log('\n=== TEST: GALA/GWETH Market Price Validation ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      
      // Select GALA as first token
      console.log('Selecting GALA...');
      const token0Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token0Dropdown.isVisible({ timeout: 5000 })) {
        await token0Dropdown.click();
        await selectToken(page, 'GALA');
      }
      
      // Select GWETH as second token
      console.log('Selecting GWETH...');
      const token1Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token1Dropdown.isVisible({ timeout: 5000 })) {
        await token1Dropdown.click();
        await selectToken(page, 'GWETH');
      }
      
      // Select 0.05% fee tier
      console.log('Selecting 0.05% fee tier...');
      const feeTier005 = page.locator('text=0.05%').first();
      if (await feeTier005.isVisible({ timeout: 5000 })) {
        await feeTier005.click();
        await page.waitForTimeout(2000);
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-gala-gweth-market-price.png', fullPage: true });
      
      // Check market price
      const marketPriceText = await page.evaluate(() => {
        const priceElements = document.querySelectorAll('[class*="price"], [class*="market"]');
        for (const el of priceElements) {
          const text = el.textContent || '';
          if (text.includes('GWETH') || text.includes('market') || text.includes('price')) {
            return text;
          }
        }
        // Also check for "Current pool price" or similar
        const allText = document.body.innerText;
        const priceMatch = allText.match(/(?:market|current|pool)\s*price[:\s]*([0-9.e\-+]+)/i);
        return priceMatch ? priceMatch[1] : allText.substring(0, 1000);
      });
      
      console.log('Market price text:', marketPriceText);
      
      // BUG CHECK: Market price should NOT be extremely small (like 8.88e-39)
      const hasExtremelySmallPrice = isExtremelySmallScientificNotation(marketPriceText);
      
      if (hasExtremelySmallPrice) {
        console.log('❌ BUG DETECTED: Market price is extremely small (scientific notation with large negative exponent)');
      } else {
        console.log('✅ Market price appears valid');
      }
      
      expect(hasExtremelySmallPrice, 'Market price should not be extremely small (e.g., 8.88e-39)').toBe(false);
    });
    
    test('Market price should be consistent across fee tiers', async ({ page }) => {
      console.log('\n=== TEST: Market Price Consistency Across Fee Tiers ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Select GALA/GWETH pair
      const token0Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token0Dropdown.isVisible({ timeout: 5000 })) {
        await token0Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GALA');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GALA').first().click();
        await page.waitForTimeout(1000);
      }
      
      const token1Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token1Dropdown.isVisible({ timeout: 5000 })) {
        await token1Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GWETH');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GWETH').first().click();
        await page.waitForTimeout(1000);
      }
      
      const marketPrices: { [tier: string]: string } = {};
      
      // Test each fee tier
      for (const tier of DEX_CONFIG.feeTiers) {
        console.log(`\nTesting ${tier} fee tier...`);
        
        const feeTierBtn = page.locator(`text=${tier}`).first();
        if (await feeTierBtn.isVisible({ timeout: 3000 })) {
          await feeTierBtn.click();
          await page.waitForTimeout(2000);
          
          // Get market price
          const priceText = await page.evaluate(() => {
            const text = document.body.innerText;
            const match = text.match(/(?:current|market)\s*(?:pool)?\s*price[:\s]*([0-9.e\-+]+)/i);
            return match ? match[1] : '';
          });
          
          marketPrices[tier] = priceText;
          console.log(`${tier}: ${priceText}`);
          
          // Check for extreme values
          if (isExtremelySmallScientificNotation(priceText)) {
            console.log(`❌ BUG: ${tier} shows extremely small market price`);
          }
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-market-price-consistency.png', fullPage: true });
      
      // Log comparison
      console.log('\nMarket Price Comparison:');
      for (const [tier, price] of Object.entries(marketPrices)) {
        console.log(`  ${tier}: ${price}`);
      }
    });
  });
  
  test.describe('Fee Tier Display Validation', () => {
    
    test('Fee tier labels should display correctly', async ({ page }) => {
      console.log('\n=== TEST: Fee Tier Label Validation ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Check all fee tier labels
      const feeTierLabels = await page.evaluate(() => {
        const labels: string[] = [];
        const buttons = document.querySelectorAll('button, [class*="fee"], [class*="tier"]');
        buttons.forEach(btn => {
          const text = btn.textContent || '';
          if (text.includes('%') || text.includes('select')) {
            labels.push(text.trim());
          }
        });
        return labels;
      });
      
      console.log('Found fee tier labels:', feeTierLabels);
      
      await page.screenshot({ path: 'tests/screenshots/bug-fee-tier-labels.png', fullPage: true });
      
      // BUG CHECK: Should NOT show "0.00% select" instead of valid percentages
      const hasBuggyLabel = feeTierLabels.some(label => 
        label.includes('0.00%') || 
        label.includes('0% select') ||
        (label.includes('select') && !label.includes('0.05') && !label.includes('0.30') && !label.includes('1.00'))
      );
      
      if (hasBuggyLabel) {
        console.log('❌ BUG DETECTED: Fee tier showing incorrect label (e.g., "0.00% select")');
        console.log('   Labels found:', feeTierLabels);
      } else {
        console.log('✅ Fee tier labels appear correct');
      }
      
      // Verify expected fee tiers are present
      const has005 = feeTierLabels.some(l => l.includes('0.05'));
      const has030 = feeTierLabels.some(l => l.includes('0.30') || l.includes('0.3%'));
      const has100 = feeTierLabels.some(l => l.includes('1.00') || l.includes('1%'));
      
      console.log(`Fee tiers present: 0.05%=${has005}, 0.30%=${has030}, 1.00%=${has100}`);
      
      expect(hasBuggyLabel, 'Fee tier should not show "0.00% select"').toBe(false);
    });
    
    test('Fee tier selection should update correctly', async ({ page }) => {
      console.log('\n=== TEST: Fee Tier Selection Update ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Select token pair first
      const token0Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token0Dropdown.isVisible({ timeout: 5000 })) {
        await token0Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GALA');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GALA').first().click();
        await page.waitForTimeout(1000);
      }
      
      const token1Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token1Dropdown.isVisible({ timeout: 5000 })) {
        await token1Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GWETH');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GWETH').first().click();
        await page.waitForTimeout(1000);
      }
      
      // Click each fee tier and verify it updates
      for (const tier of ['0.05%', '0.30%', '1.00%']) {
        console.log(`\nSelecting ${tier}...`);
        
        const tierBtn = page.locator(`text=${tier}`).first();
        if (await tierBtn.isVisible({ timeout: 3000 })) {
          await tierBtn.click();
          await page.waitForTimeout(1000);
          
          // Check if selection is reflected
          const selectedTier = await page.evaluate(() => {
            const selected = document.querySelector('[class*="selected"], [class*="active"]');
            return selected?.textContent || '';
          });
          
          console.log(`Selected tier UI: ${selectedTier}`);
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-fee-tier-selection.png', fullPage: true });
    });
  });
  
  test.describe('Price Range Validation', () => {
    
    test('Low/High price should not have excessive decimals', async ({ page }) => {
      console.log('\n=== TEST: Price Range Decimal Validation ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Select GALA/GWETH pair
      const token0Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token0Dropdown.isVisible({ timeout: 5000 })) {
        await token0Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GALA');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GALA').first().click();
        await page.waitForTimeout(1000);
      }
      
      const token1Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token1Dropdown.isVisible({ timeout: 5000 })) {
        await token1Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GWETH');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GWETH').first().click();
        await page.waitForTimeout(1000);
      }
      
      // Select 0.05% fee tier
      const feeTier005 = page.locator('text=0.05%').first();
      if (await feeTier005.isVisible({ timeout: 5000 })) {
        await feeTier005.click();
        await page.waitForTimeout(2000);
      }
      
      // Select Custom Range to see the price inputs
      const customRangeBtn = page.locator('button:has-text("Custom Range"), button:has-text("Custom")').first();
      if (await customRangeBtn.isVisible({ timeout: 3000 })) {
        await customRangeBtn.click();
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-price-range-decimals.png', fullPage: true });
      
      // Get Low and High price values
      const priceValues = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        const values: { low: string, high: string } = { low: '', high: '' };
        
        inputs.forEach((input, index) => {
          const value = (input as HTMLInputElement).value;
          const label = input.closest('div')?.textContent || '';
          
          if (label.toLowerCase().includes('low') || index === 0) {
            values.low = value;
          } else if (label.toLowerCase().includes('high') || index === 1) {
            values.high = value;
          }
        });
        
        return values;
      });
      
      console.log('Low price:', priceValues.low);
      console.log('High price:', priceValues.high);
      
      // BUG CHECK: Prices should not be near-zero or have excessive decimals
      const lowHasIssue = isExtremelySmallScientificNotation(priceValues.low) || 
                          hasTooManyDecimals(priceValues.low, 18);
      const highHasIssue = isExtremelySmallScientificNotation(priceValues.high) || 
                           hasTooManyDecimals(priceValues.high, 18);
      
      if (lowHasIssue) {
        console.log('❌ BUG DETECTED: Low price has excessive decimals or is near-zero');
      }
      if (highHasIssue) {
        console.log('❌ BUG DETECTED: High price has excessive decimals or is near-zero');
      }
      
      if (!lowHasIssue && !highHasIssue) {
        console.log('✅ Price range values appear valid');
      }
    });
  });
  
  test.describe('Deposit Amount Calculation Validation', () => {
    
    test('Small GWETH amount should not require unrealistic GALA amount', async ({ page }) => {
      console.log('\n=== TEST: Deposit Amount Calculation ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Select GALA/GWETH pair
      const token0Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token0Dropdown.isVisible({ timeout: 5000 })) {
        await token0Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GALA');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GALA').first().click();
        await page.waitForTimeout(1000);
      }
      
      const token1Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token1Dropdown.isVisible({ timeout: 5000 })) {
        await token1Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GWETH');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GWETH').first().click();
        await page.waitForTimeout(1000);
      }
      
      // Select 0.05% fee tier
      const feeTier005 = page.locator('text=0.05%').first();
      if (await feeTier005.isVisible({ timeout: 5000 })) {
        await feeTier005.click();
        await page.waitForTimeout(2000);
      }
      
      // Scroll down to deposit section
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      
      // Find and fill GWETH amount input (should be second token input)
      const amountInputs = await page.locator('input[type="number"], input[inputmode="decimal"]').all();
      console.log(`Found ${amountInputs.length} inputs`);
      
      // Enter small GWETH amount
      const smallGwethAmount = '0.00020';
      
      // Find the GWETH input (look for one near GWETH label or second deposit input)
      for (let i = 0; i < amountInputs.length; i++) {
        const input = amountInputs[i];
        const value = await input.inputValue();
        const isVisible = await input.isVisible();
        
        if (isVisible && (value === '' || value === '0')) {
          // Check if this is near GWETH label
          const nearbyText = await input.evaluate((el) => {
            const parent = el.closest('div');
            return parent?.textContent || '';
          });
          
          if (nearbyText.includes('GWETH') || i >= 2) {
            console.log(`Entering ${smallGwethAmount} GWETH in input ${i}`);
            await input.click();
            await input.fill(smallGwethAmount);
            await page.waitForTimeout(2000);
            break;
          }
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-deposit-calculation.png', fullPage: true });
      
      // Get the calculated GALA amount
      const calculatedAmounts = await page.evaluate(() => {
        const amounts: string[] = [];
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
          const val = (input as HTMLInputElement).value;
          if (val && val !== '0') {
            amounts.push(val);
          }
        });
        return amounts;
      });
      
      console.log('Calculated amounts:', calculatedAmounts);
      
      // BUG CHECK: GALA amount should not be unrealistically large
      for (const amount of calculatedAmounts) {
        if (isUnrealisticallyLarge(amount, 1e12)) {
          console.log(`❌ BUG DETECTED: Unrealistically large amount calculated: ${amount}`);
        } else if (isExtremelySmallScientificNotation(amount)) {
          console.log(`❌ BUG DETECTED: Extremely small amount in scientific notation: ${amount}`);
        }
      }
      
      // Check for error messages
      const errorMessages = await page.evaluate(() => {
        const errors: string[] = [];
        const errorElements = document.querySelectorAll('[class*="error"], [class*="warning"], [class*="message"]');
        errorElements.forEach(el => {
          const text = el.textContent || '';
          if (text.length > 0 && text.length < 200) {
            errors.push(text.trim());
          }
        });
        return errors;
      });
      
      console.log('Error/Warning messages:', errorMessages);
    });
    
    test('Various small amounts should calculate reasonable counterparts', async ({ page }) => {
      console.log('\n=== TEST: Multiple Small Amount Calculations ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Quick setup - select GALA/GWETH 0.05%
      const tokenDropdowns = await page.locator('button:has-text("Select token")').all();
      
      if (tokenDropdowns.length >= 2) {
        // Select GALA
        await tokenDropdowns[0].click();
        await page.waitForTimeout(500);
        await page.locator('text=GALA').first().click();
        await page.waitForTimeout(1000);
        
        // Select GWETH
        await page.locator('button:has-text("Select token")').first().click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GWETH');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GWETH').first().click();
        await page.waitForTimeout(1000);
      }
      
      // Select 0.05% fee tier
      await page.locator('text=0.05%').first().click();
      await page.waitForTimeout(2000);
      
      // Test different small amounts
      const testResults: { amount: string, calculated: string, issue: boolean }[] = [];
      
      for (const smallAmount of DEX_CONFIG.smallAmounts) {
        console.log(`\nTesting amount: ${smallAmount}`);
        
        // Scroll to deposit section
        await page.evaluate(() => window.scrollBy(0, 400));
        await page.waitForTimeout(500);
        
        // Find GWETH input and enter amount
        const amountInputs = await page.locator('input[inputmode="decimal"], input[type="number"]').all();
        
        if (amountInputs.length >= 4) {
          // Use index 3 which should be second token deposit
          const gwethInput = amountInputs[3];
          await gwethInput.click();
          await gwethInput.fill('');
          await gwethInput.fill(smallAmount);
          await page.waitForTimeout(2000);
          
          // Get GALA calculated amount
          const galaInput = amountInputs[2];
          const calculatedGala = await galaInput.inputValue();
          
          const hasIssue = isUnrealisticallyLarge(calculatedGala, 1e12) || 
                           isExtremelySmallScientificNotation(calculatedGala);
          
          testResults.push({
            amount: smallAmount,
            calculated: calculatedGala,
            issue: hasIssue
          });
          
          console.log(`  GWETH: ${smallAmount} → GALA: ${calculatedGala} ${hasIssue ? '❌ ISSUE' : '✅'}`);
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-multiple-amounts.png', fullPage: true });
      
      // Summary
      console.log('\n=== Results Summary ===');
      const issueCount = testResults.filter(r => r.issue).length;
      console.log(`Issues found: ${issueCount}/${testResults.length}`);
      
      if (issueCount > 0) {
        console.log('❌ BUG: Some amounts produced unrealistic calculations');
      } else {
        console.log('✅ All calculations appear reasonable');
      }
    });
  });
  
  test.describe('Warning Message Validation', () => {
    
    test('Warning should appear when switching tokens causes issues', async ({ page }) => {
      console.log('\n=== TEST: Token Switch Warning Message ===');
      
      await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
        waitUntil: 'domcontentloaded',
        timeout: DEX_CONFIG.timeout
      });
      
      await dismissPrivacyModal(page);
      await page.waitForTimeout(2000);
      
      // Select GALA first
      const token0Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token0Dropdown.isVisible({ timeout: 5000 })) {
        await token0Dropdown.click();
        await page.waitForTimeout(500);
        await page.locator('text=GALA').first().click();
        await page.waitForTimeout(1000);
      }
      
      // Select GWETH second
      const token1Dropdown = page.locator('button:has-text("Select token")').first();
      if (await token1Dropdown.isVisible({ timeout: 5000 })) {
        await token1Dropdown.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await searchInput.fill('GWETH');
          await page.waitForTimeout(500);
        }
        await page.locator('text=GWETH').first().click();
        await page.waitForTimeout(1000);
      }
      
      // Select 0.05% fee tier
      await page.locator('text=0.05%').first().click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'tests/screenshots/bug-warning-before-switch.png', fullPage: true });
      
      // Try to switch token positions (if there's a switch button)
      const switchBtn = page.locator('button:has(svg[class*="switch"]), [class*="switch"], [class*="swap-direction"]').first();
      if (await switchBtn.isVisible({ timeout: 3000 })) {
        console.log('Found token switch button, clicking...');
        await switchBtn.click();
        await page.waitForTimeout(2000);
      }
      
      await page.screenshot({ path: 'tests/screenshots/bug-warning-after-switch.png', fullPage: true });
      
      // Check for warning messages
      const warnings = await page.evaluate(() => {
        const warningSelectors = [
          '[class*="warning"]',
          '[class*="alert"]',
          '[class*="notice"]',
          '[class*="message"]',
          'text*="Warning"',
        ];
        
        const messages: string[] = [];
        
        warningSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.textContent?.trim() || '';
              if (text.length > 5 && text.length < 300) {
                messages.push(text);
              }
            });
          } catch (e) {
            // Ignore invalid selectors
          }
        });
        
        return messages;
      });
      
      console.log('Warning messages found:', warnings);
      
      // BUG CHECK: Warning should appear for 0.05% fee tier when switching tokens
      const hasWarning = warnings.length > 0;
      
      if (!hasWarning) {
        console.log('⚠️ POTENTIAL BUG: No warning message displayed when switching tokens on 0.05% fee tier');
      } else {
        console.log('✅ Warning messages present');
      }
    });
  });
  
  test.describe('Cross-Token Pair Comparison', () => {
    
    test('GALA/GWETH should behave similarly to GALA/GUSDC', async ({ page }) => {
      console.log('\n=== TEST: Cross-Pair Behavior Comparison ===');
      
      const pairResults: { pair: string, marketPrice: string, feeLabel: string, issues: string[] }[] = [];
      
      for (const pair of [
        { token0: 'GALA', token1: 'GWETH' },
        { token0: 'GALA', token1: 'GUSDC' }
      ]) {
        console.log(`\nTesting ${pair.token0}/${pair.token1}...`);
        
        await page.goto(`${DEX_CONFIG.baseUrl}${DEX_CONFIG.addLiquidityUrl}`, {
          waitUntil: 'domcontentloaded',
          timeout: DEX_CONFIG.timeout
        });
        
        await dismissPrivacyModal(page);
        await page.waitForTimeout(2000);
        
        // Select tokens
        const token0Dropdown = page.locator('button:has-text("Select token")').first();
        if (await token0Dropdown.isVisible({ timeout: 5000 })) {
          await token0Dropdown.click();
          await page.waitForTimeout(500);
          await page.locator(`text=${pair.token0}`).first().click();
          await page.waitForTimeout(1000);
        }
        
        const token1Dropdown = page.locator('button:has-text("Select token")').first();
        if (await token1Dropdown.isVisible({ timeout: 5000 })) {
          await token1Dropdown.click();
          await page.waitForTimeout(500);
          const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
          if (await searchInput.isVisible({ timeout: 2000 })) {
            await searchInput.fill(pair.token1);
            await page.waitForTimeout(500);
          }
          await page.locator(`text=${pair.token1}`).first().click();
          await page.waitForTimeout(1000);
        }
        
        // Select 0.05% fee tier
        await page.locator('text=0.05%').first().click();
        await page.waitForTimeout(2000);
        
        // Collect data
        const pageData = await page.evaluate(() => {
          const text = document.body.innerText;
          const priceMatch = text.match(/(?:market|current|pool)\s*price[:\s]*([0-9.e\-+]+)/i);
          
          // Get fee tier labels
          const feeLabels: string[] = [];
          document.querySelectorAll('button, [class*="fee"]').forEach(el => {
            const t = el.textContent || '';
            if (t.includes('%')) feeLabels.push(t.trim());
          });
          
          return {
            marketPrice: priceMatch ? priceMatch[1] : 'not found',
            feeLabels: feeLabels.join(', ')
          };
        });
        
        const issues: string[] = [];
        
        if (isExtremelySmallScientificNotation(pageData.marketPrice)) {
          issues.push('Extremely small market price');
        }
        
        if (pageData.feeLabels.includes('0.00%')) {
          issues.push('Incorrect fee label (0.00%)');
        }
        
        pairResults.push({
          pair: `${pair.token0}/${pair.token1}`,
          marketPrice: pageData.marketPrice,
          feeLabel: pageData.feeLabels,
          issues: issues
        });
        
        await page.screenshot({ 
          path: `tests/screenshots/bug-comparison-${pair.token0}-${pair.token1}.png`, 
          fullPage: true 
        });
      }
      
      // Compare results
      console.log('\n=== Comparison Results ===');
      console.log('| Pair | Market Price | Issues |');
      console.log('|------|--------------|--------|');
      
      for (const result of pairResults) {
        const issueStr = result.issues.length > 0 ? result.issues.join(', ') : 'None';
        console.log(`| ${result.pair} | ${result.marketPrice} | ${issueStr} |`);
      }
      
      // Check if GALA/GWETH has more issues than GALA/GUSDC
      const gwethResult = pairResults.find(r => r.pair === 'GALA/GWETH');
      const gusdcResult = pairResults.find(r => r.pair === 'GALA/GUSDC');
      
      if (gwethResult && gusdcResult) {
        if (gwethResult.issues.length > gusdcResult.issues.length) {
          console.log('\n❌ BUG CONFIRMED: GALA/GWETH has more issues than GALA/GUSDC');
        } else {
          console.log('\n✅ Both pairs behave consistently');
        }
      }
    });
  });
});
