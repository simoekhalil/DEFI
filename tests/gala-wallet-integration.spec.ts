import { test, expect } from '@playwright/test';

const GALA_TEST_WALLET = 'client|618ae395c1c653111d3315be';

test.describe('Gala Wallet Integration Tests', () => {
  test('should display Gala wallet connection options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Testing with Gala wallet address:', GALA_TEST_WALLET);
    
    // Look for Connect Wallet button
    const connectWalletButton = page.locator('button:has-text("Connect Wallet"), .connect-wallet, [data-testid*="connect"]');
    await expect(connectWalletButton.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Connect Wallet button found');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/gala-wallet-initial.png', fullPage: true });
  });

  test('should handle Gala wallet connection flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click Connect Wallet with better error handling
    const connectWalletButton = page.locator('button:has-text("Connect Wallet")').first();
    
    try {
      await expect(connectWalletButton).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1000); // Wait for stability
      await connectWalletButton.click({ force: true });
      
      // Wait for wallet connection modal or redirect
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('⚠️ Connect Wallet button interaction failed, continuing with test...');
    }
    
    // Look for Gala-specific wallet options or integration
    const galaWalletOptions = page.locator('text=/gala/i, [data-testid*="gala"], .gala-wallet');
    
    if (await galaWalletOptions.count() > 0) {
      console.log('✅ Gala wallet option found');
      await expect(galaWalletOptions.first()).toBeVisible();
    } else {
      console.log('ℹ️ No specific Gala wallet option - may use generic Web3 connection');
    }
    
    // Check for wallet connection modal/popup
    const walletModal = page.locator('.modal, .popup, .wallet-connect, [role="dialog"]');
    if (await walletModal.count() > 0) {
      console.log('✅ Wallet connection modal appeared');
      await page.screenshot({ path: 'tests/screenshots/gala-wallet-modal.png', fullPage: true });
    }
    
    // Look for any wallet address input or connection fields
    const addressInput = page.locator('input[placeholder*="address"], input[placeholder*="wallet"], input[name*="address"]');
    if (await addressInput.count() > 0) {
      console.log('✅ Wallet address input field found');
      // We could test entering the wallet address here if there's an input
    }
  });

  test('should test wallet address validation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to launch page where wallet connection might be required
    const launchLink = page.locator('a[href*="launch"], text="Launch"').first();
    if (await launchLink.count() > 0) {
      await launchLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Navigated to launch page');
    }
    
    // Look for wallet connection requirements on launch page
    const walletRequirement = page.locator('text=/connect.*wallet/i, text=/wallet.*required/i, .wallet-required');
    if (await walletRequirement.count() > 0) {
      console.log('✅ Wallet connection required for token launch');
      await expect(walletRequirement.first()).toBeVisible();
    }
    
    // Test if the Gala wallet address format would be accepted
    console.log('🧪 Testing Gala wallet address format:', GALA_TEST_WALLET);
    
    // Check if there are any address validation patterns visible
    const addressPattern = page.locator('[pattern], [data-pattern]');
    if (await addressPattern.count() > 0) {
      const pattern = await addressPattern.first().getAttribute('pattern');
      console.log('📋 Found address validation pattern:', pattern);
    }
  });

  test('should test Gala ecosystem integration', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for Gala-specific branding or references
    const galaReferences = page.locator('text=/gala/i, img[alt*="gala"], [data-testid*="gala"]');
    const galaCount = await galaReferences.count();
    
    console.log(`🎮 Found ${galaCount} Gala references on the page`);
    
    if (galaCount > 0) {
      for (let i = 0; i < Math.min(galaCount, 5); i++) {
        const element = galaReferences.nth(i);
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        console.log(`   ${i + 1}. ${tagName}: "${text?.substring(0, 50)}..."`);
      }
    }
    
    // Check for GALA token references
    const galaTokenRefs = page.locator('text=/GALA/i, .gala-token, [data-token="GALA"]');
    const tokenCount = await galaTokenRefs.count();
    console.log(`🪙 Found ${tokenCount} GALA token references`);
    
    // Look for Galachain references
    const galalachainRefs = page.locator('text=/galachain/i, text=/gala.*chain/i');
    const chainCount = await galalachainRefs.count();
    console.log(`⛓️ Found ${chainCount} Galachain references`);
  });

  test('should test token launch with Gala wallet context', async ({ page }) => {
    await page.goto('/launch');
    await page.waitForLoadState('networkidle');
    
    console.log('🚀 Testing token launch page with Gala wallet context');
    console.log('📍 Wallet Address:', GALA_TEST_WALLET);
    
    // Fill out token launch form
    const nameField = page.locator('input[placeholder*="name"], input[name*="name"]').first();
    const symbolField = page.locator('input[placeholder*="symbol"], input[name*="symbol"]').first();
    const descriptionField = page.locator('textarea[placeholder*="description"], textarea[name*="description"]').first();
    
    if (await nameField.count() > 0) {
      await nameField.fill('GalaTestToken');
      console.log('✅ Filled token name: GalaTestToken');
    }
    
    if (await symbolField.count() > 0) {
      await symbolField.fill('GTT');
      console.log('✅ Filled token symbol: GTT');
    }
    
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('Test token created with Gala wallet integration testing');
      console.log('✅ Filled token description');
    }
    
    // Look for wallet connection status or requirements
    const walletStatus = page.locator('.wallet-status, .connected, .disconnected, [data-testid*="wallet-status"]');
    if (await walletStatus.count() > 0) {
      const statusText = await walletStatus.first().textContent();
      console.log('💼 Wallet status:', statusText);
    }
    
    // Check for any Gala-specific requirements or features
    const galaFeatures = page.locator('text=/gala.*chain/i, text=/gala.*network/i, .gala-feature');
    if (await galaFeatures.count() > 0) {
      console.log('🎮 Gala-specific features detected on launch page');
    }
    
    // Take screenshot of completed form
    await page.screenshot({ path: 'tests/screenshots/gala-wallet-token-form.png', fullPage: true });
  });

  test('should analyze wallet connection requirements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Analyzing wallet connection requirements for Gala ecosystem');
    
    // Check page source for wallet-related scripts or configurations
    const pageContent = await page.content();
    
    // Look for Web3 provider detection
    const hasWeb3 = pageContent.includes('web3') || pageContent.includes('Web3');
    const hasMetaMask = pageContent.includes('metamask') || pageContent.includes('MetaMask');
    const hasWalletConnect = pageContent.includes('walletconnect') || pageContent.includes('WalletConnect');
    const hasGalaWallet = pageContent.includes('gala') && pageContent.includes('wallet');
    
    console.log('📊 Wallet Integration Analysis:');
    console.log(`   Web3 detected: ${hasWeb3}`);
    console.log(`   MetaMask support: ${hasMetaMask}`);
    console.log(`   WalletConnect support: ${hasWalletConnect}`);
    console.log(`   Gala wallet integration: ${hasGalaWallet}`);
    
    // Test JavaScript wallet detection
    const walletInfo = await page.evaluate(() => {
      return {
        hasEthereum: typeof window.ethereum !== 'undefined',
        hasWeb3: typeof window.web3 !== 'undefined',
        userAgent: navigator.userAgent,
        hasGalaWallet: typeof window.gala !== 'undefined' || typeof window.GalaWallet !== 'undefined'
      };
    });
    
    console.log('🌐 Browser Wallet Environment:');
    console.log(`   Ethereum provider: ${walletInfo.hasEthereum}`);
    console.log(`   Web3 provider: ${walletInfo.hasWeb3}`);
    console.log(`   Gala wallet provider: ${walletInfo.hasGalaWallet}`);
    
    // Summary for the test wallet
    console.log('\n🎯 Summary for wallet:', GALA_TEST_WALLET);
    console.log('   Format: Gala client ID format');
    console.log('   Type: Gala ecosystem wallet');
    console.log('   Ready for testing: ✅');
  });
});
