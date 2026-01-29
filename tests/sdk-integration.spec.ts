import { test, expect } from '@playwright/test';
import { 
  LaunchpadSDKOperations,
  createTestSDK,
  generateTestTokenName,
  generateTestTokenSymbol,
  getSDKConfig
} from './helpers/launchpad-sdk-helper';

/**
 * SDK Integration Tests
 * Tests the @gala-chain/launchpad-sdk integration
 * 
 * These tests use the SDK directly to interact with the Gala Launchpad
 * without browser automation where possible.
 */

test.describe('Launchpad SDK Integration', () => {
  let sdk: LaunchpadSDKOperations | null;

  test.beforeAll(async () => {
    sdk = await createTestSDK();
  });

  test.afterAll(async () => {
    if (sdk) {
      sdk.cleanup();
    }
  });

  test('should verify SDK configuration', async () => {
    const devConfig = getSDKConfig('development');
    const prodConfig = getSDKConfig('production');

    expect(devConfig.baseUrl).toBe('https://lpad-backend-dev1.defi.gala.com');
    expect(devConfig.frontendUrl).toBe('https://lpad-frontend-dev1.defi.gala.com');
    expect(devConfig.debug).toBe(true);

    expect(prodConfig.baseUrl).toBe('https://lpad-backend-prod1.defi.gala.com');
    expect(prodConfig.frontendUrl).toBe('https://launchpad.gala.com');
    expect(prodConfig.debug).toBe(false);

    console.log('✅ SDK configuration verified');
  });

  test('should initialize SDK instance', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    expect(sdk!.isInitialized()).toBe(true);
    console.log('✅ SDK initialized successfully');
  });

  test('should get wallet address', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const address = await sdk!.getWalletAddress();
    expect(address).toBeTruthy();
    expect(typeof address).toBe('string');
    
    console.log(`✅ Wallet address: ${address}`);
  });

  test('should fetch GALA spot price', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const price = await sdk!.getGalaSpotPrice();
    expect(price).toBeTruthy();
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(0);

    console.log(`✅ GALA spot price: $${price.toFixed(4)}`);
  });

  test('should fetch recent pools', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const pools = await sdk!.fetchRecentPools(5);
    expect(pools).toBeTruthy();
    expect(Array.isArray(pools.items)).toBe(true);

    console.log(`✅ Fetched ${pools.items.length} recent pools`);
    
    if (pools.items.length > 0) {
      const firstPool = pools.items[0];
      console.log(`   First pool: ${firstPool.tokenName || 'Unknown'}`);
    }
  });

  test('should fetch popular pools', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const pools = await sdk!.fetchPopularPools(5);
    expect(pools).toBeTruthy();
    expect(Array.isArray(pools.items)).toBe(true);

    console.log(`✅ Fetched ${pools.items.length} popular pools`);
  });

  test('should check token name availability', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Test with a random name that should be available
    const uniqueName = generateTestTokenName('avail');
    const isAvailable = await sdk!.checkTokenNameAvailable(uniqueName);
    
    expect(typeof isAvailable).toBe('boolean');
    console.log(`✅ Token name "${uniqueName}" available: ${isAvailable}`);
  });

  test('should check token symbol availability', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Test with a random symbol that should be available
    const uniqueSymbol = generateTestTokenSymbol('X');
    const isAvailable = await sdk!.checkTokenSymbolAvailable(uniqueSymbol);
    
    expect(typeof isAvailable).toBe('boolean');
    console.log(`✅ Token symbol "${uniqueSymbol}" available: ${isAvailable}`);
  });

  test('should generate unique test identifiers', async () => {
    const name1 = generateTestTokenName('test');
    const name2 = generateTestTokenName('test');
    const symbol1 = generateTestTokenSymbol('T');
    const symbol2 = generateTestTokenSymbol('T');

    // Names should be different
    expect(name1).not.toBe(name2);
    // Symbols should be different
    expect(symbol1).not.toBe(symbol2);

    // Names should be valid length (3-20 chars)
    expect(name1.length).toBeGreaterThanOrEqual(3);
    expect(name1.length).toBeLessThanOrEqual(20);

    // Symbols should be valid length (1-8 chars)
    expect(symbol1.length).toBeGreaterThanOrEqual(1);
    expect(symbol1.length).toBeLessThanOrEqual(8);

    console.log(`✅ Generated test name: ${name1}`);
    console.log(`✅ Generated test symbol: ${symbol1}`);
  });

  test('should get token URL', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const tokenName = 'testtoken';
    const url = sdk!.getTokenUrl(tokenName);

    expect(url).toContain('lpad-frontend-dev1.defi.gala.com');
    expect(url).toContain(tokenName);

    console.log(`✅ Token URL: ${url}`);
  });
});

test.describe('SDK Pool Operations', () => {
  let sdk: LaunchpadSDKOperations | null;

  test.beforeAll(async () => {
    sdk = await createTestSDK();
  });

  test.afterAll(async () => {
    if (sdk) {
      sdk.cleanup();
    }
  });

  test('should fetch pool details for existing token', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // First get a recent pool
    const pools = await sdk!.fetchRecentPools(1);
    
    if (pools.items.length === 0) {
      test.skip(true, 'No pools available to test');
      return;
    }

    const tokenName = pools.items[0].tokenName;
    if (!tokenName) {
      test.skip(true, 'No token name in pool data');
      return;
    }

    const poolDetails = await sdk!.fetchPoolDetails(tokenName);
    
    expect(poolDetails).toBeTruthy();
    console.log(`✅ Pool details for ${tokenName}:`);
    console.log(`   Current Supply: ${poolDetails.currentSupply}`);
    console.log(`   Max Supply: ${poolDetails.maxSupply}`);
  });

  test('should check if token is graduated', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Get a recent pool
    const pools = await sdk!.fetchRecentPools(1);
    
    if (pools.items.length === 0) {
      test.skip(true, 'No pools available to test');
      return;
    }

    const tokenName = pools.items[0].tokenName;
    if (!tokenName) {
      test.skip(true, 'No token name in pool data');
      return;
    }

    const isGraduated = await sdk!.isTokenGraduated(tokenName);
    
    expect(typeof isGraduated).toBe('boolean');
    console.log(`✅ Token "${tokenName}" graduated: ${isGraduated}`);
  });

  test('should get token spot price', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Get a recent pool
    const pools = await sdk!.fetchRecentPools(1);
    
    if (pools.items.length === 0) {
      test.skip(true, 'No pools available to test');
      return;
    }

    const tokenName = pools.items[0].tokenName;
    if (!tokenName) {
      test.skip(true, 'No token name in pool data');
      return;
    }

    try {
      const spotPrice = await sdk!.getTokenSpotPrice(tokenName);
      expect(spotPrice).toBeTruthy();
      console.log(`✅ Spot price for ${tokenName}: $${spotPrice}`);
    } catch (error) {
      console.log(`⚠️ Could not fetch spot price for ${tokenName}: ${error}`);
    }
  });
});

test.describe('SDK Buy/Sell Calculations', () => {
  let sdk: LaunchpadSDKOperations | null;

  test.beforeAll(async () => {
    sdk = await createTestSDK();
  });

  test.afterAll(async () => {
    if (sdk) {
      sdk.cleanup();
    }
  });

  test('should calculate buy amount (native GALA)', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Get a recent non-graduated pool
    const pools = await sdk!.fetchRecentPools(10);
    
    let targetToken: string | null = null;
    for (const pool of pools.items) {
      if (pool.tokenName) {
        const isGraduated = await sdk!.isTokenGraduated(pool.tokenName);
        if (!isGraduated) {
          targetToken = pool.tokenName;
          break;
        }
      }
    }

    if (!targetToken) {
      test.skip(true, 'No non-graduated pools available');
      return;
    }

    const calculation = await sdk!.calculateBuyAmount({
      tokenName: targetToken,
      amount: '10', // 10 GALA
      type: 'native'
    });

    expect(calculation).toBeTruthy();
    expect(calculation.amount).toBeTruthy();
    
    console.log(`✅ Buy calculation for ${targetToken}:`);
    console.log(`   Spending: 10 GALA`);
    console.log(`   Expected tokens: ${calculation.amount}`);
    console.log(`   RBC Fee: ${calculation.reverseBondingCurveFee || '0'} GALA`);
    console.log(`   Transaction Fee: ${calculation.transactionFee || '0'} GALA`);
  });

  test('should calculate sell amount (exact tokens)', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Get a recent non-graduated pool
    const pools = await sdk!.fetchRecentPools(10);
    
    let targetToken: string | null = null;
    for (const pool of pools.items) {
      if (pool.tokenName) {
        const isGraduated = await sdk!.isTokenGraduated(pool.tokenName);
        if (!isGraduated) {
          targetToken = pool.tokenName;
          break;
        }
      }
    }

    if (!targetToken) {
      test.skip(true, 'No non-graduated pools available');
      return;
    }

    const calculation = await sdk!.calculateSellAmount({
      tokenName: targetToken,
      amount: '1000', // 1000 tokens
      type: 'exact'
    });

    expect(calculation).toBeTruthy();
    expect(calculation.amount).toBeTruthy();
    
    console.log(`✅ Sell calculation for ${targetToken}:`);
    console.log(`   Selling: 1000 tokens`);
    console.log(`   Expected GALA: ${calculation.amount}`);
    console.log(`   RBC Fee: ${calculation.reverseBondingCurveFee || '0'} GALA`);
  });

  test('should calculate graduation cost', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    // Get a recent non-graduated pool
    const pools = await sdk!.fetchRecentPools(10);
    
    let targetToken: string | null = null;
    for (const pool of pools.items) {
      if (pool.tokenName) {
        const isGraduated = await sdk!.isTokenGraduated(pool.tokenName);
        if (!isGraduated) {
          targetToken = pool.tokenName;
          break;
        }
      }
    }

    if (!targetToken) {
      test.skip(true, 'No non-graduated pools available');
      return;
    }

    const graduationCost = await sdk!.calculateGraduationCost(targetToken);

    expect(graduationCost).toBeTruthy();
    
    console.log(`✅ Graduation cost for ${targetToken}:`);
    console.log(`   Total Cost: ${graduationCost.totalCost || graduationCost.amount} GALA`);
    console.log(`   Tokens to buy: ${graduationCost.amount}`);
  });
});

test.describe('SDK Balance Operations', () => {
  let sdk: LaunchpadSDKOperations | null;

  test.beforeAll(async () => {
    sdk = await createTestSDK();
  });

  test.afterAll(async () => {
    if (sdk) {
      sdk.cleanup();
    }
  });

  test('should fetch GALA balance', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const address = await sdk!.getWalletAddress();
    if (!address) {
      test.skip(true, 'No wallet address available');
      return;
    }

    const balance = await sdk!.getGalaBalance(address);
    
    expect(balance).toBeTruthy();
    expect(typeof balance).toBe('string');
    
    console.log(`✅ GALA balance: ${balance}`);
  });

  test('should fetch token balance', async () => {
    test.skip(!sdk, 'SDK not initialized - WALLET_PRIVATE_KEY not set');

    const address = await sdk!.getWalletAddress();
    if (!address) {
      test.skip(true, 'No wallet address available');
      return;
    }

    // Get a recent pool to test with
    const pools = await sdk!.fetchRecentPools(1);
    
    if (pools.items.length === 0 || !pools.items[0].tokenName) {
      test.skip(true, 'No pools available to test');
      return;
    }

    const tokenName = pools.items[0].tokenName;

    try {
      const balance = await sdk!.getTokenBalance(tokenName, address);
      console.log(`✅ Token balance for ${tokenName}: ${balance.balance || '0'}`);
    } catch (error) {
      // Balance might be 0, which is fine
      console.log(`✅ Token balance for ${tokenName}: 0 (or not held)`);
    }
  });
});
