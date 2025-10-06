import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  outputDir: 'test-results',

  use: {
    baseURL: process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com',
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
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
        channel: 'chromium',
        headless: process.env.HEADLESS !== 'false',
      },
      metadata: { wallet: 'metamask' },
    },
  ],
});
