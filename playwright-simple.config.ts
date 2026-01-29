import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright Configuration for Quick Testing
 * Optimized for speed and basic functionality
 */
export default defineConfig({
  testDir: './tests',
  
  // Shorter timeouts for faster execution
  timeout: 30000,
  expect: { timeout: 5000 },
  
  // Minimal configuration
  fullyParallel: false, // Run sequentially for stability
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for speed
  workers: 1, // Single worker for simplicity
  
  // Simple reporter
  reporter: [['line']],
  
  // Basic browser configuration
  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  // Single project for testing
  projects: [
    {
      name: 'chromium-simple',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No web server - assume it's already running or test static content
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
