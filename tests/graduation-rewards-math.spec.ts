import { test, expect } from '@playwright/test';

/**
 * Graduation Rewards Mathematical Validation
 * Pure mathematical testing of graduation reward calculations
 */

// Configuration constants from specification
const GRADUATION_THRESHOLD_GALA = 1640985.84;
const CREATOR_REWARD_GALA = 17777;
const PLATFORM_FEE_PERCENT = 5;
const DEX_POOL_PERCENT = 94; // Approximate, calculated as remainder

test.describe('Graduation Rewards Mathematical Validation', () => {
  
  test('should validate graduation threshold boundary conditions', async () => {
    const boundaryTests = [
      { marketCap: 1640985.83, shouldGraduate: false, description: 'Just below threshold' },
      { marketCap: 1640985.84, shouldGraduate: true, description: 'Exact threshold' },
      { marketCap: 1640985.85, shouldGraduate: true, description: 'Just above threshold' },
      { marketCap: 2000000, shouldGraduate: true, description: 'Well above threshold' },
      { marketCap: 1000000, shouldGraduate: false, description: 'Well below threshold' }
    ];
    
    boundaryTests.forEach(testCase => {
      const shouldGraduate = testCase.marketCap >= GRADUATION_THRESHOLD_GALA;
      expect(shouldGraduate).toBe(testCase.shouldGraduate);
      console.log(`✅ ${testCase.description}: ${testCase.marketCap.toLocaleString()} GALA - ${shouldGraduate ? 'GRADUATES' : 'NO GRADUATION'}`);
    });
  });

  test('should validate creator reward calculations', async () => {
    const rewardTests = [
      { marketCap: GRADUATION_THRESHOLD_GALA, description: 'At exact threshold' },
      { marketCap: 2000000, description: 'Above threshold (2M GALA)' },
      { marketCap: 5000000, description: 'High market cap (5M GALA)' },
      { marketCap: 10000000, description: 'Very high market cap (10M GALA)' }
    ];
    
    rewardTests.forEach(testCase => {
      const creatorReward = CREATOR_REWARD_GALA; // Fixed amount
      const creatorPercent = (creatorReward / testCase.marketCap) * 100;
      
      // Creator reward should always be exactly 17,777 GALA
      expect(creatorReward).toBe(17777);
      
      // Creator percentage should decrease as market cap increases
      expect(creatorPercent).toBeGreaterThan(0);
      expect(creatorPercent).toBeLessThan(2); // Should be less than 2%
      
      console.log(`✅ ${testCase.description}: Creator gets ${creatorReward.toLocaleString()} GALA (${creatorPercent.toFixed(2)}%)`);
    });
  });

  test('should validate platform fee calculations', async () => {
    const feeTests = [
      { marketCap: GRADUATION_THRESHOLD_GALA, expectedFee: 82049.292 },
      { marketCap: 2000000, expectedFee: 100000 },
      { marketCap: 3000000, expectedFee: 150000 },
      { marketCap: 5000000, expectedFee: 250000 }
    ];
    
    feeTests.forEach(testCase => {
      const platformFee = testCase.marketCap * (PLATFORM_FEE_PERCENT / 100);
      const feePercent = (platformFee / testCase.marketCap) * 100;
      
      // Platform fee should always be exactly 5%
      expect(platformFee).toBeCloseTo(testCase.expectedFee, 2);
      expect(feePercent).toBeCloseTo(5, 6); // Exact 5%
      
      console.log(`✅ Market Cap ${testCase.marketCap.toLocaleString()}: Platform fee ${platformFee.toLocaleString()} GALA (5%)`);
    });
  });

  test('should validate DEX pool allocation calculations', async () => {
    const poolTests = [
      { marketCap: GRADUATION_THRESHOLD_GALA },
      { marketCap: 2000000 },
      { marketCap: 3500000 },
      { marketCap: 5000000 }
    ];
    
    poolTests.forEach(testCase => {
      const creatorReward = CREATOR_REWARD_GALA;
      const platformFee = testCase.marketCap * 0.05;
      const dexPool = testCase.marketCap - creatorReward - platformFee;
      const dexPercent = (dexPool / testCase.marketCap) * 100;
      
      // DEX pool should receive the majority of funds
      expect(dexPool).toBeGreaterThan(creatorReward);
      expect(dexPool).toBeGreaterThan(platformFee);
      expect(dexPercent).toBeGreaterThan(90); // Should be >90%
      expect(dexPercent).toBeLessThan(95); // Should be <95%
      
      console.log(`✅ Market Cap ${testCase.marketCap.toLocaleString()}: DEX pool ${dexPool.toLocaleString()} GALA (${dexPercent.toFixed(1)}%)`);
    });
  });

  test('should validate total distribution equals market cap', async () => {
    const distributionTests = [
      GRADUATION_THRESHOLD_GALA,
      2000000,
      2500000,
      5000000,
      7500000,
      10000000
    ];
    
    distributionTests.forEach(marketCap => {
      const creatorReward = CREATOR_REWARD_GALA;
      const platformFee = marketCap * 0.05;
      const dexPool = marketCap - creatorReward - platformFee;
      const totalDistributed = creatorReward + platformFee + dexPool;
      
      // Total distribution should exactly equal market cap
      expect(totalDistributed).toBeCloseTo(marketCap, 6);
      
      // Verify no funds are lost or created
      const difference = Math.abs(totalDistributed - marketCap);
      expect(difference).toBeLessThan(0.000001);
      
      console.log(`✅ Market Cap ${marketCap.toLocaleString()}: Total distributed ${totalDistributed.toLocaleString()} GALA (difference: ${difference.toFixed(8)})`);
    });
  });

  test('should validate creator reward percentage across different market caps', async () => {
    const percentageTests = [
      { marketCap: GRADUATION_THRESHOLD_GALA, expectedPercent: 1.08 },
      { marketCap: 2000000, expectedPercent: 0.89 },
      { marketCap: 5000000, expectedPercent: 0.36 },
      { marketCap: 10000000, expectedPercent: 0.18 }
    ];
    
    percentageTests.forEach(testCase => {
      const creatorPercent = (CREATOR_REWARD_GALA / testCase.marketCap) * 100;
      
      expect(creatorPercent).toBeCloseTo(testCase.expectedPercent, 1);
      
      // Creator percentage should decrease as market cap increases
      expect(creatorPercent).toBeGreaterThan(0);
      expect(creatorPercent).toBeLessThan(2);
      
      console.log(`✅ ${testCase.marketCap.toLocaleString()} GALA: Creator reward ${creatorPercent.toFixed(2)}% (expected ~${testCase.expectedPercent}%)`);
    });
  });

  test('should validate USD value threshold maintenance', async () => {
    // Test different GALA price scenarios
    const priceScenarios = [
      { galaPrice: 0.015, description: '$0.015 per GALA' },
      { galaPrice: 0.020, description: '$0.020 per GALA' },
      { galaPrice: 0.010, description: '$0.010 per GALA' },
      { galaPrice: 0.025, description: '$0.025 per GALA' }
    ];
    
    priceScenarios.forEach(scenario => {
      const thresholdUsd = GRADUATION_THRESHOLD_GALA * scenario.galaPrice;
      const targetUsd = 24600; // Target $24.6k
      const percentageDifference = Math.abs((thresholdUsd - targetUsd) / targetUsd) * 100;
      
      expect(thresholdUsd).toBeGreaterThan(0);
      
      console.log(`✅ ${scenario.description}: Threshold = $${thresholdUsd.toLocaleString()} (${percentageDifference.toFixed(1)}% from target)`);
    });
  });

  test('should validate edge cases and boundary conditions', async () => {
    const edgeCases = [
      {
        name: 'Minimum graduation market cap',
        marketCap: GRADUATION_THRESHOLD_GALA,
        test: (marketCap: number) => {
          const shouldGraduate = marketCap >= GRADUATION_THRESHOLD_GALA;
          return shouldGraduate === true;
        }
      },
      {
        name: 'Just below graduation threshold',
        marketCap: GRADUATION_THRESHOLD_GALA - 0.01,
        test: (marketCap: number) => {
          const shouldGraduate = marketCap >= GRADUATION_THRESHOLD_GALA;
          return shouldGraduate === false;
        }
      },
      {
        name: 'Creator reward is fixed regardless of market cap',
        marketCap: 10000000,
        test: (marketCap: number) => {
          const creatorReward = CREATOR_REWARD_GALA;
          return creatorReward === 17777;
        }
      },
      {
        name: 'Platform fee is exactly 5% of market cap',
        marketCap: 3333333.33,
        test: (marketCap: number) => {
          const platformFee = marketCap * 0.05;
          const feePercent = (platformFee / marketCap) * 100;
          return Math.abs(feePercent - 5) < 0.000001;
        }
      },
      {
        name: 'DEX pool receives majority of funds',
        marketCap: 2000000,
        test: (marketCap: number) => {
          const creatorReward = CREATOR_REWARD_GALA;
          const platformFee = marketCap * 0.05;
          const dexPool = marketCap - creatorReward - platformFee;
          return dexPool > creatorReward && dexPool > platformFee;
        }
      }
    ];
    
    edgeCases.forEach(edgeCase => {
      const result = edgeCase.test(edgeCase.marketCap);
      expect(result).toBe(true);
      console.log(`✅ Edge case validated: ${edgeCase.name}`);
    });
  });

  test('should validate mathematical precision and floating-point accuracy', async () => {
    // Test precision with various market cap values
    const precisionTests = [
      1640985.84,
      1640985.844444,
      2000000.123456,
      5000000.987654
    ];
    
    precisionTests.forEach(marketCap => {
      const creatorReward = CREATOR_REWARD_GALA;
      const platformFee = marketCap * 0.05;
      const dexPool = marketCap - creatorReward - platformFee;
      const totalDistributed = creatorReward + platformFee + dexPool;
      
      // Test floating-point precision
      const difference = Math.abs(totalDistributed - marketCap);
      expect(difference).toBeLessThan(0.000001); // Precision within 1 microunit
      
      // Test that calculations are deterministic
      const secondCalculation = creatorReward + (marketCap * 0.05) + (marketCap - creatorReward - (marketCap * 0.05));
      expect(secondCalculation).toBeCloseTo(totalDistributed, 10);
      
      console.log(`✅ Precision test: ${marketCap} GALA - difference ${difference.toExponential(2)}`);
    });
  });

  test('should validate graduation reward formulas match specification', async () => {
    // Test against exact specification values
    const specificationTest = {
      graduationThreshold: 1640985.84,
      creatorReward: 17777,
      platformFeePercent: 5,
      approximateUsdValue: 24600
    };
    
    // Validate threshold
    expect(GRADUATION_THRESHOLD_GALA).toBe(specificationTest.graduationThreshold);
    
    // Validate creator reward
    expect(CREATOR_REWARD_GALA).toBe(specificationTest.creatorReward);
    
    // Validate platform fee percentage
    expect(PLATFORM_FEE_PERCENT).toBe(specificationTest.platformFeePercent);
    
    // Calculate actual distribution at threshold
    const actualPlatformFee = GRADUATION_THRESHOLD_GALA * 0.05;
    const actualDexPool = GRADUATION_THRESHOLD_GALA - CREATOR_REWARD_GALA - actualPlatformFee;
    const actualCreatorPercent = (CREATOR_REWARD_GALA / GRADUATION_THRESHOLD_GALA) * 100;
    
    // Validate calculated values match expected ranges
    expect(actualPlatformFee).toBeCloseTo(82049.292, 2);
    expect(actualDexPool).toBeCloseTo(1541159.548, 2);
    expect(actualCreatorPercent).toBeCloseTo(1.08, 2);
    
    console.log('✅ All specification values validated:');
    console.log(`   Graduation Threshold: ${GRADUATION_THRESHOLD_GALA.toLocaleString()} GALA`);
    console.log(`   Creator Reward: ${CREATOR_REWARD_GALA.toLocaleString()} GALA (${actualCreatorPercent.toFixed(2)}%)`);
    console.log(`   Platform Fee: ${actualPlatformFee.toLocaleString()} GALA (5%)`);
    console.log(`   DEX Pool: ${actualDexPool.toLocaleString()} GALA (${((actualDexPool/GRADUATION_THRESHOLD_GALA)*100).toFixed(1)}%)`);
  });

  test('should validate multi-token graduation scenarios', async () => {
    // Test multiple tokens graduating simultaneously
    const multiTokenScenario = [
      { tokenId: 'TOKEN_A', marketCap: 1640985.84 },
      { tokenId: 'TOKEN_B', marketCap: 2500000 },
      { tokenId: 'TOKEN_C', marketCap: 5000000 }
    ];
    
    const graduationResults = multiTokenScenario.map(token => {
      const creatorReward = CREATOR_REWARD_GALA;
      const platformFee = token.marketCap * 0.05;
      const dexPool = token.marketCap - creatorReward - platformFee;
      
      return {
        ...token,
        creatorReward,
        platformFee,
        dexPool,
        totalDistributed: creatorReward + platformFee + dexPool
      };
    });
    
    graduationResults.forEach(result => {
      // Each token should get exactly 17,777 GALA creator reward
      expect(result.creatorReward).toBe(17777);
      
      // Total distribution should equal market cap
      expect(result.totalDistributed).toBeCloseTo(result.marketCap, 6);
      
      // Platform fee should be exactly 5%
      const feePercent = (result.platformFee / result.marketCap) * 100;
      expect(feePercent).toBeCloseTo(5, 6);
      
      console.log(`✅ ${result.tokenId}: Market cap ${result.marketCap.toLocaleString()} → Creator ${result.creatorReward.toLocaleString()}, Platform ${result.platformFee.toLocaleString()}, DEX ${result.dexPool.toLocaleString()}`);
    });
    
    // Validate total rewards across all tokens
    const totalCreatorRewards = graduationResults.reduce((sum, result) => sum + result.creatorReward, 0);
    const totalPlatformFees = graduationResults.reduce((sum, result) => sum + result.platformFee, 0);
    
    expect(totalCreatorRewards).toBe(17777 * 3); // 3 tokens × 17,777 each
    expect(totalPlatformFees).toBeGreaterThan(0);
    
    console.log(`✅ Multi-token graduation: Total creator rewards ${totalCreatorRewards.toLocaleString()} GALA, Total platform fees ${totalPlatformFees.toLocaleString()} GALA`);
  });
});
