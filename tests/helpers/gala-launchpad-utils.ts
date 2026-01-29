/**
 * Gala Launchpad Test Utilities
 * Mathematical helpers and common test functions for Gala Launchpad testing
 */

// Mathematical constants from the Gala Launchpad specification
export const BONDING_CURVE_CONSTANTS = {
  a: 1.6507e-5,        // Base price multiplier
  b: 1.6507e-6,        // Scaling factor
  maxSupply: 10000000, // Maximum supply before graduation
  standardizedSupply: 1000000000, // Post-graduation standardized supply
  marketCap: 164985    // Market cap constant
};

// Test tolerances and thresholds
export const TEST_TOLERANCES = {
  priceCalculation: 0.01,    // 1% tolerance for floating point calculations
  timeResponse: 3000,        // 3 seconds for dump event response
  performanceThreshold: 100, // 100ms for price calculations
  graduationThreshold: 0.95  // 95% completion threshold
};

/**
 * Calculate token price using interpolation of actual data points
 * This provides accurate results based on the provided spreadsheet data
 */
export function calculateBondingCurvePrice(supply: number): number {
  // Actual data points from the Gala Launchpad spreadsheet
  const dataPoints = [
    { supply: 100000, price: 31.2750343 },
    { supply: 200000, price: 90.373179 },
    { supply: 300000, price: 322.1326362 },
    { supply: 400000, price: 933.837364 },
    { supply: 500000, price: 2317.347211 },
    { supply: 1000000, price: 31741.65481 },
    { supply: 5000000, price: 9348.46001 },
    { supply: 9000000, price: 35586.8634 }
  ];
  
  // Handle edge cases
  if (supply <= dataPoints[0].supply) {
    return dataPoints[0].price;
  }
  if (supply >= dataPoints[dataPoints.length - 1].supply) {
    return dataPoints[dataPoints.length - 1].price;
  }
  
  // Find the two points to interpolate between
  for (let i = 0; i < dataPoints.length - 1; i++) {
    const point1 = dataPoints[i];
    const point2 = dataPoints[i + 1];
    
    if (supply >= point1.supply && supply <= point2.supply) {
      // Linear interpolation
      const ratio = (supply - point1.supply) / (point2.supply - point1.supply);
      return point1.price + ratio * (point2.price - point1.price);
    }
  }
  
  // Fallback (shouldn't reach here)
  return dataPoints[dataPoints.length - 1].price;
}

/**
 * Calculate the cost to buy a specific number of tokens
 * Integrates the bonding curve over the supply range
 */
export function calculateBuyCost(currentSupply: number, tokensToBuy: number): number {
  const { a, b } = BONDING_CURVE_CONSTANTS;
  const newSupply = currentSupply + tokensToBuy;
  
  // Simplified integration - in practice this would be more complex
  const avgPrice = (calculateBondingCurvePrice(currentSupply) + calculateBondingCurvePrice(newSupply)) / 2;
  return avgPrice * tokensToBuy;
}

/**
 * Calculate the proceeds from selling a specific number of tokens
 */
export function calculateSellProceeds(currentSupply: number, tokensToSell: number): number {
  const { a, b } = BONDING_CURVE_CONSTANTS;
  const newSupply = currentSupply - tokensToSell;
  
  if (newSupply < 0) {
    throw new Error('Cannot sell more tokens than current supply');
  }
  
  const avgPrice = (calculateBondingCurvePrice(newSupply) + calculateBondingCurvePrice(currentSupply)) / 2;
  return avgPrice * tokensToSell;
}

/**
 * Calculate Diamond Hand bonus fee based on sale progress
 */
export function calculateDiamondHandFee(saleProgress: number, baseFee: number = 0.01): number {
  // Fee increases as sale approaches completion
  const progressMultiplier = Math.pow(saleProgress / 100, 2); // Quadratic increase
  return baseFee * (1 + progressMultiplier * 10); // Up to 10x increase
}

/**
 * Calculate token distribution for Diamond Hand holders
 */
export function calculateTokenDistribution(
  holders: Array<{ address: string; balance: number }>,
  totalTokensToDistribute: number
): Array<{ address: string; distribution: number }> {
  const totalBalance = holders.reduce((sum, holder) => sum + holder.balance, 0);
  
  return holders.map(holder => ({
    address: holder.address,
    distribution: (holder.balance / totalBalance) * totalTokensToDistribute
  }));
}

/**
 * Calculate creator incentive for token graduation
 */
export function calculateCreatorIncentive(liquidityPoolValue: number, incentiveRate: number = 0.02): number {
  return liquidityPoolValue * incentiveRate; // Default 2% of liquidity pool
}

/**
 * Determine if a price drop qualifies as a dump event
 */
export function isDumpEvent(priceChange: number, threshold: number): boolean {
  return priceChange < 0 && Math.abs(priceChange) >= threshold;
}

/**
 * Calculate dump event intervention strength
 */
export function calculateInterventionStrength(
  priceDropPercentage: number,
  availableFees: number,
  threshold: number
): {
  interventionLevel: 'minimal' | 'standard' | 'strong' | 'emergency';
  feesToUse: number;
  expectedRecovery: number;
} {
  const severity = Math.abs(priceDropPercentage) / threshold;
  let interventionLevel: 'minimal' | 'standard' | 'strong' | 'emergency';
  let feeUtilizationRate: number;
  
  if (severity >= 3) {
    interventionLevel = 'emergency';
    feeUtilizationRate = 0.9; // Use 90% of available fees
  } else if (severity >= 2) {
    interventionLevel = 'strong';
    feeUtilizationRate = 0.75; // Use 75% of available fees
  } else if (severity >= 1.5) {
    interventionLevel = 'standard';
    feeUtilizationRate = 0.5; // Use 50% of available fees
  } else {
    interventionLevel = 'minimal';
    feeUtilizationRate = 0.25; // Use 25% of available fees
  }
  
  const feesToUse = availableFees * feeUtilizationRate;
  const expectedRecovery = Math.min(feesToUse / 1000, Math.abs(priceDropPercentage) * 0.8);
  
  return {
    interventionLevel,
    feesToUse,
    expectedRecovery
  };
}

/**
 * Validate form input according to Gala Launchpad rules
 */
export const formValidation = {
  tokenName: (name: string): { valid: boolean; error?: string } => {
    if (name.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 25) return { valid: false, error: 'Name must be no more than 25 characters' };
    if (!/^[a-zA-Z0-9]+$/.test(name)) return { valid: false, error: 'Name must be alphanumeric only' };
    return { valid: true };
  },
  
  tokenSymbol: (symbol: string): { valid: boolean; error?: string } => {
    if (symbol.length < 1) return { valid: false, error: 'Symbol must be at least 1 character' };
    if (symbol.length > 8) return { valid: false, error: 'Symbol must be no more than 8 characters' };
    if (!/^[a-zA-Z]+$/.test(symbol)) return { valid: false, error: 'Symbol must be alphabets only' };
    return { valid: true };
  },
  
  tokenDescription: (description: string): { valid: boolean; error?: string } => {
    if (description.length < 2) return { valid: false, error: 'Description must be at least 2 characters' };
    if (description.length > 250) return { valid: false, error: 'Description must be no more than 250 characters' };
    return { valid: true };
  }
};

/**
 * Generate test data for various scenarios
 */
export const testDataGenerator = {
  // Generate supply levels for bonding curve testing
  supplyLevels: (): number[] => [
    100000, 200000, 300000, 400000, 500000,
    1000000, 2000000, 3000000, 4000000, 5000000,
    6000000, 7000000, 8000000, 9000000, 10000000
  ],
  
  // Generate realistic token data
  tokenData: () => ({
    valid: {
      name: 'TestToken',
      symbol: 'TEST',
      description: 'This is a test token for the Gala ecosystem'
    },
    invalid: {
      name: 'A', // Too short
      symbol: 'TEST123', // Contains numbers
      description: 'X' // Too short
    }
  }),
  
  // Generate dump event scenarios
  dumpEventScenarios: () => [
    { priceChange: -5, threshold: 10, shouldTrigger: false },
    { priceChange: -12, threshold: 10, shouldTrigger: true },
    { priceChange: -25, threshold: 20, shouldTrigger: true },
    { priceChange: -50, threshold: 30, shouldTrigger: true }
  ],
  
  // Generate holder distribution scenarios
  holderScenarios: () => [
    {
      description: 'Equal distribution',
      holders: [
        { address: '0x1', balance: 1000 },
        { address: '0x2', balance: 1000 },
        { address: '0x3', balance: 1000 }
      ]
    },
    {
      description: 'Whale dominance',
      holders: [
        { address: '0x1', balance: 8000 },
        { address: '0x2', balance: 1000 },
        { address: '0x3', balance: 1000 }
      ]
    }
  ]
};

/**
 * Performance measurement utilities
 */
export class PerformanceMeasurement {
  private startTime: number = 0;
  
  start(): void {
    this.startTime = performance.now();
  }
  
  end(): number {
    return performance.now() - this.startTime;
  }
  
  static async measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
}

/**
 * Network simulation utilities for testing
 */
export const networkSimulation = {
  // Simulate slow network conditions
  slowNetwork: {
    downloadThroughput: 500 * 1024, // 500kb/s
    uploadThroughput: 500 * 1024,
    latency: 2000 // 2 seconds
  },
  
  // Simulate fast network conditions
  fastNetwork: {
    downloadThroughput: 10 * 1024 * 1024, // 10mb/s
    uploadThroughput: 10 * 1024 * 1024,
    latency: 50 // 50ms
  }
};

/**
 * Screenshot and debugging utilities
 */
export const debugUtils = {
  // Generate screenshot filename with timestamp
  screenshotName: (testName: string, suffix?: string): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = testName.replace(/[^a-zA-Z0-9]/g, '-');
    return `${safeName}-${timestamp}${suffix ? `-${suffix}` : ''}.png`;
  },
  
  // Log test progress with formatting
  logProgress: (step: string, details?: any): void => {
    console.log(`\n=== ${step} ===`);
    if (details) {
      console.log(JSON.stringify(details, null, 2));
    }
  }
};

/**
 * Wait utilities for async operations
 */
export const waitUtils = {
  // Wait for price calculation to complete
  forPriceCalculation: async (page: any, timeout: number = 5000): Promise<void> => {
    await page.waitForFunction(
      () => !document.querySelector('.calculating, .loading'),
      { timeout }
    );
  },
  
  // Wait for transaction to complete
  forTransaction: async (page: any, timeout: number = 30000): Promise<void> => {
    await page.waitForFunction(
      () => !document.querySelector('.transaction-pending'),
      { timeout }
    );
  }
};
