import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright Configuration for Testnet Wallet Extension Testing
 * This config automatically loads the testnet Gala Wallet extension
 */

const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Sequential for wallet state management
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for manual wallet testing
  workers: 1, // One worker to maintain extension state
  
  reporter: [
    ['html', { outputFolder: 'playwright-report-testnet' }],
    ['json', { outputFile: 'test-results-testnet.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'https://lpad-frontend-dev1.defi.gala.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Increased timeouts for wallet operations
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  
  timeout: 180000, // 3 minutes per test

  projects: [
    {
      name: 'testnet-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Launch browser with extension loaded
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
          ],
          headless: false,
          slowMo: 100, // Slow down operations slightly for stability
        },
        // Bypass CSP for extension testing
        bypassCSP: true,
        
        // More lenient load state to prevent premature "Test ended" errors
        navigationTimeout: 90000,
      },
    },
  ],
});

// Export testnet-specific configuration
export const testnetConfig = {
  extensionPath,
  wallet: {
    address: process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be',
    privateKey: process.env.TEST_PRIVATE_KEY,
    network: 'testnet',
  },
  site: {
    url: 'https://lpad-frontend-dev1.defi.gala.com',
    name: 'Gala DeFi Launchpad (Testnet)',
  },
  timeouts: {
    walletConnection: 60000,
    pageLoad: 30000,
    balanceCheck: 10000,
  },
};

