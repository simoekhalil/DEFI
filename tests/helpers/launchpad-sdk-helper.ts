/**
 * Gala Launchpad SDK Helper
 * Provides easy-to-use wrappers for @gala-chain/launchpad-sdk
 * 
 * @package @gala-chain/launchpad-sdk v5.0.4-beta.18
 */

import { createLaunchpadSDK } from '@gala-chain/launchpad-sdk';
import type { 
  PoolData,
  TradeResult,
  TokenBalanceInfo
} from '@gala-chain/launchpad-sdk';

// Environment configuration
const SDK_CONFIG = {
  development: {
    baseUrl: 'https://lpad-backend-dev1.defi.gala.com',
    frontendUrl: 'https://lpad-frontend-dev1.defi.gala.com',
    debug: true
  },
  production: {
    baseUrl: 'https://lpad-backend-prod1.defi.gala.com',
    frontendUrl: 'https://launchpad.gala.com',
    debug: false
  }
};

/**
 * Get SDK configuration based on environment
 */
export function getSDKConfig(env: 'development' | 'production' = 'development') {
  return SDK_CONFIG[env];
}

/**
 * Create a configured SDK instance
 * Uses wallet from environment variables if available
 */
export function createSDKInstance(options?: {
  privateKey?: string;
  environment?: 'development' | 'production';
  debug?: boolean;
}) {
  const env = options?.environment || 'development';
  const config = getSDKConfig(env);
  
  // Get private key from options or environment
  const privateKey = options?.privateKey || process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    console.warn('⚠️ No private key provided. SDK will operate in read-only mode.');
    return null;
  }

  return createLaunchpadSDK({
    wallet: privateKey,
    config: {
      baseUrl: config.baseUrl,
      debug: options?.debug ?? config.debug,
      timeout: 60000
    }
  });
}

/**
 * SDK Operations Class
 * Provides typed wrappers around SDK methods
 */
export class LaunchpadSDKOperations {
  private sdk: ReturnType<typeof createLaunchpadSDK> | null;
  private environment: 'development' | 'production';

  constructor(options?: {
    privateKey?: string;
    environment?: 'development' | 'production';
  }) {
    this.environment = options?.environment || 'development';
    this.sdk = createSDKInstance(options);
  }

  /**
   * Check if SDK is initialized and can perform operations
   */
  isInitialized(): boolean {
    return this.sdk !== null;
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.sdk) return null;
    return this.sdk.getAddress();
  }

  /**
   * Fetch GALA balance for an address
   */
  async getGalaBalance(address?: string): Promise<string> {
    if (!this.sdk) throw new Error('SDK not initialized');
    const balance = await this.sdk.fetchGalaBalance(address);
    return balance.toString();
  }

  /**
   * Fetch token balance
   */
  async getTokenBalance(tokenName: string, address: string): Promise<TokenBalanceInfo> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.fetchTokenBalance(tokenName, address);
  }

  /**
   * Check if token name is available
   */
  async checkTokenNameAvailable(tokenName: string): Promise<boolean> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.isTokenNameAvailable(tokenName);
  }

  /**
   * Check if token symbol is available
   */
  async checkTokenSymbolAvailable(symbol: string): Promise<boolean> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.isTokenSymbolAvailable(symbol);
  }

  /**
   * Fetch pool details for a token
   */
  async fetchPoolDetails(tokenName: string): Promise<PoolData> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.fetchPoolDetails(tokenName);
  }

  /**
   * Calculate buy amount
   */
  async calculateBuyAmount(options: {
    tokenName: string;
    amount: string;
    type: 'native' | 'exact';
  }) {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.calculateBuyAmount(options);
  }

  /**
   * Calculate sell amount
   */
  async calculateSellAmount(options: {
    tokenName: string;
    amount: string;
    type: 'native' | 'exact';
  }) {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.calculateSellAmount(options);
  }

  /**
   * Buy tokens with slippage protection
   */
  async buyTokens(options: {
    tokenName: string;
    amount: string;
    type: 'native' | 'exact';
    slippageTolerance?: number;
  }): Promise<TradeResult> {
    if (!this.sdk) throw new Error('SDK not initialized');

    // First calculate expected amounts
    const calculation = await this.sdk.calculateBuyAmount({
      tokenName: options.tokenName,
      amount: options.amount,
      type: options.type
    });

    // Execute buy with slippage protection
    return this.sdk.buy({
      tokenName: options.tokenName,
      amount: options.amount,
      type: options.type,
      expectedAmount: calculation.amount,
      maxAcceptableReverseBondingCurveFee: calculation.reverseBondingCurveFee,
      slippageToleranceFactor: options.slippageTolerance || 0.01
    });
  }

  /**
   * Sell tokens with slippage protection
   */
  async sellTokens(options: {
    tokenName: string;
    amount: string;
    type: 'native' | 'exact';
    slippageTolerance?: number;
  }): Promise<TradeResult> {
    if (!this.sdk) throw new Error('SDK not initialized');

    // First calculate expected amounts
    const calculation = await this.sdk.calculateSellAmount({
      tokenName: options.tokenName,
      amount: options.amount,
      type: options.type
    });

    // Execute sell with slippage protection
    return this.sdk.sell({
      tokenName: options.tokenName,
      amount: options.amount,
      type: options.type,
      expectedAmount: calculation.amount,
      maxAcceptableReverseBondingCurveFee: calculation.reverseBondingCurveFee,
      slippageToleranceFactor: options.slippageTolerance || 0.01
    });
  }

  /**
   * Launch a new token
   */
  async launchToken(options: {
    tokenName: string;
    tokenSymbol: string;
    tokenDescription: string;
    tokenImage: string;
    websiteUrl?: string;
    twitterUrl?: string;
    telegramUrl?: string;
    preBuyQuantity?: string;
  }) {
    if (!this.sdk) throw new Error('SDK not initialized');

    // Check availability first
    const nameAvailable = await this.checkTokenNameAvailable(options.tokenName);
    const symbolAvailable = await this.checkTokenSymbolAvailable(options.tokenSymbol);

    if (!nameAvailable) {
      throw new Error(`Token name "${options.tokenName}" is not available`);
    }
    if (!symbolAvailable) {
      throw new Error(`Token symbol "${options.tokenSymbol}" is not available`);
    }

    // Launch the token
    return this.sdk.launchToken({
      tokenName: options.tokenName,
      tokenSymbol: options.tokenSymbol,
      tokenDescription: options.tokenDescription,
      tokenImage: options.tokenImage,
      websiteUrl: options.websiteUrl,
      twitterUrl: options.twitterUrl,
      telegramUrl: options.telegramUrl,
      preBuyQuantity: options.preBuyQuantity || '0'
    });
  }

  /**
   * Get token URL on the frontend
   */
  getTokenUrl(tokenName: string): string {
    const config = getSDKConfig(this.environment);
    return `${config.frontendUrl}/token/${tokenName}`;
  }

  /**
   * Fetch recent pools
   */
  async fetchRecentPools(limit: number = 20) {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.fetchPools({ type: 'recent', limit });
  }

  /**
   * Fetch popular pools
   */
  async fetchPopularPools(limit: number = 20) {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.fetchPools({ type: 'popular', limit });
  }

  /**
   * Check if token is graduated
   */
  async isTokenGraduated(tokenName: string): Promise<boolean> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.isTokenGraduated(tokenName);
  }

  /**
   * Calculate graduation cost
   */
  async calculateGraduationCost(tokenName: string) {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.calculateBuyAmountForGraduation({ tokenName });
  }

  /**
   * Get spot price for a token in USD
   */
  async getTokenSpotPrice(tokenName: string) {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.fetchTokenSpotPrice({ tokenName });
  }

  /**
   * Get GALA spot price in USD
   */
  async getGalaSpotPrice() {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.fetchGalaSpotPrice();
  }

  /**
   * Clean up SDK resources
   */
  cleanup() {
    if (this.sdk) {
      this.sdk.cleanup();
    }
  }
}

/**
 * Helper function to create SDK with environment check
 */
export async function createTestSDK(): Promise<LaunchpadSDKOperations | null> {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('ℹ️ WALLET_PRIVATE_KEY not set. SDK tests will be skipped.');
    return null;
  }

  return new LaunchpadSDKOperations({
    privateKey,
    environment: 'development'
  });
}

/**
 * Generate unique token name for testing
 */
export function generateTestTokenName(prefix: string = 'test'): string {
  const timestamp = Date.now().toString(36).slice(-6);
  const random = Math.random().toString(36).slice(-4);
  return `${prefix}${timestamp}${random}`.toLowerCase().slice(0, 20);
}

/**
 * Generate unique token symbol for testing
 */
export function generateTestTokenSymbol(prefix: string = 'T'): string {
  const random = Math.random().toString(36).slice(-4).toUpperCase();
  return `${prefix}${random}`.slice(0, 8);
}

// Export types
export type { PoolData, TradeResult, TokenBalanceInfo };
