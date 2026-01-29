import { test, expect } from '@playwright/test';

test.describe('Improved Launch Page Test with JavaScript Loading', () => {
  test('should find and interact with Launch A Coin button', async ({ page }) => {
    console.log('=== IMPROVED LAUNCH TEST ===');
    
    // Navigate to the website
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for React to fully load
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/improved-main-page.png', fullPage: true });
    
    // Look for the "Launch" navigation link specifically
    const launchButton = page.locator('a[href*="launch"]').first();
    
    console.log('Looking for LAUNCH A COIN button...');
    
    if (await launchButton.count() > 0) {
      console.log('✅ Found LAUNCH A COIN button!');
      
      // Get button details
      const buttonText = await launchButton.textContent();
      const buttonTag = await launchButton.evaluate(el => el.tagName);
      console.log(`Button: <${buttonTag}> "${buttonText}"`);
      
      // Click the button
      console.log('Clicking LAUNCH A COIN button...');
      await launchButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('After click - URL:', page.url());
      console.log('After click - Title:', await page.title());
      
      // Take screenshot after navigation
      await page.screenshot({ path: 'tests/screenshots/after-launch-click.png', fullPage: true });
      
      // Analyze the launch page
      const launchPageContent = await page.textContent('body');
      console.log('Launch page content preview:', launchPageContent?.substring(0, 300));
      
      // Look for form elements on the launch page
      const formElements = {
        'buttons': await page.locator('button').count(),
        'inputs': await page.locator('input').count(),
        'textareas': await page.locator('textarea').count(),
        'selects': await page.locator('select').count(),
        'forms': await page.locator('form').count()
      };
      
      console.log('Form elements on launch page:', formElements);
      
      // Look for specific form fields
      const nameField = page.locator('input[placeholder*="name"], input[name*="name"], [data-testid*="name"]').first();
      const symbolField = page.locator('input[placeholder*="symbol"], input[name*="symbol"], [data-testid*="symbol"]').first();
      const descField = page.locator('textarea[placeholder*="description"], textarea[name*="description"], [data-testid*="description"]').first();
      const imageField = page.locator('input[type="file"], [data-testid*="image"], [data-testid*="upload"]').first();
      
      console.log('Specific form field detection:');
      console.log('- Name field found:', await nameField.count() > 0);
      console.log('- Symbol field found:', await symbolField.count() > 0);
      console.log('- Description field found:', await descField.count() > 0);
      console.log('- Image field found:', await imageField.count() > 0);
      
      // Test form field interactions if found
      if (await nameField.count() > 0) {
        console.log('Testing name field interaction...');
        await nameField.fill('TestToken');
        const nameValue = await nameField.inputValue();
        console.log('Name field value after input:', nameValue);
      }
      
      if (await symbolField.count() > 0) {
        console.log('Testing symbol field interaction...');
        await symbolField.fill('TEST');
        const symbolValue = await symbolField.inputValue();
        console.log('Symbol field value after input:', symbolValue);
      }
      
      if (await descField.count() > 0) {
        console.log('Testing description field interaction...');
        await descField.fill('This is a test token description');
        const descValue = await descField.inputValue();
        console.log('Description field value after input:', descValue);
      }
      
      // Take final screenshot with form filled
      await page.screenshot({ path: 'tests/screenshots/launch-form-filled.png', fullPage: true });
      
    } else {
      console.log('❌ LAUNCH A COIN button not found');
      
      // List all buttons for debugging
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons total:`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const id = await button.getAttribute('id');
        const className = await button.getAttribute('class');
        console.log(`Button ${i + 1}: "${text}" (id: ${id}, class: ${className})`);
      }
      
      // List all links for debugging
      const allLinks = await page.locator('a').all();
      console.log(`Found ${allLinks.length} links total:`);
      
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const link = allLinks[i];
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        console.log(`Link ${i + 1}: "${text}" -> ${href}`);
      }
    }
    
    console.log('=== TEST COMPLETE ===');
  });

  test('should test direct navigation to launch page', async ({ page }) => {
    console.log('=== DIRECT NAVIGATION TEST ===');
    
    // Try direct navigation to launch page
    await page.goto('/launch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('Direct navigation - URL:', page.url());
    console.log('Direct navigation - Title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/direct-launch-page.png', fullPage: true });
    
    // Check if we're on a valid launch page
    const pageContent = await page.textContent('body');
    const hasLaunchContent = pageContent?.toLowerCase().includes('launch') || 
                            pageContent?.toLowerCase().includes('token') ||
                            pageContent?.toLowerCase().includes('create');
    
    console.log('Has launch-related content:', hasLaunchContent);
    console.log('Page content preview:', pageContent?.substring(0, 200));
    
    // Count form elements
    const formElements = {
      'buttons': await page.locator('button').count(),
      'inputs': await page.locator('input').count(),
      'textareas': await page.locator('textarea').count(),
      'forms': await page.locator('form').count()
    };
    
    console.log('Form elements on direct launch page:', formElements);
    
    console.log('=== DIRECT NAVIGATION TEST COMPLETE ===');
  });
});

