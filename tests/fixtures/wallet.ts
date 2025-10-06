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
      const bootstrapOptions: Parameters<typeof dappwright.bootstrap>[1] = {
        wallet: 'metamask',
        version: METAMASK_VERSION,
        password: METAMASK_PASSWORD,
        headless: process.env.HEADLESS !== 'false',
      };

      if (METAMASK_SEED) {
        bootstrapOptions.seed = METAMASK_SEED;
      }

      const [wallet, , context] = await dappwright.bootstrap('', bootstrapOptions);

      if (process.env.RPC_URL && process.env.CHAIN_ID && process.env.CHAIN_NAME) {
        await wallet.addNetwork({
          networkName: process.env.CHAIN_NAME,
          rpc: process.env.RPC_URL,
          chainId: Number(process.env.CHAIN_ID),
          symbol: process.env.CHAIN_SYMBOL || 'ETH',
        });
        await wallet.switchNetwork(process.env.CHAIN_NAME);
      }

      await wallet.unlock();

      if (!(usingBundledSeed && usingBundledPrivateKey)) {
        await wallet.importPK(METAMASK_PRIVATE_KEY);
      }
      await use(context);
      await context.close();
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
