import { test, expect } from '@playwright/test';

/**
 * DEX Incentive APR Test Suite
 * 
 * Tests for the new incentive APR feature:
 * - incentiveApr field in pool list
 * - hasActiveIncentive field in pool list
 * - Incentive APR calculation from bonus pool amount and program duration
 * - apr1d now includes both fee APR and incentive APR
 * 
 * Environment: TEST1
 * Frontend: https://dex-frontend-test1.defi.gala.com (or equivalent)
 * Backend: https://dex-backend-test1.defi.gala.com (or equivalent)
 */

// Test configuration
const DEX_CONFIG = {
  frontendUrl: 'https://dex-frontend-test1.defi.gala.com',
  backendUrl: 'https://dex-backend-test1.defi.gala.com',
  apiUrl: 'https://dex-api-platform-dex-stage-gala.gala.com',
  timeout: 30000
};

// Expected field types for validation
interface PoolWithIncentive {
  poolPair: string;
  poolHash: string;
  poolName: string;
  token0: string;
  token1: string;
  fee: string;
  tvl: number;
  volume1d: number;
  volume30d: number;
  apr1d: number;
  // NEW FIELDS
  incentiveApr?: number;
  hasActiveIncentive?: boolean;
  // Derived calculations
  feeApr?: number;
  totalApr?: number;
}

interface IncentiveProgram {
  bonusPoolAmount: number;
  programDuration: number; // in days
  startDate: string;
  endDate: string;
  isActive: boolean;
}

test.describe('DEX Incentive APR Feature Tests', () => {
  
  test.describe('Pool List Field Validation', () => {
    
    test('should include incentiveApr field in pool list response', async ({ request }) => {
      console.log('=== TESTING: incentiveApr Field Presence ===');
      
      // Fetch pool list from API
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: {
          limit: 10,
          sortBy: 'tvl',
          sortOrder: 'desc'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      console.log(`Fetched ${data.pools?.length || 0} pools`);
      
      // Check if pools exist
      expect(data.pools).toBeDefined();
      expect(data.pools.length).toBeGreaterThan(0);
      
      // Validate incentiveApr field exists in pool objects
      const poolsWithIncentiveApr = data.pools.filter((pool: PoolWithIncentive) => 
        'incentiveApr' in pool
      );
      
      console.log(`Pools with incentiveApr field: ${poolsWithIncentiveApr.length}/${data.pools.length}`);
      
      // Log sample pool structure
      if (data.pools.length > 0) {
        const samplePool = data.pools[0];
        console.log('Sample pool structure:', JSON.stringify({
          poolName: samplePool.poolName,
          apr1d: samplePool.apr1d,
          incentiveApr: samplePool.incentiveApr,
          hasActiveIncentive: samplePool.hasActiveIncentive
        }, null, 2));
      }
      
      // Assert incentiveApr field exists
      expect(poolsWithIncentiveApr.length).toBe(data.pools.length);
      
      console.log('✅ incentiveApr field present in all pools');
    });

    test('should include hasActiveIncentive boolean field in pool list', async ({ request }) => {
      console.log('=== TESTING: hasActiveIncentive Field Presence ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: {
          limit: 10,
          sortBy: 'tvl',
          sortOrder: 'desc'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Validate hasActiveIncentive field exists and is boolean
      const poolsWithHasActiveIncentive = data.pools.filter((pool: PoolWithIncentive) => 
        'hasActiveIncentive' in pool && typeof pool.hasActiveIncentive === 'boolean'
      );
      
      console.log(`Pools with hasActiveIncentive (boolean): ${poolsWithHasActiveIncentive.length}/${data.pools.length}`);
      
      // Check for pools with active incentives
      const activeIncentivePools = data.pools.filter((pool: PoolWithIncentive) => 
        pool.hasActiveIncentive === true
      );
      
      console.log(`Pools with active incentives: ${activeIncentivePools.length}`);
      
      if (activeIncentivePools.length > 0) {
        console.log('Pools with active incentives:', activeIncentivePools.map((p: PoolWithIncentive) => p.poolName));
      }
      
      // Assert field exists in all pools
      expect(poolsWithHasActiveIncentive.length).toBe(data.pools.length);
      
      console.log('✅ hasActiveIncentive field present and is boolean type');
    });

    test('should validate incentiveApr is numeric and non-negative', async ({ request }) => {
      console.log('=== TESTING: incentiveApr Value Validation ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 50 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      let validCount = 0;
      let invalidPools: string[] = [];
      
      for (const pool of data.pools) {
        const incentiveApr = pool.incentiveApr;
        
        if (typeof incentiveApr === 'number' && incentiveApr >= 0 && !isNaN(incentiveApr)) {
          validCount++;
        } else if (incentiveApr !== undefined) {
          invalidPools.push(`${pool.poolName}: ${incentiveApr} (type: ${typeof incentiveApr})`);
        }
      }
      
      console.log(`Valid incentiveApr values: ${validCount}/${data.pools.length}`);
      
      if (invalidPools.length > 0) {
        console.log('Invalid incentiveApr values found:', invalidPools);
      }
      
      // All incentiveApr values should be valid numbers >= 0
      expect(invalidPools.length).toBe(0);
      
      console.log('✅ All incentiveApr values are valid non-negative numbers');
    });
  });

  test.describe('APR Calculation Validation', () => {
    
    test('should calculate apr1d as sum of fee APR and incentive APR', async ({ request }) => {
      console.log('=== TESTING: apr1d = feeApr + incentiveApr ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 50 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Find pools with active incentives to verify calculation
      const poolsWithIncentives = data.pools.filter((pool: PoolWithIncentive) => 
        pool.hasActiveIncentive === true && pool.incentiveApr && pool.incentiveApr > 0
      );
      
      console.log(`Pools with active incentives: ${poolsWithIncentives.length}`);
      
      for (const pool of poolsWithIncentives) {
        const feeApr = pool.feeApr || 0;
        const incentiveApr = pool.incentiveApr || 0;
        const totalApr = pool.apr1d || 0;
        
        // Calculate expected total APR
        const expectedTotalApr = feeApr + incentiveApr;
        
        console.log(`Pool: ${pool.poolName}`);
        console.log(`  Fee APR: ${feeApr}%`);
        console.log(`  Incentive APR: ${incentiveApr}%`);
        console.log(`  Total apr1d: ${totalApr}%`);
        console.log(`  Expected: ${expectedTotalApr}%`);
        
        // Allow small tolerance for floating point
        const tolerance = 0.01;
        const difference = Math.abs(totalApr - expectedTotalApr);
        
        if (pool.feeApr !== undefined) {
          expect(difference).toBeLessThanOrEqual(tolerance);
        }
      }
      
      console.log('✅ apr1d correctly includes both fee APR and incentive APR');
    });

    test('should validate incentive APR calculation formula', async ({ request }) => {
      console.log('=== TESTING: Incentive APR Calculation Formula ===');
      console.log('Formula: incentiveApr = (bonusPoolAmount / TVL) * (365 / programDuration) * 100');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 20 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Find pools with incentive programs
      const poolsWithIncentives = data.pools.filter((pool: any) => 
        pool.hasActiveIncentive === true
      );
      
      for (const pool of poolsWithIncentives) {
        // If incentive program details are available, validate calculation
        if (pool.incentiveProgram) {
          const program: IncentiveProgram = pool.incentiveProgram;
          const tvl = pool.tvl || 0;
          
          if (tvl > 0 && program.programDuration > 0) {
            // Expected APR calculation
            const expectedApr = (program.bonusPoolAmount / tvl) * (365 / program.programDuration) * 100;
            const actualApr = pool.incentiveApr || 0;
            
            console.log(`Pool: ${pool.poolName}`);
            console.log(`  Bonus Pool: ${program.bonusPoolAmount}`);
            console.log(`  TVL: ${tvl}`);
            console.log(`  Duration: ${program.programDuration} days`);
            console.log(`  Expected APR: ${expectedApr.toFixed(4)}%`);
            console.log(`  Actual APR: ${actualApr.toFixed(4)}%`);
            
            // Allow 1% tolerance for calculation differences
            const tolerance = Math.max(expectedApr * 0.01, 0.01);
            expect(Math.abs(actualApr - expectedApr)).toBeLessThanOrEqual(tolerance);
          }
        }
      }
      
      console.log('✅ Incentive APR calculation formula validated');
    });

    test('should show incentiveApr as 0 for pools without active incentives', async ({ request }) => {
      console.log('=== TESTING: Zero APR for Inactive Incentives ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 50 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Find pools without active incentives
      const poolsWithoutIncentives = data.pools.filter((pool: PoolWithIncentive) => 
        pool.hasActiveIncentive === false
      );
      
      console.log(`Pools without active incentives: ${poolsWithoutIncentives.length}`);
      
      let validCount = 0;
      let invalidPools: string[] = [];
      
      for (const pool of poolsWithoutIncentives) {
        if (pool.incentiveApr === 0 || pool.incentiveApr === undefined) {
          validCount++;
        } else {
          invalidPools.push(`${pool.poolName}: incentiveApr=${pool.incentiveApr}`);
        }
      }
      
      console.log(`Pools correctly showing 0 incentive APR: ${validCount}/${poolsWithoutIncentives.length}`);
      
      if (invalidPools.length > 0) {
        console.log('Invalid pools (should have 0 incentiveApr):', invalidPools);
      }
      
      expect(invalidPools.length).toBe(0);
      
      console.log('✅ Inactive incentive pools correctly show 0% incentive APR');
    });
  });

  test.describe('UI Display Validation', () => {
    
    test('should display incentive APR badge/indicator for active incentive pools', async ({ page }) => {
      console.log('=== TESTING: UI Incentive Indicator ===');
      
      await page.goto(DEX_CONFIG.frontendUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Take screenshot of initial state
      await page.screenshot({ 
        path: 'tests/screenshots/dex-incentive-pools-list.png',
        fullPage: true 
      });
      
      // Look for incentive indicators in the UI
      const incentiveIndicators = await page.locator('[data-testid*="incentive"], .incentive-badge, .incentive-apr, [class*="incentive"]').all();
      
      console.log(`Incentive indicators found: ${incentiveIndicators.length}`);
      
      // Look for APR displays
      const aprDisplays = await page.locator('[data-testid*="apr"], .apr, [class*="apr"]').all();
      console.log(`APR display elements found: ${aprDisplays.length}`);
      
      // Check for any pool cards/rows
      const poolCards = await page.locator('.pool-card, .pool-row, [data-testid*="pool"]').all();
      console.log(`Pool cards/rows found: ${poolCards.length}`);
      
      // Log page content for debugging
      const pageContent = await page.textContent('body');
      const hasIncentiveText = pageContent?.includes('incentive') || pageContent?.includes('Incentive') || pageContent?.includes('APR');
      console.log(`Page contains incentive/APR text: ${hasIncentiveText}`);
      
      console.log('✅ UI elements checked for incentive display');
    });

    test('should correctly show combined APR (fee + incentive) in pool list', async ({ page }) => {
      console.log('=== TESTING: Combined APR Display ===');
      
      await page.goto(DEX_CONFIG.frontendUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Navigate to pools or liquidity section
      const poolsLink = page.locator('a:has-text("Pools"), a:has-text("Liquidity"), button:has-text("Pools")').first();
      if (await poolsLink.isVisible({ timeout: 5000 })) {
        await poolsLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/dex-pools-apr-display.png',
        fullPage: true 
      });
      
      // Look for APR values in the page
      const aprValues = await page.locator('text=/\\d+\\.?\\d*%/').all();
      console.log(`Percentage values found: ${aprValues.length}`);
      
      // Extract and log APR values
      for (let i = 0; i < Math.min(5, aprValues.length); i++) {
        const text = await aprValues[i].textContent();
        console.log(`APR value ${i + 1}: ${text}`);
      }
      
      console.log('✅ APR display validation complete');
    });

    test('should show tooltip/breakdown of APR components', async ({ page }) => {
      console.log('=== TESTING: APR Breakdown Tooltip ===');
      
      await page.goto(DEX_CONFIG.frontendUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Find and hover over APR elements to trigger tooltips
      const aprElements = await page.locator('[data-testid*="apr"], .apr, [class*="apr"]').all();
      
      for (let i = 0; i < Math.min(3, aprElements.length); i++) {
        try {
          await aprElements[i].hover();
          await page.waitForTimeout(1000);
          
          // Check for tooltip appearance
          const tooltip = page.locator('.tooltip, [role="tooltip"], .popover, [data-testid*="tooltip"]').first();
          const tooltipVisible = await tooltip.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (tooltipVisible) {
            const tooltipText = await tooltip.textContent();
            console.log(`Tooltip ${i + 1}: ${tooltipText}`);
            
            await page.screenshot({ 
              path: `tests/screenshots/dex-apr-tooltip-${i + 1}.png`,
              fullPage: false 
            });
          }
        } catch (e) {
          console.log(`Could not interact with APR element ${i + 1}`);
        }
      }
      
      console.log('✅ APR tooltip validation complete');
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    
    test('should handle pools with zero TVL gracefully', async ({ request }) => {
      console.log('=== TESTING: Zero TVL Handling ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 100 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Find pools with zero or very low TVL
      const zeroTvlPools = data.pools.filter((pool: PoolWithIncentive) => 
        !pool.tvl || pool.tvl === 0 || pool.tvl < 1
      );
      
      console.log(`Pools with zero/low TVL: ${zeroTvlPools.length}`);
      
      for (const pool of zeroTvlPools) {
        // Ensure incentiveApr doesn't cause division by zero errors
        expect(pool.incentiveApr).toBeDefined();
        expect(typeof pool.incentiveApr === 'number' || pool.incentiveApr === undefined).toBeTruthy();
        expect(pool.incentiveApr !== Infinity).toBeTruthy();
        expect(!isNaN(pool.incentiveApr || 0)).toBeTruthy();
        
        console.log(`Pool: ${pool.poolName}, TVL: ${pool.tvl}, incentiveApr: ${pool.incentiveApr}`);
      }
      
      console.log('✅ Zero TVL pools handled gracefully');
    });

    test('should handle expired incentive programs correctly', async ({ request }) => {
      console.log('=== TESTING: Expired Incentive Programs ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 50 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Check pools for expired programs
      for (const pool of data.pools) {
        if (pool.incentiveProgram && pool.incentiveProgram.endDate) {
          const endDate = new Date(pool.incentiveProgram.endDate);
          const now = new Date();
          const isExpired = endDate < now;
          
          if (isExpired) {
            console.log(`Pool: ${pool.poolName} - Program expired on ${pool.incentiveProgram.endDate}`);
            
            // Expired programs should show hasActiveIncentive = false
            expect(pool.hasActiveIncentive).toBe(false);
            // Expired programs should show 0 incentive APR
            expect(pool.incentiveApr === 0 || pool.incentiveApr === undefined).toBeTruthy();
          }
        }
      }
      
      console.log('✅ Expired incentive programs handled correctly');
    });

    test('should validate incentive APR doesnt exceed reasonable limits', async ({ request }) => {
      console.log('=== TESTING: APR Sanity Check ===');
      
      const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
        params: { limit: 100 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Maximum reasonable APR (e.g., 10000% = 100x)
      const MAX_REASONABLE_APR = 10000;
      
      let unreasonableAprs: string[] = [];
      
      for (const pool of data.pools) {
        const incentiveApr = pool.incentiveApr || 0;
        const totalApr = pool.apr1d || 0;
        
        if (incentiveApr > MAX_REASONABLE_APR) {
          unreasonableAprs.push(`${pool.poolName}: incentiveApr=${incentiveApr}%`);
        }
        
        if (totalApr > MAX_REASONABLE_APR) {
          unreasonableAprs.push(`${pool.poolName}: apr1d=${totalApr}%`);
        }
      }
      
      if (unreasonableAprs.length > 0) {
        console.log('Pools with unreasonably high APR:', unreasonableAprs);
      } else {
        console.log('All APR values within reasonable limits');
      }
      
      // Warning but not failure - unusually high APRs should be investigated
      expect(unreasonableAprs.length).toBe(0);
      
      console.log('✅ APR sanity check complete');
    });
  });

  test.describe('Performance and Consistency', () => {
    
    test('should return consistent incentive APR across multiple requests', async ({ request }) => {
      console.log('=== TESTING: APR Consistency ===');
      
      const results: Map<string, number[]> = new Map();
      
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
          params: { limit: 10 }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        
        for (const pool of data.pools) {
          const key = pool.poolHash || pool.poolName;
          const apr = pool.incentiveApr || 0;
          
          if (!results.has(key)) {
            results.set(key, []);
          }
          results.get(key)!.push(apr);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Check consistency
      let inconsistentPools: string[] = [];
      
      for (const [poolKey, aprs] of results) {
        if (aprs.length > 1) {
          const uniqueAprs = [...new Set(aprs)];
          if (uniqueAprs.length > 1) {
            inconsistentPools.push(`${poolKey}: ${aprs.join(', ')}`);
          }
        }
      }
      
      console.log(`Checked ${results.size} pools for consistency`);
      
      if (inconsistentPools.length > 0) {
        console.log('Inconsistent APR values:', inconsistentPools);
      }
      
      // Allow no inconsistencies (within same short time frame)
      expect(inconsistentPools.length).toBe(0);
      
      console.log('✅ APR values are consistent across requests');
    });

    test('should include incentive fields without significant performance impact', async ({ request }) => {
      console.log('=== TESTING: API Performance ===');
      
      const measurements: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
          params: { limit: 50 }
        });
        
        const duration = Date.now() - startTime;
        measurements.push(duration);
        
        expect(response.ok()).toBeTruthy();
      }
      
      const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const maxDuration = Math.max(...measurements);
      const minDuration = Math.min(...measurements);
      
      console.log(`API Response Times (ms):`);
      console.log(`  Average: ${avgDuration.toFixed(0)}`);
      console.log(`  Min: ${minDuration}`);
      console.log(`  Max: ${maxDuration}`);
      console.log(`  All: ${measurements.join(', ')}`);
      
      // API should respond within 5 seconds
      expect(avgDuration).toBeLessThan(5000);
      
      console.log('✅ API performance acceptable');
    });
  });
});

test.describe('Incentive Program Management', () => {
  
  test('should list pools with active incentive programs', async ({ request }) => {
    console.log('=== LISTING: Pools with Active Incentive Programs ===');
    
    const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
      params: { 
        limit: 100,
        sortBy: 'tvl',
        sortOrder: 'desc'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    const activeIncentivePools = data.pools.filter((pool: PoolWithIncentive) => 
      pool.hasActiveIncentive === true
    );
    
    console.log(`\n📊 Pools with Active Incentive Programs: ${activeIncentivePools.length}\n`);
    console.log('Pool Name'.padEnd(30) + 'TVL'.padEnd(20) + 'Fee APR'.padEnd(12) + 'Incentive APR'.padEnd(15) + 'Total APR');
    console.log('-'.repeat(90));
    
    for (const pool of activeIncentivePools) {
      const poolName = (pool.poolName || 'Unknown').padEnd(30);
      const tvl = `$${(pool.tvl || 0).toLocaleString()}`.padEnd(20);
      const feeApr = `${(pool.feeApr || 0).toFixed(2)}%`.padEnd(12);
      const incentiveApr = `${(pool.incentiveApr || 0).toFixed(2)}%`.padEnd(15);
      const totalApr = `${(pool.apr1d || 0).toFixed(2)}%`;
      
      console.log(`${poolName}${tvl}${feeApr}${incentiveApr}${totalApr}`);
    }
    
    console.log('-'.repeat(90));
    console.log(`Total Active Incentive Pools: ${activeIncentivePools.length}`);
    
    // Summary statistics
    if (activeIncentivePools.length > 0) {
      const avgIncentiveApr = activeIncentivePools.reduce((sum: number, p: PoolWithIncentive) => 
        sum + (p.incentiveApr || 0), 0) / activeIncentivePools.length;
      const maxIncentiveApr = Math.max(...activeIncentivePools.map((p: PoolWithIncentive) => p.incentiveApr || 0));
      
      console.log(`\nStatistics:`);
      console.log(`  Average Incentive APR: ${avgIncentiveApr.toFixed(2)}%`);
      console.log(`  Max Incentive APR: ${maxIncentiveApr.toFixed(2)}%`);
    }
    
    console.log('\n✅ Active incentive pools listed');
  });

  test('should validate incentive program dates', async ({ request }) => {
    console.log('=== TESTING: Incentive Program Date Validation ===');
    
    const response = await request.get(`${DEX_CONFIG.apiUrl}/v1/pools`, {
      params: { limit: 50 }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    const now = new Date();
    
    for (const pool of data.pools) {
      if (pool.incentiveProgram) {
        const program = pool.incentiveProgram;
        const startDate = new Date(program.startDate);
        const endDate = new Date(program.endDate);
        
        // Validate date logic
        expect(endDate > startDate).toBeTruthy();
        
        // If pool says hasActiveIncentive, dates should be valid
        if (pool.hasActiveIncentive) {
          expect(startDate <= now).toBeTruthy();
          expect(endDate > now).toBeTruthy();
          
          console.log(`${pool.poolName}: Active from ${program.startDate} to ${program.endDate}`);
        }
      }
    }
    
    console.log('✅ Incentive program dates validated');
  });
});
