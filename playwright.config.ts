import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  // It's a live site: don't hammer it.
  workers: 1, // Always use 1 worker to avoid parallel execution issues
  retries: 0, // No retries for cleaner output
  timeout: 180_000, // 3 minutes - wallet connections and network requests can be slow
  outputDir: 'test-results',
  fullyParallel: false, // Run tests sequentially
  
  use: {
    baseURL: process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com',
    browserName: 'chromium',
    channel: 'chromium',
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    // Add verbose action logging
    actionTimeout: 10000,
  },

  reporter: [
    ['list', { printSteps: true }], // Show verbose step-by-step output
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/report.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      metadata: { wallet: 'metamask' },
    },
  ],
});
