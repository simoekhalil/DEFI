/**
 * Graduation Rewards Testing Utilities
 * Helper functions for graduation rewards testing
 */

// Configuration constants from specification
export const GRADUATION_CONSTANTS = {
  THRESHOLD_GALA: 1640985.84,
  CREATOR_REWARD_GALA: 17777,
  PLATFORM_FEE_PERCENT: 5,
  TARGET_USD_VALUE: 24600,
  DEX_POOL_MIN_PERCENT: 90 // Minimum percentage for DEX pool
};

/**
 * Validates if a token should graduate based on market cap
 */
export function shouldTokenGraduate(marketCap: number): boolean {
  return marketCap >= GRADUATION_CONSTANTS.THRESHOLD_GALA;
}

/**
 * Calculates platform fee from market cap
 */
export function calculatePlatformFee(marketCap: number): number {
  return marketCap * (GRADUATION_CONSTANTS.PLATFORM_FEE_PERCENT / 100);
}

/**
 * Calculates DEX pool allocation
 */
export function calculateDEXPoolAllocation(
  marketCap: number, 
  creatorReward: number = GRADUATION_CONSTANTS.CREATOR_REWARD_GALA, 
  platformFee?: number
): number {
  const actualPlatformFee = platformFee ?? calculatePlatformFee(marketCap);
  return marketCap - creatorReward - actualPlatformFee;
}

/**
 * Calculates creator reward percentage of total pool
 */
export function calculateCreatorRewardPercentage(
  creatorReward: number = GRADUATION_CONSTANTS.CREATOR_REWARD_GALA,
  totalPool: number
): number {
  return (creatorReward / totalPool) * 100;
}

/**
 * Validates graduation reward distribution
 */
export function validateGraduationDistribution(marketCap: number): {
  isValid: boolean;
  creatorReward: number;
  platformFee: number;
  dexPool: number;
  creatorPercent: number;
  platformPercent: number;
  dexPercent: number;
  totalDistributed: number;
  distributionError: number;
} {
  const creatorReward = GRADUATION_CONSTANTS.CREATOR_REWARD_GALA;
  const platformFee = calculatePlatformFee(marketCap);
  const dexPool = calculateDEXPoolAllocation(marketCap, creatorReward, platformFee);
  
  const creatorPercent = calculateCreatorRewardPercentage(creatorReward, marketCap);
  const platformPercent = (platformFee / marketCap) * 100;
  const dexPercent = (dexPool / marketCap) * 100;
  
  const totalDistributed = creatorReward + platformFee + dexPool;
  const distributionError = Math.abs(totalDistributed - marketCap);
  
  const isValid = distributionError < 0.01 && 
                  Math.abs(platformPercent - 5) < 0.01 &&
                  dexPercent > GRADUATION_CONSTANTS.DEX_POOL_MIN_PERCENT;
  
  return {
    isValid,
    creatorReward,
    platformFee,
    dexPool,
    creatorPercent,
    platformPercent,
    dexPercent,
    totalDistributed,
    distributionError
  };
}

/**
 * Simulates graduation event
 */
export function simulateGraduationEvent(
  marketCap: number, 
  creatorWallet: string,
  options: {
    simulateNetworkFailure?: boolean;
    simulateInsufficientFunds?: boolean;
  } = {}
): {
  success: boolean;
  graduated: boolean;
  reason?: string;
  distribution?: ReturnType<typeof validateGraduationDistribution>;
  creatorWallet?: string;
  timestamp?: number;
} {
  // Check if graduation should occur
  if (!shouldTokenGraduate(marketCap)) {
    return {
      success: false,
      graduated: false,
      reason: `Market cap ${marketCap.toLocaleString()} GALA is below graduation threshold ${GRADUATION_CONSTANTS.THRESHOLD_GALA.toLocaleString()} GALA`
    };
  }
  
  // Simulate network failure
  if (options.simulateNetworkFailure) {
    return {
      success: false,
      graduated: false,
      reason: 'Network failure during graduation event'
    };
  }
  
  // Simulate insufficient funds
  if (options.simulateInsufficientFunds) {
    return {
      success: false,
      graduated: false,
      reason: 'Insufficient funds in graduation pool'
    };
  }
  
  // Successful graduation
  const distribution = validateGraduationDistribution(marketCap);
  
  return {
    success: true,
    graduated: true,
    distribution,
    creatorWallet,
    timestamp: Date.now()
  };
}

/**
 * Validates wallet address format
 */
export function validateWalletAddress(address: string): {
  isValid: boolean;
  format: 'gala-client' | 'ethereum' | 'unknown';
  reason?: string;
} {
  if (!address || address.length < 10) {
    return {
      isValid: false,
      format: 'unknown',
      reason: 'Address too short'
    };
  }
  
  // Gala client format
  if (address.startsWith('client|')) {
    const clientId = address.substring(7);
    if (clientId.length === 24 && /^[a-f0-9]+$/i.test(clientId)) {
      return {
        isValid: true,
        format: 'gala-client'
      };
    }
    return {
      isValid: false,
      format: 'gala-client',
      reason: 'Invalid Gala client ID format'
    };
  }
  
  // Ethereum format
  if (address.startsWith('0x') && address.length === 42) {
    if (/^0x[a-f0-9]+$/i.test(address)) {
      return {
        isValid: true,
        format: 'ethereum'
      };
    }
    return {
      isValid: false,
      format: 'ethereum',
      reason: 'Invalid Ethereum address format'
    };
  }
  
  return {
    isValid: false,
    format: 'unknown',
    reason: 'Unknown address format'
  };
}

/**
 * Calculates USD value of GALA amount
 */
export function calculateUSDValue(galaAmount: number, galaPrice: number): number {
  return galaAmount * galaPrice;
}

/**
 * Generates test data for graduation scenarios
 */
export function generateGraduationTestData(): Array<{
  id: string;
  marketCap: number;
  description: string;
  shouldGraduate: boolean;
  creatorWallet: string;
}> {
  return [
    {
      id: 'BELOW_THRESHOLD',
      marketCap: 1640985.83,
      description: 'Just below graduation threshold',
      shouldGraduate: false,
      creatorWallet: 'client|618ae395c1c653111d3315be'
    },
    {
      id: 'AT_THRESHOLD',
      marketCap: 1640985.84,
      description: 'Exactly at graduation threshold',
      shouldGraduate: true,
      creatorWallet: 'client|618ae395c1c653111d3315be'
    },
    {
      id: 'ABOVE_THRESHOLD',
      marketCap: 2000000,
      description: 'Above graduation threshold',
      shouldGraduate: true,
      creatorWallet: '0x742d35Cc6634C0532925a3b8D5c4Ae7C8E8c8E8C'
    },
    {
      id: 'HIGH_MARKET_CAP',
      marketCap: 5000000,
      description: 'High market cap scenario',
      shouldGraduate: true,
      creatorWallet: 'client|507f1f77bcf86cd799439011'
    },
    {
      id: 'VERY_HIGH_MARKET_CAP',
      marketCap: 10000000,
      description: 'Very high market cap scenario',
      shouldGraduate: true,
      creatorWallet: '0x8ba1f109551bD432803012645Hac136c'
    }
  ];
}

/**
 * Performance testing utility
 */
export function performanceTestGraduationCalculations(iterations: number = 1000): {
  executionTime: number;
  calculationsPerSecond: number;
  averageTimePerCalculation: number;
  performanceAcceptable: boolean;
} {
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const marketCap = GRADUATION_CONSTANTS.THRESHOLD_GALA + i;
    validateGraduationDistribution(marketCap);
  }
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  const calculationsPerSecond = iterations / (executionTime / 1000);
  const averageTimePerCalculation = executionTime / iterations;
  const performanceAcceptable = executionTime < 1000; // Should complete 1000 calculations in under 1 second
  
  return {
    executionTime,
    calculationsPerSecond,
    averageTimePerCalculation,
    performanceAcceptable
  };
}

/**
 * Batch graduation simulation for multiple tokens
 */
export function batchGraduationSimulation(
  tokens: Array<{ id: string; marketCap: number; creatorWallet: string }>
): Array<{
  tokenId: string;
  result: ReturnType<typeof simulateGraduationEvent>;
}> {
  return tokens.map(token => ({
    tokenId: token.id,
    result: simulateGraduationEvent(token.marketCap, token.creatorWallet)
  }));
}

/**
 * Validates admin-only parameter access
 */
export function validateAdminAccess(isAdmin: boolean): {
  canModifyThreshold: boolean;
  canModifyCreatorReward: boolean;
  canModifyPlatformFee: boolean;
  allParametersProtected: boolean;
} {
  const canModifyThreshold = isAdmin;
  const canModifyCreatorReward = isAdmin;
  const canModifyPlatformFee = isAdmin;
  const allParametersProtected = !canModifyThreshold && !canModifyCreatorReward && !canModifyPlatformFee;
  
  return {
    canModifyThreshold,
    canModifyCreatorReward,
    canModifyPlatformFee,
    allParametersProtected: isAdmin ? false : allParametersProtected
  };
}

/**
 * Edge case testing scenarios
 */
export function getEdgeCaseScenarios(): Array<{
  name: string;
  marketCap: number;
  expectedBehavior: string;
  testFunction: (marketCap: number) => boolean;
}> {
  return [
    {
      name: 'Exact threshold boundary',
      marketCap: GRADUATION_CONSTANTS.THRESHOLD_GALA,
      expectedBehavior: 'Should graduate exactly at threshold',
      testFunction: (marketCap) => shouldTokenGraduate(marketCap) === true
    },
    {
      name: 'Below threshold by minimal amount',
      marketCap: GRADUATION_CONSTANTS.THRESHOLD_GALA - 0.000001,
      expectedBehavior: 'Should not graduate below threshold',
      testFunction: (marketCap) => shouldTokenGraduate(marketCap) === false
    },
    {
      name: 'Above threshold by minimal amount',
      marketCap: GRADUATION_CONSTANTS.THRESHOLD_GALA + 0.000001,
      expectedBehavior: 'Should graduate above threshold',
      testFunction: (marketCap) => shouldTokenGraduate(marketCap) === true
    },
    {
      name: 'Very large market cap',
      marketCap: 100000000, // 100M GALA
      expectedBehavior: 'Should handle large numbers correctly',
      testFunction: (marketCap) => {
        const distribution = validateGraduationDistribution(marketCap);
        return distribution.isValid && distribution.creatorReward === GRADUATION_CONSTANTS.CREATOR_REWARD_GALA;
      }
    },
    {
      name: 'Floating point precision test',
      marketCap: 1640985.844444444,
      expectedBehavior: 'Should handle floating point precision',
      testFunction: (marketCap) => {
        const distribution = validateGraduationDistribution(marketCap);
        return distribution.distributionError < 0.000001;
      }
    }
  ];
}

/**
 * Comprehensive validation suite
 */
export function runComprehensiveValidation(marketCap: number): {
  passed: boolean;
  results: {
    thresholdCheck: boolean;
    distributionValidation: boolean;
    mathematicalAccuracy: boolean;
    percentageValidation: boolean;
    edgeCaseHandling: boolean;
  };
  details: any;
} {
  const distribution = validateGraduationDistribution(marketCap);
  const shouldGraduate = shouldTokenGraduate(marketCap);
  
  const results = {
    thresholdCheck: shouldGraduate === (marketCap >= GRADUATION_CONSTANTS.THRESHOLD_GALA),
    distributionValidation: distribution.isValid,
    mathematicalAccuracy: distribution.distributionError < 0.01,
    percentageValidation: Math.abs(distribution.platformPercent - 5) < 0.01,
    edgeCaseHandling: distribution.dexPercent > GRADUATION_CONSTANTS.DEX_POOL_MIN_PERCENT
  };
  
  const passed = Object.values(results).every(result => result === true);
  
  return {
    passed,
    results,
    details: {
      marketCap,
      shouldGraduate,
      distribution
    }
  };
}
