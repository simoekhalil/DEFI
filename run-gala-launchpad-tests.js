#!/usr/bin/env node

/**
 * Gala Launchpad Test Execution Script
 * Comprehensive test runner for all Gala Launchpad functionality
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  configFile: 'playwright-gala-launchpad.config.ts',
  outputDir: 'test-results-gala-launchpad',
  reportDir: 'playwright-report-gala-launchpad',
  screenshotDir: 'tests/screenshots'
};

// Test suites with priorities
const TEST_SUITES = {
  critical: [
    'bonding-curve-calculations.spec.ts',
    'token-graduation.spec.ts',
    'graduation-rewards-math.spec.ts'
  ],
  features: [
    'diamond-hand-bonus.spec.ts',
    'dump-event-protection.spec.ts'
  ],
  integration: [
    'launch-page-simple.spec.ts',
    'graduation-rewards.spec.ts',
    'gala-wallet-integration-fixed.spec.ts'
  ],
  mathematical: [
    'bonding-curve-calculations.spec.ts',
    'graduation-rewards-math.spec.ts'
  ],
  graduation: [
    'graduation-rewards.spec.ts',
    'graduation-rewards-math.spec.ts',
    'token-graduation.spec.ts'
  ],
  performance: [
    'bonding-curve-calculations.spec.ts', // Performance-focused run
    'graduation-rewards-math.spec.ts'
  ]
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Ensure required directories exist
function setupDirectories() {
  const dirs = [
    TEST_CONFIG.outputDir,
    TEST_CONFIG.reportDir,
    TEST_CONFIG.screenshotDir
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logInfo(`Created directory: ${dir}`);
    }
  });
}

// Check if Playwright is installed
function checkPlaywrightInstallation() {
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    logSuccess('Playwright is installed');
    return true;
  } catch (error) {
    logError('Playwright is not installed');
    logInfo('Run: npm install @playwright/test');
    return false;
  }
}

// Install Playwright browsers if needed
function installBrowsers() {
  try {
    logInfo('Installing Playwright browsers...');
    execSync('npx playwright install', { stdio: 'inherit' });
    logSuccess('Playwright browsers installed');
  } catch (error) {
    logError('Failed to install Playwright browsers');
    throw error;
  }
}

// Run a specific test suite
async function runTestSuite(suiteName, testFiles, options = {}) {
  logHeader(`Running ${suiteName.toUpperCase()} Tests`);
  
  const testPattern = testFiles.map(file => `"tests/**/${file}"`).join(' ');
  const cmd = [
    'npx playwright test',
    `--config=${TEST_CONFIG.configFile}`,
    testPattern,
    options.project ? `--project=${options.project}` : '',
    options.headed ? '--headed' : '',
    options.debug ? '--debug' : '',
    options.reporter ? `--reporter=${options.reporter}` : '',
    options.workers ? `--workers=${options.workers}` : ''
  ].filter(Boolean).join(' ');
  
  logInfo(`Command: ${cmd}`);
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    logSuccess(`${suiteName} tests completed successfully`);
    return true;
  } catch (error) {
    logError(`${suiteName} tests failed`);
    return false;
  }
}

// Generate test summary report
function generateSummary() {
  logHeader('Generating Test Summary');
  
  const summaryFile = path.join(TEST_CONFIG.outputDir, 'test-summary.json');
  const reportFile = path.join(TEST_CONFIG.reportDir, 'index.html');
  
  const summary = {
    timestamp: new Date().toISOString(),
    configuration: TEST_CONFIG,
    testSuites: TEST_SUITES,
    results: {
      reportAvailable: fs.existsSync(reportFile),
      reportPath: reportFile
    }
  };
  
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  logSuccess(`Test summary generated: ${summaryFile}`);
  
  if (summary.results.reportAvailable) {
    logInfo(`HTML report available: ${reportFile}`);
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    suite: args.find(arg => arg.startsWith('--suite='))?.split('=')[1] || 'all',
    project: args.find(arg => arg.startsWith('--project='))?.split('=')[1],
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    install: args.includes('--install'),
    reporter: args.find(arg => arg.startsWith('--reporter='))?.split('=')[1] || 'html',
    workers: args.find(arg => arg.startsWith('--workers='))?.split('=')[1]
  };
  
  logHeader('Gala Launchpad Test Suite');
  logInfo(`Suite: ${options.suite}`);
  logInfo(`Project: ${options.project || 'all'}`);
  logInfo(`Mode: ${options.headed ? 'headed' : 'headless'}`);
  
  // Setup
  setupDirectories();
  
  if (!checkPlaywrightInstallation()) {
    process.exit(1);
  }
  
  if (options.install) {
    installBrowsers();
  }
  
  // Execute tests based on suite selection
  let success = true;
  
  try {
    switch (options.suite) {
      case 'critical':
        success = await runTestSuite('Critical', TEST_SUITES.critical, options);
        break;
        
      case 'features':
        success = await runTestSuite('Features', TEST_SUITES.features, options);
        break;
        
      case 'integration':
        success = await runTestSuite('Integration', TEST_SUITES.integration, options);
        break;
        
      case 'performance':
        success = await runTestSuite('Performance', TEST_SUITES.performance, {
          ...options,
          project: 'performance-tests'
        });
        break;
        
      case 'mathematical':
        success = await runTestSuite('Mathematical', ['bonding-curve-calculations.spec.ts'], {
          ...options,
          project: 'mathematical-validation'
        });
        break;
        
      case 'all':
      default:
        // Run all test suites in order
        for (const [suiteName, testFiles] of Object.entries(TEST_SUITES)) {
          if (suiteName === 'performance') continue; // Skip performance in 'all' mode
          
          const suiteSuccess = await runTestSuite(suiteName, testFiles, options);
          if (!suiteSuccess) {
            success = false;
            if (suiteName === 'critical') {
              logError('Critical tests failed - stopping execution');
              break;
            }
          }
        }
        break;
    }
    
    // Generate summary
    generateSummary();
    
    // Final status
    if (success) {
      logHeader('Test Execution Completed Successfully');
      logSuccess('All selected test suites passed');
    } else {
      logHeader('Test Execution Completed with Failures');
      logError('Some test suites failed');
    }
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    success = false;
  }
  
  process.exit(success ? 0 : 1);
}

// Help function
function showHelp() {
  console.log(`
Gala Launchpad Test Runner

Usage: node run-gala-launchpad-tests.js [options]

Options:
  --suite=<suite>     Test suite to run (critical|features|integration|performance|mathematical|all)
  --project=<name>    Specific project to run
  --headed           Run tests in headed mode
  --debug            Run tests in debug mode
  --install          Install Playwright browsers before running
  --reporter=<type>   Reporter type (html|json|junit|line)
  --workers=<num>     Number of parallel workers
  --help             Show this help message

Test Suites:
  critical           Bonding curve calculations and token graduation
  features           Diamond Hand bonus and dump event protection
  integration        Launch page and wallet integration tests
  performance        Performance-focused test execution
  mathematical       Mathematical validation only
  all                All test suites (default)

Examples:
  node run-gala-launchpad-tests.js --suite=critical
  node run-gala-launchpad-tests.js --suite=all --headed
  node run-gala-launchpad-tests.js --suite=mathematical --project=mathematical-validation
  node run-gala-launchpad-tests.js --install --suite=features
`);
}

// Handle help request
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Execute main function
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
