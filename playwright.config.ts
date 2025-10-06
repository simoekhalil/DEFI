import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  // It's a live site: don't hammer it.
  workers: process.env.CI ? 1 : 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  outputDir: 'test-results',

  use: {
    baseURL: process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com',
    browserName: 'chromium',
    channel: 'chromium',
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  reporter: [
    ['list'],
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
