import { test as base, expect, BrowserContext, Page } from '@playwright/test';
import dappwright, { Dappwright, MetaMaskWallet } from '@tenkeylabs/dappwright';
import 'dotenv/config';

const DEFAULT_METAMASK_SEED = 'test test test test test test test test test test test junk';
const DEFAULT_METAMASK_PRIVATE_KEY =
  '0x59c6995e998f97a5a0044975f5d4d0d4f716c7e21bffb0f9e3c8d8e1a1d1b1a9';

const METAMASK_SEED = process.env.METAMASK_SEED || DEFAULT_METAMASK_SEED;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY || DEFAULT_METAMASK_PRIVATE_KEY;
const usingBundledSeed =
  !process.env.METAMASK_SEED || process.env.METAMASK_SEED === DEFAULT_METAMASK_SEED;
const usingBundledPrivateKey =
  !process.env.METAMASK_PRIVATE_KEY ||
  process.env.METAMASK_PRIVATE_KEY === DEFAULT_METAMASK_PRIVATE_KEY;

// Fail fast if you're (accidentally) using the bundled seed/key in CI
if (process.env.CI && (usingBundledSeed || usingBundledPrivateKey)) {
  throw new Error('Refusing to run in CI with bundled MetaMask seed/private key. Set METAMASK_SEED or METAMASK_PRIVATE_KEY secrets.');
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
      console.log('[WALLET] Starting wallet context setup...');
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
      const [wallet, , context] = await dappwright.bootstrap('', bootstrapOptions);
      console.log('[WALLET] ✓ Bootstrap complete');

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
        await wallet.importPK(METAMASK_PRIVATE_KEY);
        console.log('[WALLET] ✓ Private key imported');
      }

      // Ensure correct chain (idempotent if already added)
      if (process.env.RPC_URL && process.env.CHAIN_ID && process.env.CHAIN_NAME) {
        console.log('[WALLET] Adding custom network:', process.env.CHAIN_NAME);
        await wallet.addNetwork({
          networkName: process.env.CHAIN_NAME,
          rpc: process.env.RPC_URL,
          chainId: Number(process.env.CHAIN_ID),
          symbol: process.env.CHAIN_SYMBOL || 'ETH',
        });
        console.log('[WALLET] ✓ Network added');
        
        console.log('[WALLET] Switching to network:', process.env.CHAIN_NAME);
        await wallet.switchNetwork(process.env.CHAIN_NAME);
        console.log('[WALLET] ✓ Network switched');
      }

      console.log('[WALLET] ✓ Wallet setup complete, passing context to test');
      await use(context);
      
      console.log('[WALLET] Closing wallet context...');
      await context.close();
      console.log('[WALLET] ✓ Context closed');
    },
    { scope: 'worker' },
  ],

  page: async ({ walletContext }, use) => {
    const page = await walletContext.newPage();
    await use(page);
    await page.close();
  },

  wallet: async ({ walletContext }, use) => {
    const metamask = await dappwright.getWallet('metamask', walletContext);
    await use(metamask);
  },
});

export { expect };
