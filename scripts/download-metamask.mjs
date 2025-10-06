// Enable corporate proxy for Node's http/https if provided
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.GLOBAL_AGENT_HTTP_PROXY;
if (proxy) {
  process.env.GLOBAL_AGENT_HTTP_PROXY = proxy;
  // must import AFTER setting the env var so it patches correctly
  await import('global-agent/bootstrap.js');
  console.log(`[proxy] Using ${process.env.GLOBAL_AGENT_HTTP_PROXY} for outbound HTTP(S)`);
}

// import dappwright only after proxy bootstrap, to be safe
const { MetaMaskWallet } = await import('@tenkeylabs/dappwright');

const version = process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion;

// dappwright waits for "primary" worker; set it when running outside PW test runner
if (!process.env.TEST_PARALLEL_INDEX) {
  process.env.TEST_PARALLEL_INDEX = '0';
}

try {
  console.log(`Downloading MetaMask extension (version: ${version})...`);
  await MetaMaskWallet.download({ wallet: 'metamask', version });
  console.log('MetaMask download complete.');
} catch (err) {
  console.error('MetaMask download failed:', err?.message || err);
  if (String(err).includes('ENETUNREACH') || String(err).includes('ECONNREFUSED')) {
    console.error([
      'Network appears unreachable from this environment.',
      'Fix one of these:',
      '  • Set HTTPS_PROXY (or HTTP_PROXY) so Node can egress through your proxy.',
      '  • Run this in an environment with outbound internet access.',
      '  • (Offline fallback) Pre-bundle the extension and skip the download (see below).',
    ].join('\n'));
  }
  process.exit(1);
}
