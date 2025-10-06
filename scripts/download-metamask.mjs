import { MetaMaskWallet } from '@tenkeylabs/dappwright';

const version = process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion;

// dappwright serialises MetaMask downloads by only letting the Playwright
// "primary" worker (index 0) perform the actual download. When the helper
// script is executed outside of the Playwright test runner there is no worker
// index defined, so dappwright keeps waiting for a non-existent primary worker.
// Explicitly mark the current process as the primary worker to avoid the wait.
if (!process.env.TEST_PARALLEL_INDEX) {
  process.env.TEST_PARALLEL_INDEX = '0';
}

console.log(`Downloading MetaMask extension (version: ${version})...`);
await MetaMaskWallet.download({ wallet: 'metamask', version });
console.log('MetaMask download complete.');
