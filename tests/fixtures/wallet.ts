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
      const seed = process.env.METAMASK_SEED!;
      const password = process.env.METAMASK_PASSWORD || 'StrongPassword123!';
      const version = process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion;

      const [wallet, , context] = await dappwright.bootstrap('', {
        wallet: 'metamask',
        version,
        seed,
        password,
        headless: process.env.HEADLESS !== 'false',
      });

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
