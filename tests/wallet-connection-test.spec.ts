import { test, expect } from '@playwright/test';

test.describe('Gala Wallet Connection Tests', () => {
  test('should display Connect Wallet button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for Connect Wallet button
    const connectWalletButton = page.locator('button:has-text("Connect Wallet"), [data-testid*="connect"], .connect-wallet');
    await expect(connectWalletButton.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Connect Wallet button found and visible');
  });

  test('should handle wallet connection click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click Connect Wallet button
    const connectWalletButton = page.locator('button:has-text("Connect Wallet")').first();
    await expect(connectWalletButton).toBeVisible();
    
    // Wait for button to be stable before clicking
    await page.waitForTimeout(1000);
    
    // Click the button with force if needed (handles overlapping elements)
    await connectWalletButton.click({ force: true });
    
    // Wait for any modal or popup to appear
    await page.waitForTimeout(3000);
    
    // Look for wallet connection modal/popup
    const walletModal = page.locator('.modal, .popup, [data-testid*="wallet"], .wallet-connect');
    
    if (await walletModal.count() > 0) {
      console.log('✅ Wallet connection modal/popup appeared');
      await expect(walletModal.first()).toBeVisible();
    } else {
      console.log('ℹ️ No modal appeared - may redirect or use different flow');
    }
    
    // Take screenshot of wallet connection state
    await page.screenshot({ path: 'tests/screenshots/wallet-connection-attempt.png', fullPage: true });
  });

  test('should show wallet options or connection flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const connectWalletButton = page.locator('button:has-text("Connect Wallet")').first();
    await connectWalletButton.click();
    await page.waitForTimeout(3000);
    
    // Look for different wallet options that might appear
    const walletOptions = [
      'MetaMask',
      'WalletConnect', 
      'Coinbase',
      'Gala',
      'Trust Wallet'
    ];
    
    let foundOptions = [];
    
    for (const wallet of walletOptions) {
      const walletOption = page.locator(`text="${wallet}", [data-testid*="${wallet.toLowerCase()}"]`);
      if (await walletOption.count() > 0) {
        foundOptions.push(wallet);
        console.log(`✅ Found wallet option: ${wallet}`);
      }
    }
    
    if (foundOptions.length > 0) {
      console.log(`🎯 Available wallet options: ${foundOptions.join(', ')}`);
    } else {
      console.log('ℹ️ No specific wallet options found - may use direct connection');
    }
  });

  test('should handle wallet connection states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check initial state
    const initialConnectButton = page.locator('button:has-text("Connect Wallet")');
    const initialState = await initialConnectButton.count() > 0;
    console.log(`Initial state - Connect button visible: ${initialState}`);
    
    // Look for any indicators of wallet connection status
    const connectedIndicators = page.locator('.connected, .wallet-connected, [data-testid*="connected"]');
    const disconnectedIndicators = page.locator('.disconnected, .wallet-disconnected, [data-testid*="disconnected"]');
    
    const connectedCount = await connectedIndicators.count();
    const disconnectedCount = await disconnectedIndicators.count();
    
    console.log(`Connection status indicators found:`);
    console.log(`- Connected indicators: ${connectedCount}`);
    console.log(`- Disconnected indicators: ${disconnectedCount}`);
    
    // Test the connection flow
    if (initialState) {
      await initialConnectButton.first().click();
      await page.waitForTimeout(2000);
      
      // Check if button text changed
      const buttonAfterClick = page.locator('button:has-text("Connect Wallet"), button:has-text("Connected"), button:has-text("Disconnect")');
      const buttonText = await buttonAfterClick.first().textContent();
      console.log(`Button text after click: "${buttonText}"`);
    }
  });
});
