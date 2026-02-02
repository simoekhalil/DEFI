const fs = require('fs');
const content = fs.readFileSync('node_modules/@tenkeylabs/dappwright/dist/index.js', 'utf8');

// Look for repo patterns
const repoMatches = content.match(/repo.*['"]([\w\-]+\/[\w\-]+)['"]/gi);
if (repoMatches) {
  console.log('Found repo patterns:');
  repoMatches.forEach(m => console.log('  ', m));
}

// Look for dappwright patterns  
console.log('\nSearching for download config...');
const parts = content.split('metamask');
console.log('Found', parts.length - 1, 'metamask mentions');

// Look for "wallet" object configurations
const walletConfigs = content.match(/wallet:\s*["']metamask["']/gi);
if (walletConfigs) {
  console.log('\nFound wallet configs:', walletConfigs.length);
}

// Look for version patterns
const versionPattern = /(\d+\.\d+\.\d+)/g;
const versions = [...new Set(content.match(versionPattern) || [])];
console.log('\nVersion patterns found:', versions.slice(0, 20).join(', '));
