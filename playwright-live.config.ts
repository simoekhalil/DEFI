import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Testing Live Gala Launchpad Site
 * No local web server - tests against live URL
 */
export default defineConfig({
  testDir: './tests',
  
  timeout: 90000,
  
  expect: {
    timeout: 10000
  },
  
  fullyParallel: false,
  retries: 1,
  workers: 1,
  
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-gala-launchpad',
      open: 'always'
    }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com',
    
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    ignoreHTTPSErrors: true,
    
    permissions: ['clipboard-read', 'clipboard-write'],
    
    userAgent: 'Gala-Launchpad-Test-Suite/1.0'
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Load Gala wallet extension
        launchOptions: {
          args: [
            `--disable-extensions-except=C:\\Users\\Simone\\web3-testing-app\\extensions\\testnet-wallet\\build`,
            `--load-extension=C:\\Users\\Simone\\web3-testing-app\\extensions\\testnet-wallet\\build`,
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      },
    },
  ],
});






