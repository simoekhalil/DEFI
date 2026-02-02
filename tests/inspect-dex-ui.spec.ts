import { test, expect } from '@playwright/test';

/**
 * Quick UI inspection to identify current selectors for DEX pools page
 */

test('Inspect DEX Pools UI on Test1', async ({ page }) => {
  console.log('='.repeat(70));
  console.log('DEX UI INSPECTION - TEST1 ENVIRONMENT');
  console.log('='.repeat(70));
  
  // Navigate to pools page
  await page.goto('https://lpad-frontend-test1.defi.gala.com/pools', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  await page.waitForTimeout(5000);
  
  console.log('\n📍 Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/dex-pools-inspect-1.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: dex-pools-inspect-1.png');
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n🔘 Found ${buttons.length} buttons:`);
  for (let i = 0; i < Math.min(buttons.length, 20); i++) {
    const btn = buttons[i];
    const text = await btn.textContent().catch(() => '');
    const testId = await btn.getAttribute('data-testid').catch(() => '');
    const className = await btn.getAttribute('class').catch(() => '');
    const isVisible = await btn.isVisible().catch(() => false);
    if (text?.trim() || testId) {
      console.log(`   [${i}] "${text?.trim().substring(0, 40)}" | testId: ${testId || 'none'} | visible: ${isVisible}`);
    }
  }
  
  // Find all links
  const links = await page.locator('a').all();
  console.log(`\n🔗 Found ${links.length} links:`);
  for (let i = 0; i < Math.min(links.length, 15); i++) {
    const link = links[i];
    const text = await link.textContent().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    const isVisible = await link.isVisible().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 40)}" → ${href || 'no href'}`);
    }
  }
  
  // Look for specific pool-related elements
  console.log('\n🏊 Pool-related elements:');
  
  const poolSelectors = [
    'text=/create.*pool/i',
    'text=/add.*liquidity/i',
    'text=/new.*position/i',
    'button:has-text("+")',
    '[data-testid*="pool"]',
    '[data-testid*="liquidity"]',
    '[data-testid*="create"]',
    '[data-testid*="add"]',
    '.pool-card',
    '.liquidity-btn',
    '[class*="pool"]',
    '[class*="liquidity"]',
  ];
  
  for (const selector of poolSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`   ✅ ${selector}: ${count} matches`);
      const first = page.locator(selector).first();
      const text = await first.textContent().catch(() => '');
      console.log(`      First text: "${text?.trim().substring(0, 50)}"`);
    }
  }
  
  // Check page content for pool-related text
  const content = await page.content();
  const poolKeywords = ['Create Pool', 'Add Liquidity', 'New Position', 'My Positions', 'Pool', 'Liquidity'];
  console.log('\n📝 Page content keywords:');
  for (const keyword of poolKeywords) {
    if (content.includes(keyword)) {
      console.log(`   ✅ Found: "${keyword}"`);
    }
  }
  
  // Navigate to swap page and check
  console.log('\n📍 Checking /swap page...');
  await page.goto('https://lpad-frontend-test1.defi.gala.com/swap', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'tests/screenshots/dex-swap-inspect-1.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: dex-swap-inspect-1.png');
  
  // Check for liquidity/pool links on swap page
  const swapButtons = await page.locator('button').all();
  console.log(`\n🔘 Swap page buttons (${swapButtons.length}):`);
  for (let i = 0; i < Math.min(swapButtons.length, 15); i++) {
    const btn = swapButtons[i];
    const text = await btn.textContent().catch(() => '');
    const isVisible = await btn.isVisible().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 50)}"`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('UI INSPECTION COMPLETE');
  console.log('='.repeat(70));
});

test('Inspect GalaSwap DEX UI', async ({ page }) => {
  console.log('='.repeat(70));
  console.log('GALASWAP DEX UI INSPECTION - TEST1');
  console.log('='.repeat(70));
  
  // Navigate to GalaSwap DEX
  await page.goto('https://dex-frontend-test1.defi.gala.com', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  await page.waitForTimeout(5000);
  
  console.log('\n📍 Current URL:', page.url());
  
  await page.screenshot({ 
    path: 'tests/screenshots/galaswap-dex-inspect-1.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: galaswap-dex-inspect-1.png');
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n🔘 Found ${buttons.length} buttons:`);
  for (let i = 0; i < Math.min(buttons.length, 25); i++) {
    const btn = buttons[i];
    const text = await btn.textContent().catch(() => '');
    const testId = await btn.getAttribute('data-testid').catch(() => '');
    const isVisible = await btn.isVisible().catch(() => false);
    if ((text?.trim() || testId) && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 50)}" | testId: ${testId || 'none'}`);
    }
  }
  
  // Find navigation links
  const navLinks = await page.locator('nav a, header a, [role="navigation"] a').all();
  console.log(`\n🔗 Navigation links (${navLinks.length}):`);
  for (const link of navLinks) {
    const text = await link.textContent().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    const isVisible = await link.isVisible().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   "${text?.trim()}" → ${href || 'no href'}`);
    }
  }
  
  // Try navigating to pools
  console.log('\n📍 Trying pool-related URLs...');
  const poolUrls = [
    'https://dex-frontend-test1.defi.gala.com/pools',
    'https://dex-frontend-test1.defi.gala.com/pool',
    'https://dex-frontend-test1.defi.gala.com/liquidity',
    'https://dex-frontend-test1.defi.gala.com/positions',
  ];
  
  for (const url of poolUrls) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    const finalUrl = page.url();
    const is404 = await page.locator('text=/404|not found/i').count() > 0;
    console.log(`   ${url.split('/').pop()}: ${finalUrl === url ? '✅' : '⚠️ redirect'} ${is404 ? '(404)' : ''}`);
  }
  
  // Check pools page structure
  await page.goto('https://dex-frontend-test1.defi.gala.com/pools', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  }).catch(() => {});
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'tests/screenshots/galaswap-pools-inspect-1.png', 
    fullPage: true 
  });
  
  const poolButtons = await page.locator('button').all();
  console.log(`\n🏊 Pool page buttons (${poolButtons.length}):`);
  for (let i = 0; i < Math.min(poolButtons.length, 20); i++) {
    const btn = poolButtons[i];
    const text = await btn.textContent().catch(() => '');
    const isVisible = await btn.isVisible().catch(() => false);
    if (text?.trim() && isVisible) {
      console.log(`   [${i}] "${text?.trim().substring(0, 60)}"`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('GALASWAP INSPECTION COMPLETE');
  console.log('='.repeat(70));
});
