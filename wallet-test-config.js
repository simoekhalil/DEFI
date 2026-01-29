// Wallet Testing Configuration
// This file shows how to safely configure wallet testing

const walletTestConfig = {
  // Safe to share - public information
  testNetwork: {
    name: 'Gala Testnet',
    chainId: '1337', // Example chain ID
    rpcUrl: 'https://testnet-rpc.gala.com', // Example RPC
  },
  
  // Safe to share - public wallet address (Gala wallet format)
  testWalletAddress: process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be',
  
  // Safe to share - test token information
  testTokens: {
    GALA: {
      symbol: 'GALA',
      name: 'Gala',
      decimals: 18,
      address: '0x1234567890123456789012345678901234567890' // Example
    }
  },
  
  // NEVER put private keys in code files!
  // Use environment variables for sensitive data
  getPrivateKey: () => {
    return process.env.TEST_PRIVATE_KEY; // Only from environment
  },
  
  // Wallet connection options
  walletOptions: [
    'MetaMask',
    'WalletConnect',
    'Coinbase Wallet',
    'Trust Wallet'
  ]
};

module.exports = walletTestConfig;

// Usage example:
console.log('🔧 Wallet Test Configuration');
console.log('============================');
console.log(`Network: ${walletTestConfig.testNetwork.name}`);
console.log(`Chain ID: ${walletTestConfig.testNetwork.chainId}`);
console.log(`Test Address: ${walletTestConfig.testWalletAddress}`);
console.log(`Available Wallets: ${walletTestConfig.walletOptions.join(', ')}`);

// Security reminder
console.log('\n🔒 SECURITY REMINDER:');
console.log('- NEVER commit private keys to version control');
console.log('- Use environment variables for sensitive data');
console.log('- Test wallet addresses are safe to share');
console.log('- Private keys should ONLY be in local .env files');
