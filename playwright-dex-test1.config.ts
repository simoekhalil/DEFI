import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration for DEX Test1 Environment
 * 
 * Tests the new incentive APR feature:
 * - incentiveApr field in pool list
 * - hasActiveIncentive field in pool list
 * - apr1d includes both fee APR and incentive APR
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/dex-incentive-apr.spec.ts', '**/dex-*.spec.ts'],
  
  // Test execution settings
  timeout: 60000,
  expect: {
    timeout: 15000
  },
  
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-dex-test1',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/dex-test1-results.json' 
    }],
    ['line']
  ],
  
  // Global settings
  use: {
    // DEX Test1 Frontend URL
    baseURL: process.env.DEX_FRONTEND_URL || 'https://dex-frontend-test1.defi.gala.com',
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    ignoreHTTPSErrors: true,
    
    // Extra HTTP headers for API requests
    extraHTTPHeaders: {
      'X-Test-Environment': 'dex-test1',
      'X-Test-Feature': 'incentive-apr'
    }
  },

  projects: [
    {
      name: 'dex-incentive-api',
      testMatch: '**/dex-incentive-apr.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        baseURL: 'https://dex-frontend-test1.defi.gala.com'
      },
      timeout: 90000
    },
    
    {
      name: 'dex-incentive-ui',
      testMatch: '**/dex-incentive-apr.spec.ts',
      testIgnore: '**/Pool List Field Validation/**',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        baseURL: 'https://dex-frontend-test1.defi.gala.com'
      },
      timeout: 120000
    }
  ],

  // Environment-specific metadata
  metadata: {
    testSuite: 'DEX Incentive APR Feature Tests',
    version: '1.0.0',
    environment: 'test1',
    feature: 'incentive-apr',
    endpoints: {
      frontend: 'https://dex-frontend-test1.defi.gala.com',
      backend: 'https://dex-backend-test1.defi.gala.com',
      api: 'https://dex-api-platform-dex-stage-gala.gala.com'
    },
    newFields: [
      'incentiveApr',
      'hasActiveIncentive'
    ],
    changes: [
      'Include incentiveApr and hasActiveIncentive fields in pool list',
      'Calculate incentive APR from bonus pool amount and program duration',
      'apr1d now includes both fee APR and incentive APR'
    ]
  }
});

// Export DEX Test1 configuration
export const dexTest1Config = {
  frontend: 'https://dex-frontend-test1.defi.gala.com',
  backend: 'https://dex-backend-test1.defi.gala.com',
  api: 'https://dex-api-platform-dex-stage-gala.gala.com',
  
  // Endpoints to test
  endpoints: {
    pools: '/v1/pools',
    poolDetails: '/v1/pools/:poolHash',
    incentivePrograms: '/v1/incentive-programs'
  },
  
  // Expected new fields
  expectedFields: {
    pool: {
      incentiveApr: 'number',
      hasActiveIncentive: 'boolean'
    }
  },
  
  // Test thresholds
  thresholds: {
    maxReasonableApr: 10000,
    apiResponseTime: 5000,
    consistency: 0.01
  }
};
