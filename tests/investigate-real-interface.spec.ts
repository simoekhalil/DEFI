import { test, expect } from '@playwright/test';

/**
 * Real Token Creation Investigation
 * Let's examine the actual Gala Launchpad interface to understand how to create tokens
 */

test.describe('Investigate Real Gala Launchpad Interface', () => {
  
  test('should examine the actual launch page structure', async ({ page }) => {
    console.log('🔍 INVESTIGATING REAL GALA LAUNCHPAD INTERFACE');
    
    // Navigate to Gala Launchpad
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(5000);
    
    console.log('📍 Current URL:', page.url());
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'tests/screenshots/real-homepage.png',
      fullPage: true 
    });
    
    // Get all the text content to understand what's on the page
    const pageText = await page.textContent('body');
    console.log('📄 Page contains:', pageText?.substring(0, 500) + '...');
    
    // Look for any buttons or links
    const allButtons = await page.locator('button, a[href*="launch"], [role="button"]').all();
    console.log(`🔘 Found ${allButtons.length} buttons/links`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const buttonText = await allButtons[i].textContent();
      const isVisible = await allButtons[i].isVisible();
      console.log(`   ${i + 1}. "${buttonText}" (visible: ${isVisible})`);
    }
    
    // Look for launch-related elements
    const launchElements = await page.locator('text=/launch|create|token|coin/i').all();
    console.log(`🚀 Found ${launchElements.length} launch-related elements`);
    
    for (let i = 0; i < Math.min(launchElements.length, 5); i++) {
      const elementText = await launchElements[i].textContent();
      const isVisible = await launchElements[i].isVisible();
      console.log(`   Launch element ${i + 1}: "${elementText}" (visible: ${isVisible})`);
    }
    
    // Check if there's a wallet connection requirement
    const walletElements = await page.locator('text=/connect|wallet|sign.*in/i').all();
    console.log(`💳 Found ${walletElements.length} wallet-related elements`);
    
    // Look for navigation menu
    const navElements = await page.locator('nav, [role="navigation"], .menu, .navbar').all();
    console.log(`🧭 Found ${navElements.length} navigation elements`);
    
    // Try to find the actual launch page
    console.log('🔍 Trying to find launch page...');
    
    // Method 1: Look for launch button and click it
    const launchButton = await page.locator('text=/launch.*coin|create.*token|start.*launch/i').first();
    if (await launchButton.isVisible()) {
      console.log('✅ Found launch button, clicking...');
      await launchButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('📍 After clicking launch button, URL:', page.url());
      await page.screenshot({ 
        path: 'tests/screenshots/real-after-launch-click.png',
        fullPage: true 
      });
    }
    
    // Method 2: Try direct navigation to launch page
    console.log('🔍 Trying direct navigation to /launch...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com/launch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📍 Direct launch page URL:', page.url());
    await page.screenshot({ 
      path: 'tests/screenshots/real-launch-page.png',
      fullPage: true 
    });
    
    // Now examine the launch page structure
    const launchPageText = await page.textContent('body');
    console.log('📄 Launch page contains:', launchPageText?.substring(0, 500) + '...');
    
    // Look for form fields with various selectors
    const possibleFormFields = [
      'input[type="text"]',
      'input[placeholder*="name"]',
      'input[placeholder*="symbol"]', 
      'input[placeholder*="token"]',
      'textarea',
      'input[type="file"]',
      '[contenteditable="true"]',
      '.form-control',
      '.input',
      '[data-testid*="name"]',
      '[data-testid*="symbol"]',
      '[data-testid*="description"]'
    ];
    
    console.log('🔍 Searching for form fields...');
    for (const selector of possibleFormFields) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`   Found ${elements.length} elements with selector: ${selector}`);
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const placeholder = await elements[i].getAttribute('placeholder');
          const name = await elements[i].getAttribute('name');
          const id = await elements[i].getAttribute('id');
          const isVisible = await elements[i].isVisible();
          console.log(`     ${i + 1}. placeholder="${placeholder}" name="${name}" id="${id}" visible=${isVisible}`);
        }
      }
    }
    
    // Look for submit buttons
    const submitButtons = await page.locator('button[type="submit"], input[type="submit"], button:has-text("create"), button:has-text("launch"), button:has-text("submit")').all();
    console.log(`🔘 Found ${submitButtons.length} potential submit buttons`);
    
    for (let i = 0; i < submitButtons.length; i++) {
      const buttonText = await submitButtons[i].textContent();
      const isVisible = await submitButtons[i].isVisible();
      const isEnabled = await submitButtons[i].isEnabled();
      console.log(`   ${i + 1}. "${buttonText}" (visible: ${isVisible}, enabled: ${isEnabled})`);
    }
    
    // Check for any error messages or requirements
    const errorElements = await page.locator('.error, .warning, [data-testid*="error"], [role="alert"]').all();
    if (errorElements.length > 0) {
      console.log(`⚠️ Found ${errorElements.length} error/warning elements:`);
      for (let i = 0; i < errorElements.length; i++) {
        const errorText = await errorElements[i].textContent();
        console.log(`   ${i + 1}. "${errorText}"`);
      }
    }
    
    // Check if wallet connection is required
    const connectWalletElements = await page.locator('text=/connect.*wallet|sign.*in|authenticate/i').all();
    if (connectWalletElements.length > 0) {
      console.log(`💳 Wallet connection may be required. Found ${connectWalletElements.length} wallet connection elements`);
    }
    
    console.log('🔍 INVESTIGATION COMPLETE - Check screenshots for visual confirmation');
  });

  test('should attempt to connect wallet if required', async ({ page }) => {
    console.log('💳 ATTEMPTING WALLET CONNECTION');
    
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Look for connect wallet button
    const connectButton = await page.locator('text=/connect.*wallet|sign.*in/i').first();
    if (await connectButton.isVisible()) {
      console.log('✅ Found connect wallet button');
      await connectButton.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot of wallet connection modal
      await page.screenshot({ 
        path: 'tests/screenshots/real-wallet-modal.png',
        fullPage: true 
      });
      
      // Look for Gala wallet option
      const galaWalletOption = await page.locator('text=/gala/i').first();
      if (await galaWalletOption.isVisible()) {
        console.log('✅ Found Gala wallet option');
        // Note: We won't actually connect in the test, just document the process
      }
    } else {
      console.log('ℹ️ No wallet connection button found');
    }
  });
});
