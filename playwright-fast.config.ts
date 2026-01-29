import { defineConfig, devices } from '@playwright/test';

/**
 * Fast configuration for quick test execution
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel for faster startup
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry for network reliability */
  retries: 2, // Retry failed tests up to 2 times
  /* Single worker for faster execution */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['line']],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://lpad-frontend-dev1.defi.gala.com',

    /* Increased timeouts for network reliability */
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    /* Minimal media capture */
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true
      },
    },
  ],
});
