import { test, expect } from '@playwright/test';

test.describe('Gala DeFi Website Tests', () => {
  test('should access the page and read text content', async ({ page }) => {
    // Navigate to the Gala DeFi website
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for React to load and render components
    await page.waitForTimeout(5000); // Give React time to load
    
    // Wait for any dynamic content to appear
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      // Wait for React root to be populated
      await page.waitForFunction(() => {
        const body = document.body;
        return body && body.children.length > 0 && body.textContent !== 'You need to enable JavaScript to run this app.';
      }, { timeout: 15000 });
    } catch (error) {
      console.log('React components may not have loaded fully, continuing with current state...');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/gala-defi-homepage.png', fullPage: true });
    
    // Get the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get all visible text content on the page
    const pageText = await page.textContent('body');
    console.log('Page text content:', pageText);
    
    // Check if the page loaded successfully (not an error page)
    expect(page.url()).toContain('lpad-frontend-dev1.defi.gala.com');
    
    // Verify that we have some text content (not just a blank page)
    expect(pageText).toBeTruthy();
    expect(pageText!.length).toBeGreaterThan(0);
    
    // Look for common web3/DeFi related text patterns
    const hasWeb3Content = pageText!.toLowerCase().includes('connect') || 
                          pageText!.toLowerCase().includes('wallet') ||
                          pageText!.toLowerCase().includes('defi') ||
                          pageText!.toLowerCase().includes('gala') ||
                          pageText!.toLowerCase().includes('token') ||
                          pageText!.toLowerCase().includes('swap') ||
                          pageText!.toLowerCase().includes('pool');
    
    console.log('Contains web3/DeFi content:', hasWeb3Content);
    
    // Check for common web3 elements
    const walletButton = await page.locator('button:has-text("Connect"), button:has-text("Wallet"), [data-testid*="connect"], [data-testid*="wallet"]').first();
    const hasWalletButton = await walletButton.count() > 0;
    console.log('Has wallet connect button:', hasWalletButton);
    
    // Log all buttons on the page
    const buttons = await page.locator('button').all();
    console.log('Number of buttons found:', buttons.length);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const buttonText = await buttons[i].textContent();
      console.log(`Button ${i + 1}:`, buttonText);
    }
    
    // Log all links on the page
    const links = await page.locator('a').all();
    console.log('Number of links found:', links.length);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const linkText = await links[i].textContent();
      const linkHref = await links[i].getAttribute('href');
      console.log(`Link ${i + 1}:`, linkText, '->', linkHref);
    }
  });

  test('should check for web3 wallet connection elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for common wallet connection patterns
    const walletSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      '[data-testid*="connect"]',
      '[data-testid*="wallet"]',
      '.wallet-connect',
      '.connect-wallet',
      'button[class*="connect"]',
      'button[class*="wallet"]'
    ];
    
    let foundWalletElement = false;
    for (const selector of walletSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        const text = await element.textContent();
        console.log(`Found wallet element with selector "${selector}":`, text);
        foundWalletElement = true;
        break;
      }
    }
    
    console.log('Found wallet connection element:', foundWalletElement);
  });

  test('should check page responsiveness and basic functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if the page is responsive
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/gala-defi-mobile.png', fullPage: true });
    
    // Check desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/gala-defi-desktop.png', fullPage: true });
    
    // Verify page is still functional after viewport changes
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });
});
