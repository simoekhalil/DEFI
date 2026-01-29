import { Page, expect } from '@playwright/test';

export class NetworkHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to a URL with retry logic and better error handling
   */
  async navigateWithRetry(url: string, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🌐 Navigation attempt ${attempt}/${maxRetries} to: ${url}`);
        
        await this.page.goto(url, { 
          waitUntil: 'domcontentloaded', // Faster than 'load'
          timeout: 30000 
        });
        
        // Wait for basic page structure
        await this.page.waitForLoadState('domcontentloaded');
        
        console.log(`✅ Navigation successful on attempt ${attempt}`);
        return true;
        
      } catch (error) {
        console.log(`⚠️ Navigation attempt ${attempt} failed:`, error.message.substring(0, 100));
        
        if (attempt === maxRetries) {
          console.log(`❌ All ${maxRetries} navigation attempts failed`);
          return false;
        }
        
        // Wait before retry
        await this.page.waitForTimeout(2000 * attempt);
      }
    }
    return false;
  }

  /**
   * Check if the page loaded successfully
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      // Check if we got a proper page (not error page)
      const title = await this.page.title();
      const url = this.page.url();
      
      // Check for common error indicators
      const hasErrorContent = await this.page.locator('text=/error|404|500|timeout/i').count() > 0;
      const hasJSDisabledMessage = await this.page.locator('text=/enable javascript/i').count() > 0;
      
      console.log(`📄 Page loaded - Title: "${title}", URL: ${url}`);
      
      if (hasErrorContent) {
        console.log('⚠️ Error content detected on page');
        return false;
      }
      
      if (hasJSDisabledMessage) {
        console.log('⚠️ JavaScript disabled message detected');
        // This might be expected for some tests, so we'll return true but log it
      }
      
      return true;
      
    } catch (error) {
      console.log('❌ Failed to check page load status:', error.message);
      return false;
    }
  }

  /**
   * Wait for network to be stable
   */
  async waitForNetworkStable(timeout: number = 10000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
      console.log('✅ Network is stable');
    } catch (error) {
      console.log('⚠️ Network stability timeout, continuing anyway');
    }
  }

  /**
   * Check if a URL is accessible
   */
  async isUrlAccessible(url: string): Promise<boolean> {
    try {
      const response = await this.page.request.get(url, { timeout: 10000 });
      const isAccessible = response.ok();
      console.log(`🔗 URL ${url} accessible: ${isAccessible} (status: ${response.status()})`);
      return isAccessible;
    } catch (error) {
      console.log(`❌ URL ${url} not accessible:`, error.message.substring(0, 50));
      return false;
    }
  }
}
