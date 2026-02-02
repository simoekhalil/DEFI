import { test, expect } from '@playwright/test';

/**
 * Quick inspection of GalaSwap DEX Pool Creation UI
 * This helps us understand the exact selectors needed
 */

test('Inspect Pool Creation Flow on GalaSwap DEX Test1', async ({ page }) => {
  console.log('='.repeat(70));
  console.log('GALASWAP DEX POOL CREATION UI INSPECTION');
  console.log('='.repeat(70));
  
  // Step 1: Go to pool page
  await page.goto('https://dex-frontend-test1.defi.gala.com/dex/pool', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  
  // Dismiss privacy modal if present
  const acceptAllBtn = page.locator('button:has-text("Accept All"), [data-testid="uc-accept-all-button"]').first();
  if (await acceptAllBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptAllBtn.click();
    console.log('   ✅ Privacy modal dismissed');
    await page.waitForTimeout(1000);
  }
  
  console.log('\n📍 Step 1: Pool page');
  console.log('URL:', page.url());
  
  await page.screenshot({ 
    path: 'tests/screenshots/inspect-pool-1-list.png', 
    fullPage: true 
  });
  
  // Find all links and buttons
  const allLinks = await page.locator('a').all();
  console.log(`\n🔗 Found ${allLinks.length} links:`);
  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i];
    const text = await link.textContent().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    const isVisible = await link.isVisible().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 40)}" → ${href || 'no href'}`);
    }
  }
  
  const allButtons = await page.locator('button').all();
  console.log(`\n🔘 Found ${allButtons.length} buttons:`);
  for (let i = 0; i < allButtons.length; i++) {
    const btn = allButtons[i];
    const text = await btn.textContent().catch(() => '');
    const isVisible = await btn.isVisible().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 50)}"`);
    }
  }
  
  // Step 2: Look for "New Position" link and click it
  console.log('\n📍 Step 2: Looking for New Position link...');
  
  const newPositionLink = page.locator('a:has-text("New Position")').first();
  if (await newPositionLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    const href = await newPositionLink.getAttribute('href');
    console.log(`   Found "New Position" link → ${href}`);
    
    // Click and wait for navigation
    await Promise.all([
      page.waitForURL('**/add**', { timeout: 10000 }).catch(() => {}),
      newPositionLink.click()
    ]);
    
    await page.waitForTimeout(3000);
    console.log('   Navigated to:', page.url());
    
    await page.screenshot({ 
      path: 'tests/screenshots/inspect-pool-2-new-position.png', 
      fullPage: true 
    });
  } else {
    console.log('   "New Position" link not found');
  }
  
  // Step 3: Inspect the add liquidity form
  console.log('\n📍 Step 3: Inspecting add liquidity form...');
  
  // Find all inputs
  const inputs = await page.locator('input').all();
  console.log(`\n📝 Found ${inputs.length} inputs:`);
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type').catch(() => '');
    const placeholder = await input.getAttribute('placeholder').catch(() => '');
    const testId = await input.getAttribute('data-testid').catch(() => '');
    const isVisible = await input.isVisible().catch(() => false);
    if (isVisible) {
      console.log(`   [${i}] type="${type}" placeholder="${placeholder}" testId="${testId}"`);
    }
  }
  
  // Find token selectors
  console.log('\n🪙 Token selectors:');
  const tokenSelectors = [
    'button:has-text("Select")',
    'button:has-text("GALA")',
    'button:has-text("USDC")',
    '[data-testid*="token"]',
    '[class*="token-select"]',
    '[class*="TokenSelect"]',
  ];
  
  for (const selector of tokenSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`   ✅ ${selector}: ${count} matches`);
    }
  }
  
  // Find fee tier selectors
  console.log('\n💰 Fee tier selectors:');
  const feeSelectors = [
    'button:has-text("0.05%")',
    'button:has-text("0.3%")',
    'button:has-text("1%")',
    '[data-testid*="fee"]',
    '[class*="fee-tier"]',
    'text=/\\d+\\.\\d+%/',
  ];
  
  for (const selector of feeSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`   ✅ ${selector}: ${count} matches`);
    }
  }
  
  // Find submit/confirm buttons
  console.log('\n🚀 Submit buttons:');
  const submitSelectors = [
    'button:has-text("Add")',
    'button:has-text("Add Liquidity")',
    'button:has-text("Confirm")',
    'button:has-text("Submit")',
    'button:has-text("Preview")',
    'button[type="submit"]',
  ];
  
  for (const selector of submitSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      const btn = page.locator(selector).first();
      const disabled = await btn.isDisabled().catch(() => 'unknown');
      console.log(`   ✅ ${selector}: ${count} matches (disabled: ${disabled})`);
    }
  }
  
  // Log all visible buttons on the form
  const formButtons = await page.locator('button').all();
  console.log(`\n🔘 All buttons on form (${formButtons.length}):`);
  for (let i = 0; i < formButtons.length; i++) {
    const btn = formButtons[i];
    const text = await btn.textContent().catch(() => '');
    const isVisible = await btn.isVisible().catch(() => false);
    const disabled = await btn.isDisabled().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 50)}" ${disabled ? '(disabled)' : ''}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('INSPECTION COMPLETE');
  console.log('='.repeat(70));
});
