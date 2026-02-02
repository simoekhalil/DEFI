import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright config for DEX Liquidity Pool Creation E2E Tests
 * 
 * These tests submit REAL transactions via MetaMask (Dappwright)
 * 
 * Usage:
 *   npx playwright test --config=playwright-liquidity-e2e.config.ts
 * 
 * Requirements:
 *   - WALLET_SEED_PHRASE in .env
 *   - Wallet with sufficient GALA + token balance
 */

export default defineConfig({
  testDir: './tests',
  testMatch: '**/dex-liquidity-pool-creation-e2e.spec.ts',
  
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
  
  // Detailed reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report-liquidity-e2e', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results-liquidity-e2e/results.json' }],
  ],
  
  outputDir: 'test-results-liquidity-e2e',
  
  use: {
    // Base URL for the DEX
    baseURL: 'https://lpad-frontend-dev1.defi.gala.com',
    
    // Browser settings - headed mode required for Dappwright/MetaMask
    headless: false,
    
    // Viewport
    viewport: { width: 1920, height: 1080 },
    
    // Screenshots and traces for debugging
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: 60000,
    actionTimeout: 30000,
  },

  projects: [
    {
      name: 'liquidity-e2e-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use a larger viewport for DEX UI
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
