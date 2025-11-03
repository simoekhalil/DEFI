import { Page, test } from '@playwright/test';
import { Dappwright } from '@tenkeylabs/dappwright';

/**
 * Wait for loading spinners to disappear
 */
export async function waitForLoadersToDisappear(page: Page) {
  const loader = page.locator('.loader, [class*="loading"], [class*="spinner"]');
  const isVisible = await loader.isVisible().catch(() => false);
  if (isVisible) {
    console.log('[HELPER] Waiting for loader to disappear...');
    await loader.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
      console.log('[HELPER] Loader still visible after 30s, continuing anyway...');
    });
  }
}

/**
 * Check if wallet is already connected by looking for the connect button
 */
export async function isWalletConnected(page: Page): Promise<boolean> {
  try {
    const connectButton = page.getByRole('button', { name: /connect/i }).first();
    const isVisible = await connectButton.isVisible({ timeout: 2000 }).catch(() => false);
    return !isVisible; // If connect button is NOT visible, wallet is connected
  } catch (err) {
    console.log('[CONNECT] Could not check connection state:', err?.message);
    return false;
  }
}

/**
 * Connect wallet only if not already connected (SMART CONNECTION)
 */
export async function ensureWalletConnected(page: Page, wallet: Dappwright) {
  console.log('[CONNECT] Checking wallet connection status...');
  
  const alreadyConnected = await isWalletConnected(page);
  
  if (alreadyConnected) {
    console.log('[CONNECT] ✓ Wallet already connected, checking GalaChain registration...');
    // Still bring page to front to ensure we're not on MetaMask popup
    await page.bringToFront();
    
    // Check for GalaChain registration even if wallet is connected
    const registerButton = page.getByRole('button', { name: /register/i });
    const isRegistrationNeeded = await registerButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isRegistrationNeeded) {
      console.log('[CONNECT] ⚠️  GalaChain registration required - wallet not registered yet');
      console.log('[CONNECT] This is needed to access your GALA balance on GalaChain');
      console.log('[CONNECT] Clicking Register button...');
      await registerButton.click();
      await page.waitForTimeout(2000);
      
      console.log('[CONNECT] Confirming registration transaction in MetaMask...');
      try {
        await wallet.confirmTransaction();
        console.log('[CONNECT] ✅ Registration transaction confirmed');
        await page.waitForTimeout(5000);
        await page.bringToFront();
        console.log('[CONNECT] ✅ Wallet registered on GalaChain - GALA balance now accessible');
      } catch (error) {
        console.log('[CONNECT] ⚠️  Registration confirmation issue:', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      console.log('[CONNECT] ✅ Wallet already registered on GalaChain');
    }
    return;
  }
  
  console.log('[CONNECT] Wallet not connected, initiating connection...');
  await connectWallet(page, wallet);
}

/**
 * Connect wallet (ALWAYS connects, even if already connected)
 * Use ensureWalletConnected() instead for better performance
 */
export async function connectWallet(page: Page, wallet: Dappwright) {
  console.log('[CONNECT] Starting wallet connection...');
  
  // Wait for any loaders to disappear
  const loader = page.locator('.loader, [class*="loading"], [class*="spinner"]');
  if (await loader.isVisible().catch(() => false)) {
    console.log('[CONNECT] Waiting for loader to disappear...');
    await loader.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
      console.log('[CONNECT] Loader still visible after 30s, continuing anyway...');
    });
  }
  
  // Trigger the app's connect - use first() to avoid strict mode violation if multiple buttons exist
  console.log('[CONNECT] Clicking connect button...');
  await page.getByRole('button', { name: /connect/i }).first().click();
  console.log('[CONNECT] ✓ Connect button clicked');

  // Wait for wallet selection dialog and click MetaMask
  console.log('[CONNECT] Waiting for wallet selection dialog...');
  await page.waitForTimeout(1000); // Give dialog time to appear
  
  console.log('[CONNECT] Clicking MetaMask option...');
  await page.getByText('MetaMask').click();
  console.log('[CONNECT] ✓ MetaMask selected');

  // Approve the connection - use a timeout to prevent hanging
  console.log('[CONNECT] Attempting approval...');
  try {
    await Promise.race([
      wallet.approve(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Approval timeout')), 10000))
    ]);
    console.log('[CONNECT] ✓ Approval complete');
  } catch (err) {
    console.log('[CONNECT] Approval not needed or auto-approved:', err?.message);
  }

  // Wait for the dapp to recognize the connection
  // Look for the "Connect" button to change or disappear
  console.log('[CONNECT] Waiting for dapp to recognize connection...');
  await page.waitForTimeout(5000);
  
  // Verify the connection by checking if we can still interact with the page
  console.log('[CONNECT] Verifying connection...');
  try {
    // Check if the connect button is still there or if it changed
    const connectButton = page.getByRole('button', { name: /connect/i }).first();
    const isVisible = await connectButton.isVisible().catch(() => false);
    if (isVisible) {
      console.log('[CONNECT] Warning: Connect button still visible, connection may not have succeeded');
    } else {
      console.log('[CONNECT] ✓ Connect button no longer visible - connection likely successful');
    }
  } catch (err) {
    console.log('[CONNECT] Could not verify connection state:', err?.message);
  }
  
  console.log('[CONNECT] ✓ Wallet connection process complete');
  
  // CRITICAL: Bring the dapp page back to front after wallet operations
  // MetaMask popup may have taken focus, so we need to explicitly return to the main page
  console.log('[CONNECT] Returning focus to dapp page...');
  await page.bringToFront();
  await page.waitForTimeout(1000); // Let the page settle
  console.log('[CONNECT] ✓ Dapp page now in focus');
  
  // ========================================
  // CRITICAL: Check for GalaChain Registration
  // ========================================
  console.log('[CONNECT] Checking GalaChain registration status...');
  const registerButton = page.getByRole('button', { name: /register/i });
  const isRegistrationNeeded = await registerButton.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (isRegistrationNeeded) {
    console.log('[CONNECT] ⚠️  GalaChain registration required - wallet not registered yet');
    console.log('[CONNECT] This is needed to access your GALA balance on GalaChain');
    console.log('[CONNECT] Clicking Register button...');
    await registerButton.click();
    await page.waitForTimeout(2000);
    
    console.log('[CONNECT] Confirming registration transaction in MetaMask...');
    try {
      await wallet.confirmTransaction();
      console.log('[CONNECT] ✅ Registration transaction confirmed');
      await page.waitForTimeout(5000); // Wait for registration to complete
      
      // Bring page back to front after MetaMask interaction
      await page.bringToFront();
      await page.waitForTimeout(1000);
      
      console.log('[CONNECT] ✅ Wallet registered on GalaChain - GALA balance now accessible');
    } catch (error) {
      console.log('[CONNECT] ⚠️  Registration confirmation issue:', error instanceof Error ? error.message : 'Unknown error');
      console.log('[CONNECT] Note: Registration may have auto-completed');
    }
  } else {
    console.log('[CONNECT] ✅ Wallet already registered on GalaChain');
  }
}
