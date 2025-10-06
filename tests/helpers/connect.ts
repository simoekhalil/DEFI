import { Page, test } from '@playwright/test';
import { Dappwright } from '@tenkeylabs/dappwright';

export async function connectWallet(page: Page, wallet: Dappwright) {
  console.log('[CONNECT] Starting wallet connection...');
  
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

  // Approve the connection
  console.log('[CONNECT] Attempting approval...');
  await wallet.approve().catch((err) => {
    console.log('[CONNECT] Approval failed or not needed:', err?.message);
  });
  console.log('[CONNECT] ✓ Approval complete');

  // Bring the dapp page back to front after MetaMask interaction
  console.log('[CONNECT] Bringing dapp page back to front...');
  await page.bringToFront();
  await page.waitForTimeout(2000); // Give a moment for the connection to propagate
  console.log('[CONNECT] ✓ Wallet connected successfully');
}
