import { test, expect } from '@playwright/test';

test.describe('Fast Launch Page Test', () => {
  test('should quickly navigate to launch page and verify elements', async ({ page }) => {
    console.log('=== FAST LAUNCH TEST ===');
    
    // Navigate directly to launch page (skip homepage)
    await page.goto('/launch');
    
    // Single wait for page load (remove redundant waits)
    await page.waitForLoadState('domcontentloaded');
    
    // Verify we're on the launch page
    expect(page.url()).toContain('launch');
    
    // Quick form element verification (no screenshots to save time)
    const nameField = page.locator('input[placeholder*="Enter your token name"]').first();
    const symbolField = page.locator('input[placeholder*="Enter your token symbol"]').first();
    const descField = page.locator('textarea[placeholder*="Enter your description"]').first();
    const connectButton = page.locator('button:has-text("Connect Wallet")').first();
    
    // Verify elements exist (faster than waitForSelector)
    await expect(nameField).toBeVisible({ timeout: 3000 });
    await expect(symbolField).toBeVisible({ timeout: 3000 });
    await expect(descField).toBeVisible({ timeout: 3000 });
    await expect(connectButton).toBeVisible({ timeout: 3000 });
    
    console.log('✅ All form elements verified quickly');
  });

  test('should quickly fill and validate form', async ({ page }) => {
    // Navigate directly to launch page
    await page.goto('/launch');
    await page.waitForLoadState('domcontentloaded');
    
    // Fill form quickly (no delays between actions)
    await page.fill('input[placeholder*="Enter your token name"]', 'FastTest');
    await page.fill('input[placeholder*="Enter your token symbol"]', 'FAST');
    await page.fill('textarea[placeholder*="Enter your description"]', 'Quick test token');
    
    // Verify form is filled
    const nameValue = await page.inputValue('input[placeholder*="Enter your token name"]');
    const symbolValue = await page.inputValue('input[placeholder*="Enter your token symbol"]');
    
    expect(nameValue).toBe('FastTest');
    expect(symbolValue).toBe('FAST');
    
    console.log('✅ Form validation completed quickly');
  });
});
