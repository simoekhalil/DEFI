import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright config for GalaSwap DEX E2E Tests
 * 
 * These tests submit REAL transactions via MetaMask (Dappwright):
 * - Swap tokens
 * - Add liquidity to pools
 * - Remove liquidity
 * 
 * GalaSwap DEX URLs:
 * - Frontend: https://dex-frontend-test1.defi.gala.com
 * - Backend: https://dex-backend-test1.defi.gala.com
 * 
 * Usage:
 *   npx playwright test --config=playwright-galaswap-e2e.config.ts
 * 
 * Requirements:
 *   - WALLET_SEED_PHRASE in .env
 *   - Wallet with sufficient GALA + GUSDC balance
 */

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/galaswap-dex-e2e.spec.ts', '**/galaswap-dex-liquidity-e2e.spec.ts'],
  
  // Long timeout for wallet operations and transaction confirmations
  timeout: 300000, // 5 minutes per test
  expect: {
    timeout: 30000,
  },
  
  // No parallel execution - wallet state is shared
  fullyParallel: false,
  workers: 1,
  
  // Don't retry on failure (transactions are idempotent)
  retries: 0,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-galaswap-e2e',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/galaswap-e2e-results.json' 
    }],
    ['line']
  ],
  
  // Output settings
  outputDir: 'test-results-galaswap-e2e',
  
  use: {
    // GalaSwap DEX Frontend URL
    baseURL: process.env.DEX_FRONTEND_URL || 'https://dex-frontend-test1.defi.gala.com',
    
    // Always run headed for MetaMask interactions
    headless: false,
    
    // Screenshots for debugging
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Longer timeouts for MetaMask and transactions
    actionTimeout: 30000,
    navigationTimeout: 60000,
    
    // Ignore HTTPS errors for dev environment
    ignoreHTTPSErrors: true,
    
    // Viewport
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'galaswap-liquidity-e2e',
      testMatch: '**/galaswap-dex-liquidity-e2e.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--allow-running-insecure-content',
          ],
          slowMo: 100,
        },
      },
    },
  ],

  // Environment-specific metadata
  metadata: {
    testSuite: 'GalaSwap DEX E2E Tests',
    version: '1.0.0',
    transactionType: 'REAL',
    endpoints: {
      frontend: 'https://dex-frontend-test1.defi.gala.com',
      backend: 'https://dex-backend-test1.defi.gala.com',
      api: 'https://dex-api-platform-dex-stage-gala.gala.com',
    },
    features: [
      'Swap tokens',
      'Add liquidity',
      'Remove liquidity',
      'Pool creation',
    ],
    pools: {
      primary: 'GALA/GUSDC',
      feeTiers: ['0.05%', '0.3%', '1%'],
    },
  },
});
