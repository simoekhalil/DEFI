import { test as base, expect, BrowserContext, Page } from '@playwright/test';
import dappwright, { Dappwright, MetaMaskWallet } from '@tenkeylabs/dappwright';
import 'dotenv/config';

const DEFAULT_METAMASK_SEED = 'test test test test test test test test test test test junk';
const DEFAULT_METAMASK_PRIVATE_KEY =
  '0x59c6995e998f97a5a0044975f5d4d0d4f716c7e21bffb0f9e3c8d8e1a1d1b1a9';

// Trim environment variables to handle trailing newlines/spaces
const METAMASK_SEED = process.env.METAMASK_SEED?.trim() || DEFAULT_METAMASK_SEED;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY?.trim() || DEFAULT_METAMASK_PRIVATE_KEY;

// Check if we're using bundled (default) credentials
const usingBundledSeed = METAMASK_SEED === DEFAULT_METAMASK_SEED;
const usingBundledPrivateKey = METAMASK_PRIVATE_KEY === DEFAULT_METAMASK_PRIVATE_KEY;

// Fail fast if you're (accidentally) using the bundled seed/key in CI
if (process.env.CI && (usingBundledSeed || usingBundledPrivateKey)) {
  const pkEnvValue = process.env.METAMASK_PRIVATE_KEY?.trim();
  const pkRawLength = process.env.METAMASK_PRIVATE_KEY?.length || 0;
  const pkTrimmedLength = pkEnvValue?.length || 0;
  const pkPreview = pkEnvValue ? `${pkEnvValue.substring(0, 10)}...` : 'undefined';
  const defaultPreview = `${DEFAULT_METAMASK_PRIVATE_KEY.substring(0, 10)}...`;
  const actualPkUsed = METAMASK_PRIVATE_KEY.substring(0, 10) + '...';
  throw new Error(
    `Refusing to run in CI with bundled MetaMask credentials.\n` +
    `METAMASK_PRIVATE_KEY env var is ${pkEnvValue ? `set (raw length: ${pkRawLength}, trimmed: ${pkTrimmedLength}, preview: ${pkPreview})` : 'NOT set'}.\n` +
    `Expected: 64 hex characters (private key without 0x prefix).\n` +
    `METAMASK_PRIVATE_KEY constant value: ${actualPkUsed}\n` +
    `DEFAULT_METAMASK_PRIVATE_KEY: ${defaultPreview}\n` +
    `Using bundled seed: ${usingBundledSeed}, Using bundled private key: ${usingBundledPrivateKey}\n` +
    `Match: ${METAMASK_PRIVATE_KEY === DEFAULT_METAMASK_PRIVATE_KEY}\n` +
    `Please verify METAMASK_PRIVATE_KEY is set correctly as a GitHub repository secret.`
  );
}

const METAMASK_PASSWORD = process.env.METAMASK_PASSWORD || 'StrongPassword123!';
const METAMASK_VERSION = process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion;

type Fixtures = {
  walletContext: BrowserContext;
  wallet: Dappwright;
  page: Page;
};

export const test = base.extend<Fixtures>({
  walletContext: [
    async ({}, use) => {
      console.log('\n[WALLET] ========== NEW WALLET CONTEXT SETUP ==========');
      console.log('[WALLET] Using bundled seed:', usingBundledSeed);
      console.log('[WALLET] Using bundled private key:', usingBundledPrivateKey);
      console.log('[WALLET] MetaMask version:', METAMASK_VERSION);
      
      const bootstrapOptions: Parameters<typeof dappwright.bootstrap>[1] = {
        wallet: 'metamask',
        version: METAMASK_VERSION,
        password: METAMASK_PASSWORD,
        headless: process.env.HEADLESS !== 'false',
      };

      // Use seed ONLY if we're using both bundled seed and bundled private key
      // Otherwise we'll import the private key after setup
      if (usingBundledSeed && usingBundledPrivateKey) {
        bootstrapOptions.seed = METAMASK_SEED;
        console.log('[WALLET] Using bundled seed phrase (length:', METAMASK_SEED.split(' ').length, 'words)');
      } else if (!usingBundledPrivateKey) {
        // We have a custom private key, so use a minimal seed for initial setup
        bootstrapOptions.seed = METAMASK_SEED;
        console.log('[WALLET] Using seed for initial setup, will import private key');
      }

      console.log('[WALLET] Starting dappwright.bootstrap...');
      
      // Add longer timeout for bootstrap to handle slow MetaMask initialization
      const [wallet, , context] = await Promise.race([
        dappwright.bootstrap('', bootstrapOptions),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Bootstrap timeout after 60 seconds')), 60000)
        )
      ]);
      
      console.log('[WALLET] ✓ Bootstrap complete');
      
      // Add extra delay to let MetaMask fully initialize
      console.log('[WALLET] Waiting for MetaMask to stabilize...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // wallet.unlock() often hangs or is unnecessary after bootstrap
      // Try it with a timeout, but continue if it fails
      console.log('[WALLET] Attempting to unlock wallet (with timeout)...');
      try {
        await Promise.race([
          wallet.unlock(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Unlock timeout')), 10000))
        ]);
        console.log('[WALLET] ✓ Wallet unlocked');
      } catch (err) {
        console.log('[WALLET] Unlock failed or timed out, continuing anyway:', err.message);
      }

      // Import private key BEFORE adding/switching networks
      if (!(usingBundledSeed && usingBundledPrivateKey)) {
        console.log('[WALLET] Importing private key:', METAMASK_PRIVATE_KEY.substring(0, 10) + '...');
        
        // FIX: Wait for MetaMask loading overlay to disappear before importing private key
        // MetaMask 12.x shows a loading overlay during initialization that blocks interactions
        console.log('[WALLET] Waiting for MetaMask to finish loading...');
        try {
          const mmPage = wallet.page; // Get MetaMask extension page
          const loadingOverlay = mmPage.locator('.mm-box.loading-overlay');
          
          // Wait for overlay to be hidden (with 45 second timeout - increased for reliability)
          await loadingOverlay.waitFor({ state: 'hidden', timeout: 45000 });
          console.log('[WALLET] ✓ MetaMask loading complete');
        } catch (err) {
          console.log('[WALLET] ⚠️ Loading overlay timeout or not found, attempting to force dismiss...');
          
          // Try to force-dismiss the overlay by injecting CSS
          try {
            await wallet.page.evaluate(() => {
              const overlay = document.querySelector('.mm-box.loading-overlay');
              if (overlay) {
                (overlay as HTMLElement).style.display = 'none';
                console.log('[WALLET] Force-dismissed overlay via CSS');
              }
            });
          } catch (e) {
            console.log('[WALLET] Could not force-dismiss overlay, continuing anyway');
          }
        }
        
        // Add extra delay to ensure MetaMask is fully ready
        await wallet.page.waitForTimeout(3000); // Increased from 2s to 3s
        
        await wallet.importPK(METAMASK_PRIVATE_KEY);
        console.log('[WALLET] ✓ Private key imported');
      }

      // Ensure correct chain
      if (process.env.CHAIN_ID && process.env.CHAIN_NAME) {
        const chainId = Number(process.env.CHAIN_ID);
        
        // Sepolia (11155111) is built-in to MetaMask, so just switch to it
        if (chainId === 11155111) {
          console.log('[WALLET] Switching to Sepolia (built-in network)...');
          await wallet.switchNetwork('Sepolia');
          console.log('[WALLET] ✓ Switched to Sepolia');
        } else {
          // For other networks, add them as custom networks
          console.log('[WALLET] Adding custom network:', process.env.CHAIN_NAME);
          await wallet.addNetwork({
            networkName: process.env.CHAIN_NAME,
            rpc: process.env.RPC_URL!,
            chainId: chainId,
            symbol: process.env.CHAIN_SYMBOL || 'ETH',
          });
          console.log('[WALLET] ✓ Network added');
          
          console.log('[WALLET] Switching to network:', process.env.CHAIN_NAME);
          await wallet.switchNetwork(process.env.CHAIN_NAME);
          console.log('[WALLET] ✓ Network switched');
        }
      }

      console.log('[WALLET] ✓ Wallet setup complete, passing context to test\n');
      await use(context);
      
      console.log('\n[WALLET] Cleaning up wallet context...');
      await context.close();
      console.log('[WALLET] ✓ Context closed');
      console.log('[WALLET] ========== WALLET CONTEXT CLEANUP COMPLETE ==========\n');
    },
    { scope: 'worker' }, // Worker scope - one wallet for all tests in the file
  ],

  page: async ({ walletContext }, use) => {
    const page = await walletContext.newPage();
    await use(page);
    // Don't close the page - let the worker-scoped context handle all cleanup
  },

  wallet: async ({ walletContext }, use) => {
    const metamask = await dappwright.getWallet('metamask', walletContext);
    await use(metamask);
  },
});

export { expect };
