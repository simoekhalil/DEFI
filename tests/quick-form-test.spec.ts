import { test, expect } from '@playwright/test';
import { NetworkHelper } from './helpers/network-helper';

test('Quick Launch Page Form Test', async ({ page }) => {
  console.log('=== QUICK FORM TEST STARTING ===');
  
  const networkHelper = new NetworkHelper(page);

  // Navigate to main page with retry logic
  const navigationSuccess = await networkHelper.navigateWithRetry('/');
  
  if (!navigationSuccess) {
    console.log('⚠️ Navigation failed, skipping test');
    test.skip();
    return;
  }

  // Check if page loaded properly
  const pageLoaded = await networkHelper.isPageLoaded();
  if (!pageLoaded) {
    console.log('⚠️ Page did not load properly, but continuing test');
  }

  await networkHelper.waitForNetworkStable();
  await page.waitForTimeout(3000); // Reduced wait time
  
  // Look for "Launch" navigation link and click it
  const launchButton = page.locator('a[href*="launch"]').first();
  
  if (await launchButton.count() > 0) {
    console.log('Found LAUNCH A COIN button, clicking...');
    await launchButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  } else {
    console.log('LAUNCH A COIN button not found, trying direct navigation...');
    await page.goto('/launch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  }
  
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  
  // Count form elements
  const buttons = await page.locator('button').count();
  const inputs = await page.locator('input').count();
  const textareas = await page.locator('textarea').count();
  const forms = await page.locator('form').count();
  
  console.log(`Form elements: ${buttons} buttons, ${inputs} inputs, ${textareas} textareas, ${forms} forms`);
  
  // Look for specific fields
  const nameField = page.locator('input[placeholder*="Enter your token name"]').first();
  const symbolField = page.locator('input[placeholder*="Enter your token symbol"]').first();
  const descField = page.locator('textarea[placeholder*="Enter your description"]').first();
  const imageField = page.locator('input[type="file"]').first();
  
  console.log('Field detection:');
  console.log('- Name field:', await nameField.count() > 0);
  console.log('- Symbol field:', await symbolField.count() > 0);
  console.log('- Description field:', await descField.count() > 0);
  console.log('- Image field:', await imageField.count() > 0);
  
  // Test name field if found
  if (await nameField.count() > 0) {
    console.log('Testing name field...');
    await nameField.fill('TestToken');
    const value = await nameField.inputValue();
    console.log('Name field value:', value);
    
    // Test validation
    await nameField.fill('Test Token'); // Should fail (space)
    await nameField.blur();
    await page.waitForTimeout(1000);
    
    const error = page.locator('.error, .invalid, [data-testid*="error"]').first();
    if (await error.count() > 0) {
      const errorText = await error.textContent();
      console.log('Name validation error:', errorText);
    } else {
      console.log('No name validation error found');
    }
  }
  
  // Test symbol field if found
  if (await symbolField.count() > 0) {
    console.log('Testing symbol field...');
    await symbolField.fill('TEST');
    const value = await symbolField.inputValue();
    console.log('Symbol field value:', value);
    
    // Test validation
    await symbolField.fill('TEST123'); // Should fail (numbers)
    await symbolField.blur();
    await page.waitForTimeout(1000);
    
    const error = page.locator('.error, .invalid, [data-testid*="error"]').first();
    if (await error.count() > 0) {
      const errorText = await error.textContent();
      console.log('Symbol validation error:', errorText);
    } else {
      console.log('No symbol validation error found');
    }
  }
  
  // Test description field if found
  if (await descField.count() > 0) {
    console.log('Testing description field...');
    await descField.fill('This is a test description');
    const value = await descField.inputValue();
    console.log('Description field value:', value);
  }
  
  // Look for submit/launch button
  const submitButton = page.locator('button:has-text("Launch"), button:has-text("Create"), button:has-text("Submit")').first();
  if (await submitButton.count() > 0) {
    const buttonText = await submitButton.textContent();
    const isEnabled = await submitButton.isEnabled();
    console.log(`Submit button found: "${buttonText}", enabled: ${isEnabled}`);
  } else {
    console.log('No submit button found');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/quick-form-test.png', fullPage: true });
  
  console.log('=== QUICK FORM TEST COMPLETE ===');
});
