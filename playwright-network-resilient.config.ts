import { defineConfig, devices } from '@playwright/test';

/**
 * Network-resilient configuration for unreliable network conditions
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel for network stability
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests multiple times for network issues */
  retries: 3, // More retries for network issues
  /* Single worker for network stability */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['line'],
    ['json', { outputFile: 'test-results-network-resilient.json' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://lpad-frontend-dev1.defi.gala.com',

    /* Extended timeouts for network reliability */
    actionTimeout: 30000,
    navigationTimeout: 60000,
    
    /* Minimal media capture for speed */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-network-resilient',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true,
        // Additional network resilience settings
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080'
          ]
        }
      },
    },
  ],

  /* Global timeout for the entire test run */
  globalTimeout: 30 * 60 * 1000, // 30 minutes

  /* Timeout for each test */
  timeout: 5 * 60 * 1000, // 5 minutes per test

  /* Expect timeout for assertions */
  expect: {
    timeout: 15000
  }
});
