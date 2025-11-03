/**
 * Gala Launchpad SDK Helper
 * 
 * ✅ UPDATED FOR SDK v3.18.0 - Official @gala-chain/launchpad-sdk package
 * 
 * Provides utilities for integrating the SDK with Playwright tests:
 * - SDK instance management
 * - Token discovery by phase
 * - Balance queries
 * - Price calculations
 */

// ✅ Using official @gala-chain/launchpad-sdk v3.18.0
import { createLaunchpadSDK } from '@gala-chain/launchpad-sdk';

let sdkInstance: any = null;

/**
 * Get or create SDK instance (singleton pattern)
 */
export async function getSDK() {
  if (!sdkInstance) {
    const wallet = process.env.METAMASK_PRIVATE_KEY || process.env.WALLET_SEED_PHRASE;
    
    if (!wallet) {
      throw new Error('No wallet credentials found in environment. Set METAMASK_PRIVATE_KEY or WALLET_SEED_PHRASE.');
    }

    sdkInstance = createLaunchpadSDK({
      wallet,
      env: 'STAGE',
      config: {
        debug: true,
        timeout: 30000
      }
    });

    console.log('[SDK] ✅ Initialized successfully!');
    console.log('[SDK] Address:', sdkInstance.getEthereumAddress());
  }
  
  return sdkInstance;
}

/**
 * Token phase types
 */
export type TokenPhase = 'early' | 'mid' | 'late' | 'graduated';

/**
 * Find a token in a specific phase of the bonding curve
 */
export async function findTokenByPhase(phase: TokenPhase) {
  const sdk = await getSDK();
  
  console.log(`[SDK] Searching for ${phase}-phase token...`);
  
  // Fetch recent pools
  const pools = await sdk.fetchPools({ type: 'recent', limit: 100 });
  console.log(`[SDK] Found ${pools.total} total pools, checking ${pools.pools.length} pools`);
  
  for (const pool of pools.pools) {
    try {
      // Get detailed pool state
      const details = await sdk.fetchPoolDetails(pool.tokenName);
      
      // Calculate progress
      const progress = parseFloat(details.currentSupply) / parseFloat(details.maxSupply);
      const progressPercent = (progress * 100).toFixed(2);
      
      // Check phase match
      if (phase === 'early' && progress < 0.3) {
        console.log(`[SDK] ✅ Found early-phase token: ${pool.tokenName} (${progressPercent}% complete)`);
        return { ...pool, details, progress };
      }
      
      if (phase === 'mid' && progress >= 0.3 && progress < 0.8) {
        console.log(`[SDK] ✅ Found mid-phase token: ${pool.tokenName} (${progressPercent}% complete)`);
        return { ...pool, details, progress };
      }
      
      if (phase === 'late' && progress >= 0.8 && progress < 1.0) {
        console.log(`[SDK] ✅ Found late-phase token: ${pool.tokenName} (${progressPercent}% complete)`);
        return { ...pool, details, progress };
      }
      
      if (phase === 'graduated' && details.saleStatus === 'FINALIZED') {
        console.log(`[SDK] ✅ Found graduated token: ${pool.tokenName}`);
        return { ...pool, details, progress: 1.0 };
      }
      
    } catch (error) {
      console.log(`[SDK] ⚠️  Error checking ${pool.tokenName}:`, error.message);
      continue;
    }
  }
  
  console.log(`[SDK] ❌ No ${phase}-phase token found`);
  return null;
}

/**
 * Get GALA balance for current wallet
 */
export async function getGalaBalance() {
  const sdk = await getSDK();
  const result = await sdk.fetchGalaBalance();
  const userAddress = await sdk.getAddress();
  
  // Check if result is an object with balance property or a string
  const balanceValue = typeof result === 'object' && result.balance ? result.balance : result;
  
  console.log(`[SDK] GALA Balance: ${balanceValue} GALA`);
  console.log(`[SDK] User Address: ${userAddress}`);
  
  return {
    balance: balanceValue,
    userAddress
  };
}

/**
 * Get token balance for current wallet
 */
export async function getTokenBalance(tokenName: string) {
  const sdk = await getSDK();
  const balance = await sdk.fetchTokenBalance({ tokenName });
  
  console.log(`[SDK] ${tokenName} Balance: ${balance.quantity} tokens ($${balance.holdingPriceUsd})`);
  return balance;
}

/**
 * Calculate buy amount (how many tokens for X GALA)
 */
export async function calculateBuy(tokenName: string, galaAmount: string) {
  const sdk = await getSDK();
  const quote = await sdk.calculateBuyAmount({
    tokenName,
    amount: galaAmount,
    type: 'native'
  });
  
  console.log(`[SDK] Buy Quote: ${galaAmount} GALA → ${quote.amount} ${tokenName}`);
  console.log(`[SDK] Transaction Fee: ${quote.transactionFee} GALA`);
  console.log(`[SDK] RBC Fee: ${quote.reverseBondingCurveFee} GALA`);
  
  return quote;
}

/**
 * Calculate sell amount (how much GALA for X tokens)
 */
export async function calculateSell(tokenName: string, tokenAmount: string) {
  const sdk = await getSDK();
  const quote = await sdk.calculateSellAmount({
    tokenName,
    amount: tokenAmount,
    type: 'exact'  // 'exact' = selling exact token amount
  });
  
  console.log(`[SDK] Sell Quote: ${tokenAmount} ${tokenName} → ${quote.amount} GALA`);
  console.log(`[SDK] Transaction Fee: ${quote.transactionFee} GALA`);
  console.log(`[SDK] RBC Fee: ${quote.reverseBondingCurveFee} GALA`);
  
  return quote;
}

/**
 * Get pool details for a token
 */
export async function getPoolDetails(tokenName: string) {
  const sdk = await getSDK();
  
  console.log(`[SDK] Fetching pool details for: ${tokenName}`);
  
  // Fetch detailed pool state directly from GalaChain
  // No need to fetch pools first since we already have the token name
  const details = await sdk.fetchPoolDetailsForCalculation(tokenName);
  
  console.log(`[SDK] Pool Details:`);
  console.log(`[SDK]   Current Supply: ${details.currentSupply}`);
  console.log(`[SDK]   Max Supply: ${details.maxSupply}`);
  console.log(`[SDK]   Remaining: ${details.remainingTokens}`);
  
  return details;
}

/**
 * Get all test tokens (one for each phase)
 */
export async function getTestTokens() {
  console.log('[SDK] ========================================');
  console.log('[SDK]   Finding Test Tokens for All Phases');
  console.log('[SDK] ========================================\n');
  
  const tokens = {
    earlyPhase: await findTokenByPhase('early'),
    midPhase: await findTokenByPhase('mid'),
    latePhase: await findTokenByPhase('late'),
    graduated: await findTokenByPhase('graduated')
  };
  
  console.log('\n[SDK] ========================================');
  console.log('[SDK]   Test Token Discovery Complete');
  console.log('[SDK] ========================================');
  console.log('[SDK] Early Phase:', tokens.earlyPhase?.tokenName || 'NOT FOUND');
  console.log('[SDK] Mid Phase:', tokens.midPhase?.tokenName || 'NOT FOUND');
  console.log('[SDK] Late Phase:', tokens.latePhase?.tokenName || 'NOT FOUND');
  console.log('[SDK] Graduated:', tokens.graduated?.tokenName || 'NOT FOUND');
  console.log('[SDK] ========================================\n');
  
  return tokens;
}

/**
 * Cleanup SDK resources
 */
export function cleanupSDK() {
  if (sdkInstance) {
    sdkInstance.cleanup();
    sdkInstance = null;
    console.log('[SDK] Cleaned up resources');
  }
}

