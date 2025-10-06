import { MetaMaskWallet } from '@tenkeylabs/dappwright';

const version = process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion;

console.log(`Downloading MetaMask extension (version: ${version})...`);
await MetaMaskWallet.download({ wallet: 'metamask', version });
console.log('MetaMask download complete.');
