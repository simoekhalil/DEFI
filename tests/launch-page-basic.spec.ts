import { test, expect } from '@playwright/test';

test.describe('Launch Page - Basic Navigation and Form Detection', () => {
  test('should navigate to Launch page and detect form elements', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/main-page.png', fullPage: true });
    
    // Log all buttons and links on the main page
    const buttons = await page.locator('button').all();
    const links = await page.locator('a').all();
    
    console.log('=== MAIN PAGE ANALYSIS ===');
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    console.log('Number of buttons:', buttons.length);
    console.log('Number of links:', links.length);
    
    // Log all button texts
    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].textContent();
      const buttonId = await buttons[i].getAttribute('id');
      const buttonClass = await buttons[i].getAttribute('class');
      console.log(`Button ${i + 1}: "${buttonText}" (id: ${buttonId}, class: ${buttonClass})`);
    }
    
    // Log all link texts and hrefs
    for (let i = 0; i < links.length; i++) {
      const linkText = await links[i].textContent();
      const linkHref = await links[i].getAttribute('href');
      console.log(`Link ${i + 1}: "${linkText}" -> ${linkHref}`);
    }
    
    // Look for Launch-related elements
    const launchElements = page.locator(':text("Launch"), :text("launch"), [data-testid*="launch"], [class*="launch"]');
    const launchCount = await launchElements.count();
    console.log(`Found ${launchCount} launch-related elements`);
    
    for (let i = 0; i < launchCount; i++) {
      const element = launchElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      console.log(`Launch element ${i + 1}: <${tagName}> "${text}" (href: ${href})`);
    }
    
    // Try to find and click Launch button
    const launchButton = page.locator('button:has-text("Launch"), a:has-text("Launch"), [data-testid*="launch"]').first();
    
    if (await launchButton.count() > 0) {
      console.log('Found launch button, attempting to click...');
      await launchButton.click();
      await page.waitForLoadState('networkidle');
      
      console.log('After click - URL:', page.url());
      console.log('After click - Title:', await page.title());
      
      // Take screenshot after navigation
      await page.screenshot({ path: 'tests/screenshots/after-launch-click.png', fullPage: true });
      
      // Analyze the new page
      const newPageButtons = await page.locator('button').all();
      const newPageInputs = await page.locator('input').all();
      const newPageTextareas = await page.locator('textarea').all();
      
      console.log('=== LAUNCH PAGE ANALYSIS ===');
      console.log('Number of buttons:', newPageButtons.length);
      console.log('Number of inputs:', newPageInputs.length);
      console.log('Number of textareas:', newPageTextareas.length);
      
      // Log all form elements
      for (let i = 0; i < newPageInputs.length; i++) {
        const input = newPageInputs[i];
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        const id = await input.getAttribute('id');
        console.log(`Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}", id="${id}"`);
      }
      
      for (let i = 0; i < newPageTextareas.length; i++) {
        const textarea = newPageTextareas[i];
        const name = await textarea.getAttribute('name');
        const placeholder = await textarea.getAttribute('placeholder');
        const id = await textarea.getAttribute('id');
        console.log(`Textarea ${i + 1}: name="${name}", placeholder="${placeholder}", id="${id}"`);
      }
      
      // Look for specific form fields
      const nameField = page.locator('input[placeholder*="name"], input[name*="name"], [data-testid*="name"]').first();
      const symbolField = page.locator('input[placeholder*="symbol"], input[name*="symbol"], [data-testid*="symbol"]').first();
      const descField = page.locator('textarea[placeholder*="description"], textarea[name*="description"], [data-testid*="description"]').first();
      const imageField = page.locator('input[type="file"], [data-testid*="image"], [data-testid*="upload"]').first();
      
      console.log('Form field detection:');
      console.log('- Name field found:', await nameField.count() > 0);
      console.log('- Symbol field found:', await symbolField.count() > 0);
      console.log('- Description field found:', await descField.count() > 0);
      console.log('- Image field found:', await imageField.count() > 0);
      
    } else {
      console.log('No launch button found on the main page');
      
      // Try direct navigation to common launch page URLs
      const possibleUrls = ['/launch', '/create', '/new-token', '/launch-token'];
      
      for (const url of possibleUrls) {
        console.log(`Trying direct navigation to: ${url}`);
        try {
          await page.goto(url);
          await page.waitForLoadState('networkidle');
          
          if (page.url().includes(url) || !page.url().includes('404')) {
            console.log(`Successfully navigated to: ${url}`);
            await page.screenshot({ path: `tests/screenshots/direct-${url.replace('/', '')}.png`, fullPage: true });
            break;
          }
        } catch (error) {
          console.log(`Failed to navigate to ${url}:`, error);
        }
      }
    }
  });

  test('should analyze page structure for form validation patterns', async ({ page }) => {
    // Try to navigate to launch page
    await page.goto('/launch');
    await page.waitForLoadState('networkidle');
    
    // If that doesn't work, try the main page and look for launch links
    if (page.url().includes('404') || page.url().includes('error')) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for any navigation menu or links
      const navElements = page.locator('nav, .nav, .navigation, .menu, .header').first();
      if (await navElements.count() > 0) {
        console.log('Found navigation element');
        await navElements.screenshot({ path: 'tests/screenshots/navigation.png' });
      }
    }
    
    // Look for any JavaScript errors or console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(3000);
    
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/final-analysis.png', fullPage: true });
    
    // Get page source for analysis
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);
    
    // Look for common form validation patterns in the HTML
    const hasValidationScripts = pageContent.includes('validation') || pageContent.includes('validate');
    const hasFormScripts = pageContent.includes('form') || pageContent.includes('Form');
    const hasReactScripts = pageContent.includes('react') || pageContent.includes('React');
    
    console.log('Page analysis:');
    console.log('- Has validation scripts:', hasValidationScripts);
    console.log('- Has form scripts:', hasFormScripts);
    console.log('- Has React scripts:', hasReactScripts);
  });
});

