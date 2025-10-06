import { test as base, expect, BrowserContext } from '@playwright/test';
import dappwright, { Dappwright, MetaMaskWallet } from '@tenkeylabs/dappwright';
import 'dotenv/config';

type Fixtures = {
  context: BrowserContext;
  wallet: Dappwright;
};

export const test = base.extend<Fixtures>({
  context: [
    async ({}, use) => {
      const seed = process.env.METAMASK_SEED;
      const privateKey = process.env.METAMASK_PRIVATE_KEY;
      const password = process.env.METAMASK_PASSWORD || 'StrongPassword123!';
      const version = process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion;

      if (!seed && !privateKey) {
        throw new Error('METAMASK_SEED or METAMASK_PRIVATE_KEY must be provided');
      }

      const bootstrapOptions: Parameters<typeof dappwright.bootstrap>[1] = {
        wallet: 'metamask',
        version,
        password,
        headless: process.env.HEADLESS !== 'false',
      };

      if (seed) {
        bootstrapOptions.seed = seed;
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

      if (privateKey) {
        await wallet.importPK(privateKey);
      }
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],

  wallet: async ({ context }, use) => {
    const metamask = await dappwright.getWallet('metamask', context);
    await use(metamask);
  },
});

export { expect };
