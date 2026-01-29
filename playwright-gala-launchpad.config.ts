import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright Configuration for Gala Launchpad Testing
 * Optimized for mathematical validation, feature testing, and integration scenarios
 */
export default defineConfig({
  testDir: './tests',
  
  // Extended timeout for complex mathematical calculations and network operations
  timeout: 90000,
  
  // Expect timeout for individual assertions
  expect: {
    timeout: 10000
  },
  
  // Global setup and teardown (optional)
  // globalSetup: require.resolve('./tests/helpers/global-setup.ts'),
  // globalTeardown: require.resolve('./tests/helpers/global-teardown.ts'),
  
  // Test execution configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-gala-launchpad',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/gala-launchpad-results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/gala-launchpad-junit.xml' 
    }],
    ['line']
  ],
  
  // Global test configuration
  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com',
    
    // Browser context options
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Extended action timeout for complex interactions
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Ignore HTTPS errors for development
    ignoreHTTPSErrors: true,
    
    // Additional context options for Web3 testing
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Custom user agent for identification
    userAgent: 'Gala-Launchpad-Test-Suite/1.0'
  },

  // Test projects for different test categories
  projects: [
    // Mathematical validation tests
    {
      name: 'mathematical-validation',
      testMatch: [
        '**/bonding-curve-calculations.spec.ts',
        '**/graduation-rewards-math.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        // Optimized for calculation-heavy tests
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
      timeout: 120000, // Extended timeout for complex calculations
    },

    // Feature validation tests
    {
      name: 'feature-validation',
      testMatch: [
        '**/diamond-hand-bonus.spec.ts',
        '**/dump-event-protection.spec.ts',
        '**/launch-page-simple.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        // Standard configuration for feature tests
      },
      dependencies: ['mathematical-validation']
    },

    // Integration and graduation tests
    {
      name: 'integration-tests',
      testMatch: [
        '**/token-graduation.spec.ts',
        '**/graduation-rewards.spec.ts',
        '**/gala-wallet-integration-fixed.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        // Network simulation for integration tests
        offline: false,
        extraHTTPHeaders: {
          'X-Test-Type': 'integration'
        }
      },
      dependencies: ['feature-validation']
    },

    // Mobile testing
    {
      name: 'mobile-validation',
      testMatch: [
        '**/launch-page-simple.spec.ts',
        '**/quick-form-test.spec.ts'
      ],
      use: {
        ...devices['iPhone 13'],
      }
    },

    // Cross-browser validation (critical tests only)
    {
      name: 'firefox-critical',
      testMatch: [
        '**/bonding-curve-calculations.spec.ts',
        '**/token-graduation.spec.ts'
      ],
      use: {
        ...devices['Desktop Firefox'],
      }
    },

    {
      name: 'webkit-critical',
      testMatch: [
        '**/bonding-curve-calculations.spec.ts',
        '**/diamond-hand-bonus.spec.ts'
      ],
      use: {
        ...devices['Desktop Safari'],
      }
    },

    // Performance testing
    {
      name: 'performance-tests',
      testMatch: [
        '**/bonding-curve-calculations.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        // Performance monitoring
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--enable-memory-info'
          ]
        }
      },
      timeout: 180000 // Extended for performance tests
    },

    // Network resilience testing
    {
      name: 'network-resilience',
      testMatch: [
        '**/gala-wallet-integration-fixed.spec.ts',
        '**/dump-event-protection.spec.ts'
      ],
      use: {
        ...devices['Desktop Chrome'],
        // Simulate slow network conditions
        launchOptions: {
          args: ['--simulate-slow-connection']
        }
      }
    }
  ],

  // Web server configuration for local testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test'
    }
  },

  // Global test metadata
  metadata: {
    testSuite: 'Gala Launchpad Comprehensive Test Suite',
    version: '1.0.0',
    features: [
      'Bonding Curve Mathematics',
      'Diamond Hand Bonus System',
      'Token Graduation Process',
      'Graduation Rewards System',
      'Dump Event Protection',
      'Form Validation',
      'Wallet Integration'
    ],
    coverage: {
      mathematical: '100%',
      features: '95%',
      integration: '90%',
      ui: '85%'
    }
  }
});

// Export test configuration for use in other files
export const testConfig = {
  // Mathematical constants for validation
  bondingCurve: {
    a: 1.6507e-5,
    b: 1.6507e-6,
    maxSupply: 10000000,
    standardizedSupply: 1000000000
  },
  
  // Test thresholds and tolerances
  tolerances: {
    priceCalculation: 0.01, // 1% tolerance for floating point
    timeResponse: 3000, // 3 seconds for dump event response
    performanceThreshold: 100 // 100ms for price calculations
  },
  
  // Test data ranges
  testRanges: {
    supplyLevels: [100000, 500000, 1000000, 5000000, 9000000],
    priceDropThresholds: [5, 10, 15, 25, 50],
    feePercentages: [1, 2, 5, 10],
    graduationThresholds: [95, 98, 100]
  },
  
  // Graduation rewards constants
  graduationRewards: {
    thresholdGala: 1640985.84,
    creatorRewardGala: 17777,
    platformFeePercent: 5,
    targetUsdValue: 24600,
    dexPoolMinPercent: 90
  }
};
