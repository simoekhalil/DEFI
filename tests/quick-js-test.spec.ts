import { test, expect } from '@playwright/test';

test.describe('Quick JavaScript Loading Test', () => {
  test('should detect JavaScript loading status', async ({ page }) => {
    console.log('=== QUICK JS LOADING TEST STARTING ===');
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Navigate to the website
      console.log('Step 1: Navigating to main page...');
      await page.goto('/', { timeout: 10000 });
      console.log('✅ Navigation completed');
      
      console.log('Step 2: Waiting for DOM content loaded...');
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      console.log('✅ DOM content loaded');
      
      // Check initial state
      console.log('Step 3: Getting initial content...');
      const initialContent = await page.textContent('body');
      console.log('Initial content preview:', initialContent?.substring(0, 200) + '...');
      
      // Wait for network to settle
      console.log('Step 4: Waiting for network idle...');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      console.log('✅ Network idle achieved');
      
      // Wait a bit more for React
      console.log('Step 5: Waiting additional 2 seconds for React...');
      await page.waitForTimeout(2000);
      console.log('✅ Additional wait completed');
      
      // Check final state
      console.log('Step 6: Getting final content...');
      const finalContent = await page.textContent('body');
      console.log('Final content preview:', finalContent?.substring(0, 200) + '...');
      
      // Check if JavaScript message is still there
      const hasJsMessage = finalContent?.includes('You need to enable JavaScript to run this app');
      console.log('Still shows JS message:', hasJsMessage);
      
      // Count interactive elements
      console.log('Step 7: Counting interactive elements...');
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      const inputs = await page.locator('input').count();
      
      console.log(`Interactive elements: ${buttons} buttons, ${links} links, ${inputs} inputs`);
      
      // Take screenshot
      console.log('Step 8: Taking screenshot...');
      await page.screenshot({ path: 'tests/screenshots/quick-js-test.png', fullPage: true, timeout: 10000 });
      console.log('✅ Screenshot saved');
      
      // Try to navigate to launch page
      console.log('Step 9: Trying to navigate to /launch...');
      try {
        await page.goto('/launch', { timeout: 10000 });
        console.log('✅ Launch page navigation completed');
        
        console.log('Step 10: Waiting for launch page to load...');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        await page.waitForTimeout(1000);
        
        const launchContent = await page.textContent('body');
        console.log('Launch page content preview:', launchContent?.substring(0, 200) + '...');
        
        console.log('Step 11: Taking launch page screenshot...');
        await page.screenshot({ path: 'tests/screenshots/launch-page-quick.png', fullPage: true, timeout: 10000 });
        console.log('✅ Launch page screenshot saved');
        
      } catch (launchError) {
        console.log('❌ Launch page navigation failed:', launchError.message);
      }
      
      console.log('=== TEST COMPLETED SUCCESSFULLY ===');
      console.log('End timestamp:', new Date().toISOString());
      
    } catch (error) {
      console.log('❌ TEST FAILED with error:', error.message);
      console.log('Error stack:', error.stack);
      throw error;
    }
  });
});

