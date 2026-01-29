import { test, expect } from '@playwright/test';

test.describe('JavaScript Loading and React Component Detection', () => {
  test('should wait for React components to load and detect interactive elements', async ({ page }) => {
    // Enable JavaScript and set up console monitoring
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    // Navigate to the website
    await page.goto('/');
    
    // Wait for initial page load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    console.log('=== INITIAL PAGE LOAD ===');
    console.log('Initial page content:', await page.textContent('body'));
    
    // Wait for React to initialize
    await page.waitForTimeout(3000);
    
    // Check if React is loading
    const reactScripts = await page.locator('script[src*="react"], script[src*="bundle"], script[src*="main"]').count();
    console.log('React scripts found:', reactScripts);
    
    // Wait for React root to be populated
    let reactLoaded = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!reactLoaded && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}: Checking for React components...`);
      
      // Check if the "You need to enable JavaScript" message is gone
      const bodyText = await page.textContent('body');
      const hasJsMessage = bodyText?.includes('You need to enable JavaScript to run this app');
      
      if (!hasJsMessage) {
        console.log('JavaScript message disappeared, React may be loading...');
        reactLoaded = true;
        break;
      }
      
      // Wait for any interactive elements to appear
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      const inputs = await page.locator('input').count();
      
      if (buttons > 0 || links > 0 || inputs > 0) {
        console.log(`Found interactive elements: ${buttons} buttons, ${links} links, ${inputs} inputs`);
        reactLoaded = true;
        break;
      }
      
      // Wait for React root element to have content
      const reactRoot = await page.locator('#root, [data-reactroot], .app, .main').first();
      if (await reactRoot.count() > 0) {
        const rootContent = await reactRoot.textContent();
        if (rootContent && rootContent.length > 10) {
          console.log('React root has content:', rootContent.substring(0, 100));
          reactLoaded = true;
          break;
        }
      }
      
      console.log(`Waiting for React to load... (${attempts}/${maxAttempts})`);
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot after waiting
    await page.screenshot({ path: 'tests/screenshots/after-react-load.png', fullPage: true });
    
    // Analyze the loaded page
    console.log('=== PAGE ANALYSIS AFTER REACT LOAD ===');
    const finalBodyText = await page.textContent('body');
    console.log('Final page content length:', finalBodyText?.length);
    console.log('Final page content preview:', finalBodyText?.substring(0, 200));
    
    // Count all interactive elements
    const allButtons = await page.locator('button').all();
    const allLinks = await page.locator('a').all();
    const allInputs = await page.locator('input').all();
    const allSelects = await page.locator('select').all();
    const allTextareas = await page.locator('textarea').all();
    
    console.log('Interactive elements found:');
    console.log(`- Buttons: ${allButtons.length}`);
    console.log(`- Links: ${allLinks.length}`);
    console.log(`- Inputs: ${allInputs.length}`);
    console.log(`- Selects: ${allSelects.length}`);
    console.log(`- Textareas: ${allTextareas.length}`);
    
    // Log all button details
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const id = await button.getAttribute('id');
      const className = await button.getAttribute('class');
      const dataTestId = await button.getAttribute('data-testid');
      console.log(`Button ${i + 1}: "${text}" (id: ${id}, class: ${className}, data-testid: ${dataTestId})`);
    }
    
    // Log all link details
    for (let i = 0; i < allLinks.length; i++) {
      const link = allLinks[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      const id = await link.getAttribute('id');
      console.log(`Link ${i + 1}: "${text}" -> ${href} (id: ${id})`);
    }
    
    // Look for specific web3/DeFi elements
    const web3Elements = page.locator(':text("Connect"), :text("Wallet"), :text("Launch"), :text("Token"), :text("Swap"), :text("Pool")');
    const web3Count = await web3Elements.count();
    console.log(`Web3/DeFi related elements found: ${web3Count}`);
    
    for (let i = 0; i < web3Count; i++) {
      const element = web3Elements.nth(i);
      const text = await element.textContent();
      const tagName = await element.evaluate(el => el.tagName);
      console.log(`Web3 element ${i + 1}: <${tagName}> "${text}"`);
    }
    
    // Check for form elements
    const forms = await page.locator('form').count();
    console.log(`Forms found: ${forms}`);
    
    if (forms > 0) {
      for (let i = 0; i < forms; i++) {
        const form = page.locator('form').nth(i);
        const formInputs = await form.locator('input').count();
        const formButtons = await form.locator('button').count();
        console.log(`Form ${i + 1}: ${formInputs} inputs, ${formButtons} buttons`);
      }
    }
    
    // Log console messages and errors
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    if (errors.length > 0) {
      console.log('=== ERRORS FOUND ===');
      errors.forEach(error => console.log(error));
    }
    
    // Verify that we have some interactive content
    const totalInteractiveElements = allButtons.length + allLinks.length + allInputs.length + allSelects.length + allTextareas.length;
    console.log(`Total interactive elements: ${totalInteractiveElements}`);
    
    if (totalInteractiveElements > 0) {
      console.log('✅ SUCCESS: Interactive elements detected after React load');
    } else {
      console.log('⚠️ WARNING: No interactive elements found, React may not have loaded properly');
    }
  });

  test('should test navigation to launch page with proper JavaScript handling', async ({ page }) => {
    // Navigate to main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for React to load
    await page.waitForTimeout(5000);
    
    // Try to find and click launch-related elements
    const launchSelectors = [
      'button:has-text("Launch")',
      'a:has-text("Launch")',
      '[data-testid*="launch"]',
      '[class*="launch"]',
      ':text("Launch a Coin")',
      ':text("Create Token")',
      ':text("New Token")'
    ];
    
    let launchElementFound = false;
    
    for (const selector of launchSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`Found launch element with selector: ${selector}`);
        const text = await element.textContent();
        console.log(`Element text: "${text}"`);
        
        try {
          await element.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          console.log('After click - URL:', page.url());
          console.log('After click - Title:', await page.title());
          
          await page.screenshot({ path: 'tests/screenshots/after-launch-navigation.png', fullPage: true });
          launchElementFound = true;
          break;
        } catch (error) {
          console.log(`Failed to click element with selector ${selector}:`, error);
        }
      }
    }
    
    if (!launchElementFound) {
      console.log('No launch elements found, trying direct navigation...');
      
      // Try direct navigation to launch page
      const possibleUrls = ['/launch', '/create', '/new-token', '/launch-token', '/token/create'];
      
      for (const url of possibleUrls) {
        try {
          console.log(`Trying direct navigation to: ${url}`);
          await page.goto(url);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          const pageTitle = await page.title();
          
          console.log(`Navigation result - URL: ${currentUrl}, Title: ${pageTitle}`);
          
          if (!currentUrl.includes('404') && !currentUrl.includes('error')) {
            await page.screenshot({ path: `tests/screenshots/direct-nav-${url.replace('/', '')}.png`, fullPage: true });
            console.log(`✅ Successfully navigated to: ${url}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to navigate to ${url}:`, error);
        }
      }
    }
  });

  test('should detect and analyze form elements on launch page', async ({ page }) => {
    // Navigate directly to launch page
    await page.goto('/launch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for React to load
    
    console.log('=== LAUNCH PAGE ANALYSIS ===');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    
    // Wait for form elements to appear
    const formSelectors = [
      'form',
      'input',
      'textarea',
      'button',
      '[data-testid*="form"]',
      '[class*="form"]'
    ];
    
    for (const selector of formSelectors) {
      const elements = await page.locator(selector).count();
      console.log(`${selector}: ${elements} elements found`);
    }
    
    // Look for specific form fields
    const fieldSelectors = {
      'name': ['input[placeholder*="name"]', 'input[name*="name"]', '[data-testid*="name"]'],
      'symbol': ['input[placeholder*="symbol"]', 'input[name*="symbol"]', '[data-testid*="symbol"]'],
      'description': ['textarea[placeholder*="description"]', 'textarea[name*="description"]', '[data-testid*="description"]'],
      'image': ['input[type="file"]', '[data-testid*="image"]', '[data-testid*="upload"]']
    };
    
    for (const [fieldName, selectors] of Object.entries(fieldSelectors)) {
      let fieldFound = false;
      for (const selector of selectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ ${fieldName} field found with selector: ${selector}`);
          fieldFound = true;
          break;
        }
      }
      if (!fieldFound) {
        console.log(`❌ ${fieldName} field not found`);
      }
    }
    
    // Take screenshot of launch page
    await page.screenshot({ path: 'tests/screenshots/launch-page-analysis.png', fullPage: true });
    
    // Check for validation messages or error states
    const errorElements = await page.locator('.error, .validation-error, [data-testid*="error"], .invalid').count();
    console.log(`Error/validation elements found: ${errorElements}`);
    
    // Check for submit buttons
    const submitButtons = await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Launch"), button:has-text("Create")').count();
    console.log(`Submit buttons found: ${submitButtons}`);
  });
});

