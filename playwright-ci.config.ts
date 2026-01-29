import { defineConfig, devices } from '@playwright/test';

/**
 * CI/CD Optimized Playwright Configuration with Automated Wallet Connection
 * Designed for automated testing environments with mock wallet support
 */
export default defineConfig({
  testDir: './tests',
  
  // Optimized timeout for CI/CD
  timeout: 120000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 15000
  },
  
  // Test execution configuration
  fullyParallel: false, // Sequential for wallet state management
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2, // Single worker in CI for stability
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-ci',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/ci-results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/ci-junit.xml' 
    }],
    ['github'], // GitHub Actions integration
    ['line']
  ],
  
  // Global test configuration
  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com',
    
    // Browser context options optimized for CI
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Extended timeouts for wallet operations
    actionTimeout: 20000,
    navigationTimeout: 30000,
    
    // Ignore HTTPS errors for testing
    ignoreHTTPSErrors: true,
    
    // Additional context options for Web3 testing
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Custom user agent for identification
    userAgent: 'Gala-Launchpad-CI-Test-Suite/1.0',
    
    // Disable web security for wallet mocking
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    }
  },

  // Test projects optimized for CI/CD
  projects: [
    // Main CI testing project
    {
      name: 'ci-automated',
      testMatch: [
        '**/bonding-curve-calculations.spec.ts',
        '**/launch-page-simple.spec.ts',
        '**/gala-defi.spec.ts',
        '**/automated-wallet-*.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        // CI-specific settings
        headless: true,
        // Automated wallet configuration
        extraHTTPHeaders: {
          'X-Test-Environment': 'ci',
          'X-Wallet-Mode': 'automated'
        }
      },
      timeout: 180000 // Extended for wallet operations
    },

    // Mathematical validation (no wallet required)
    {
      name: 'mathematical-validation',
      testMatch: [
        '**/bonding-curve-calculations.spec.ts',
        '**/graduation-rewards-math.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      timeout: 90000
    },

    // Feature validation with automated wallet
    {
      name: 'feature-validation-automated',
      testMatch: [
        '**/diamond-hand-bonus.spec.ts',
        '**/dump-event-protection.spec.ts',
        '**/launch-page-simple.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        extraHTTPHeaders: {
          'X-Wallet-Mode': 'mock'
        }
      },
      dependencies: ['mathematical-validation'],
      timeout: 150000
    },

    // Integration tests with full automation
    {
      name: 'integration-automated',
      testMatch: [
        '**/automated-token-graduation.spec.ts',
        '**/automated-graduation-rewards.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        extraHTTPHeaders: {
          'X-Test-Type': 'integration-automated',
          'X-Wallet-Mode': 'full-mock'
        }
      },
      dependencies: ['feature-validation-automated'],
      timeout: 300000
    },

    // Quick smoke tests
    {
      name: 'smoke-tests',
      testMatch: [
        '**/quick-form-test.spec.ts',
        '**/simple-validation.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      timeout: 60000
    }
  ],

  // Global setup for CI environment
  globalSetup: require.resolve('./tests/helpers/ci-global-setup.ts'),
  
  // Global teardown
  globalTeardown: require.resolve('./tests/helpers/ci-global-teardown.ts'),

  // Environment-specific metadata
  metadata: {
    testSuite: 'Gala Launchpad CI/CD Automated Test Suite',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'test',
    walletMode: 'automated',
    features: [
      'Automated Wallet Connection',
      'Mock Wallet Support',
      'CI/CD Optimized',
      'Mathematical Validation',
      'Feature Testing',
      'Integration Testing'
    ],
    coverage: {
      automated: '100%',
      mathematical: '100%',
      features: '95%',
      integration: '90%'
    }
  }
});

// Export CI-specific configuration
export const ciConfig = {
  // Wallet configuration for CI
  wallet: {
    type: 'mock' as const,
    address: process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be',
    autoConnect: true,
    timeout: 30000
  },
  
  // Test data for CI
  testData: {
    token: {
      name: 'CITestCoin',
      symbol: 'CTC',
      description: 'Automated CI test token'
    },
    trading: {
      initialBuy: 10000,
      graduationThreshold: 1640985.84
    }
  },
  
  // CI-specific timeouts
  timeouts: {
    walletConnection: 30000,
    pageLoad: 20000,
    formSubmission: 15000,
    tokenCreation: 60000,
    graduation: 120000
  },
  
  // Environment detection
  isCI: !!process.env.CI,
  isGitHubActions: !!process.env.GITHUB_ACTIONS,
  isLocal: !process.env.CI
};





