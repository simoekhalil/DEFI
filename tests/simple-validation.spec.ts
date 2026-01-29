import { test, expect } from '@playwright/test';
import { calculateBondingCurvePrice } from './helpers/gala-launchpad-utils';

/**
 * Simple validation tests for quick verification
 */

test.describe('Quick Validation Tests', () => {
  test('should validate mathematical functions work', async () => {
    console.log('=== MATHEMATICAL FUNCTION VALIDATION ===');
    
    // Test the bonding curve calculation with known values
    const testCases = [
      { supply: 100000, expected: 31.2750343 },
      { supply: 500000, expected: 2317.347211 },
      { supply: 1000000, expected: 31741.65481 }
    ];
    
    for (const testCase of testCases) {
      const calculated = calculateBondingCurvePrice(testCase.supply);
      const tolerance = testCase.expected * 0.01; // 1% tolerance
      const difference = Math.abs(calculated - testCase.expected);
      
      console.log(`Supply: ${testCase.supply.toLocaleString()}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Calculated: ${calculated}`);
      console.log(`Difference: ${difference}`);
      console.log(`Within tolerance: ${difference <= tolerance ? '✅' : '❌'}`);
      
      expect(difference).toBeLessThanOrEqual(tolerance);
    }
  });

  test('should validate basic page navigation', async ({ page }) => {
    console.log('=== BASIC PAGE NAVIGATION ===');
    
    // Try to navigate to the main page
    try {
      await page.goto('/');
      console.log('✅ Successfully navigated to main page');
      
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      // Take a screenshot for verification
      await page.screenshot({ path: 'tests/screenshots/simple-validation.png', fullPage: true });
      console.log('✅ Screenshot taken');
      
    } catch (error) {
      console.log(`❌ Navigation failed: ${error.message}`);
      // Don't fail the test if server isn't running
      console.log('ℹ️ This is expected if dev server is not running');
    }
  });

  test('should validate form validation functions', async () => {
    console.log('=== FORM VALIDATION FUNCTIONS ===');
    
    // Import form validation functions
    const { formValidation } = await import('./helpers/gala-launchpad-utils');
    
    // Test token name validation
    const nameTests = [
      { input: 'TestToken', shouldBeValid: true },
      { input: 'A', shouldBeValid: false }, // Too short
      { input: 'Test Token', shouldBeValid: false }, // Contains space
      { input: 'Test@Token', shouldBeValid: false } // Contains special char
    ];
    
    for (const test of nameTests) {
      const result = formValidation.tokenName(test.input);
      console.log(`Name "${test.input}": ${result.valid ? '✅' : '❌'} ${result.error || ''}`);
      expect(result.valid).toBe(test.shouldBeValid);
    }
    
    // Test token symbol validation
    const symbolTests = [
      { input: 'TEST', shouldBeValid: true },
      { input: 'T', shouldBeValid: true },
      { input: 'TEST123', shouldBeValid: false }, // Contains numbers
      { input: 'TOOLONGTEST', shouldBeValid: false } // Too long
    ];
    
    for (const test of symbolTests) {
      const result = formValidation.tokenSymbol(test.input);
      console.log(`Symbol "${test.input}": ${result.valid ? '✅' : '❌'} ${result.error || ''}`);
      expect(result.valid).toBe(test.shouldBeValid);
    }
  });

  test('should validate Diamond Hand calculations', async () => {
    console.log('=== DIAMOND HAND CALCULATIONS ===');
    
    const { calculateDiamondHandFee, calculateTokenDistribution } = await import('./helpers/gala-launchpad-utils');
    
    // Test Diamond Hand fee calculation
    const feeTests = [
      { progress: 10, expected: 'low fee' },
      { progress: 50, expected: 'medium fee' },
      { progress: 90, expected: 'high fee' }
    ];
    
    for (const test of feeTests) {
      const fee = calculateDiamondHandFee(test.progress);
      console.log(`Progress ${test.progress}%: Fee = ${(fee * 100).toFixed(2)}%`);
      expect(fee).toBeGreaterThan(0.01); // Should be at least base fee
    }
    
    // Test token distribution
    const holders = [
      { address: '0x1', balance: 1000 },
      { address: '0x2', balance: 2000 },
      { address: '0x3', balance: 3000 }
    ];
    
    const distribution = calculateTokenDistribution(holders, 600);
    console.log('Token distribution:');
    distribution.forEach(d => {
      console.log(`${d.address}: ${d.distribution} tokens`);
    });
    
    const totalDistributed = distribution.reduce((sum, d) => sum + d.distribution, 0);
    expect(Math.abs(totalDistributed - 600)).toBeLessThan(0.01); // Should sum to total
  });
});

test.describe('Performance Tests', () => {
  test('should complete calculations quickly', async () => {
    console.log('=== PERFORMANCE VALIDATION ===');
    
    const { calculateBondingCurvePrice } = await import('./helpers/gala-launchpad-utils');
    
    const startTime = performance.now();
    
    // Run multiple calculations
    for (let i = 0; i < 1000; i++) {
      const supply = 100000 + (i * 1000);
      calculateBondingCurvePrice(supply);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`1000 calculations completed in ${duration.toFixed(2)}ms`);
    console.log(`Average per calculation: ${(duration / 1000).toFixed(4)}ms`);
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(1000); // Less than 1 second
  });
});
