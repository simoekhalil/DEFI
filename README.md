# Gala Launchpad Automated Testing Suite

Fully automated Playwright test suite for the Gala Launchpad platform. This project provides comprehensive end-to-end testing with zero manual intervention required.

## 🎯 Primary Goal

**Test the Gala Launchpad at https://lpad-frontend-dev1.defi.gala.com/**

All tests run on the live development environment with real wallet integration for complete validation of the platform's functionality.

## ✨ Key Features

- **100% Automated**: No manual user intervention required
- **Live Testing**: All tests run against the live Gala Launchpad (no simulations)
- **Gala Wallet Integration**: Uses the official Gala wallet extension for authentic web3 interactions
- **Comprehensive Coverage**: Token creation, graduation, bonding curves, wallet connections, and more
- **Multiple Test Configurations**: Different configs for various testing scenarios (CI, testnet, fast runs)
- **Detailed Reporting**: Screenshots, traces, and HTML reports for every test run

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

The project uses the Gala wallet extension located at:
```
C:\Users\Simone\web3-testing-app\extensions
```

This is automatically loaded during test execution.

## 🧪 Running Tests

### Main Test Suites

```bash
# Run all Gala Launchpad tests
npm run test:gala

# Run specific test suites
npm run test:gala:critical        # Critical functionality tests
npm run test:gala:features        # Feature validation tests
npm run test:gala:integration     # Integration tests
npm run test:gala:mathematical    # Mathematical validation (bonding curves)
npm run test:gala:graduation      # Graduation process tests
npm run test:gala:performance     # Performance tests
```

### Token Creation & Graduation Tests

```bash
# Complete token graduation flow
npm run test:complete             # Full token creation to graduation (headed)
npm run test:complete:headless    # Same, but headless

# Fast token graduation
npm run test:fast                 # Optimized graduation flow (headed)
npm run test:fast:headless        # Same, but headless

# Fully automated token tests
npm run test:automated            # Automated token creation & graduation
npm run test:automated:headed     # Same, with visible browser

# Real token creation tests
npm run test:real:creation        # Create a real token
npm run test:real:verify          # Verify token creation
```

### Wallet & GalaChain Tests

```bash
# GalaChain wallet connection
npm run test:galachain:connect    # Test wallet connection
npm run test:galachain:balance    # Check token balance
npm run test:galachain:create     # Create token with GalaChain

# Wallet setup and balance checks
npm run wallet:balance            # Check wallet balance
npm run wallet:balance:testnet    # Check testnet balance
npm run test:testnet              # Run testnet-specific tests
```

### Graduation & Rewards Tests

```bash
# Graduation rewards testing
npm run test:graduation           # All graduation tests
npm run test:graduation:math      # Mathematical validation only
npm run test:graduation:ui        # UI interaction tests
```

### Development & Debugging

```bash
# Run with headed browser (watch tests execute)
npm run test:headed
npm run test:gala:headed

# Run with Playwright UI (interactive debugging)
npm run test:ui

# CI/CD optimized tests
npm run test:ci
npm run test:ci:automated
npm run ci:test:full
```

## 📁 Project Structure

```
web3-testing-app/
├── tests/                              # Test files
│   ├── automated-token-graduation.spec.ts
│   ├── e2e-complete-graduation.spec.ts
│   ├── galachain-wallet-connection.spec.ts
│   ├── graduation-rewards.spec.ts
│   ├── bonding-curve-calculations.spec.ts
│   ├── diamond-hand-bonus.spec.ts
│   ├── real-token-creation.spec.ts
│   ├── helpers/                        # Test utilities
│   │   ├── automated-wallet-connection.ts
│   │   ├── gala-launchpad-utils.ts
│   │   └── graduation-rewards-utils.ts
│   └── screenshots/                    # Test screenshots
├── extensions/                         # Gala wallet extension
│   └── testnet-wallet/
├── playwright-*.config.ts              # Multiple test configurations
├── run-gala-launchpad-tests.js        # Test suite runner
└── scripts/                            # Utility scripts
    ├── check-balance.js
    └── check-balance-testnet-v2.js
```

## 🧩 Test Categories

### Critical Tests
- Launch page validation
- Token creation form
- Wallet connection flow
- Basic navigation

### Feature Tests
- Token buying functionality
- Graduation process
- Bonding curve calculations
- Diamond hand bonus mechanics
- Dump event protection

### Mathematical Tests
- Bonding curve price calculations
- Graduation rewards formulas
- Token economics validation

### Integration Tests
- End-to-end token lifecycle
- Wallet → Platform → Transaction flow
- Multi-step user journeys

### Performance Tests
- Page load times
- Transaction speed
- Network resilience

## 📊 Test Reporting

After running tests, view detailed reports:

```bash
# View the latest test report
npx playwright show-report

# View Gala Launchpad specific report
npx playwright show-report playwright-report-gala-launchpad

# View testnet report
npx playwright show-report playwright-report-testnet
```

Reports include:
- Test execution timeline
- Screenshots at each step
- Network activity traces
- Console logs
- Video recordings (when configured)

## 🛠️ Configuration Files

Multiple Playwright configurations for different scenarios:

- `playwright.config.ts` - Default configuration
- `playwright-gala-launchpad.config.ts` - Gala Launchpad specific
- `playwright-testnet.config.ts` - Testnet environment
- `playwright-ci.config.ts` - CI/CD optimized
- `playwright-fast.config.ts` - Quick test runs
- `playwright-network-resilient.config.ts` - Network failure handling

## 🔧 Utility Scripts

```bash
# Check wallet balances
node scripts/check-balance.js
node scripts/check-balance-testnet-v2.js

# Run specific test runners
node run-gala-launchpad-tests.js
node run-full-purchase-flow.js
node quick-purchase.js

# Open extension and check balance
node open-extension-balance.js
```

## 📝 Environment Setup

The test suite uses:
- **Target URL**: https://lpad-frontend-dev1.defi.gala.com/
- **Wallet Extension**: Local Gala wallet extension (testnet)
- **Network**: GalaChain Testnet
- **Automation Level**: 100% - No manual intervention

## 🎯 Testing Philosophy

1. **Always use the real Gala wallet extension** - No mocks or simulations
2. **Test on live environment** - Real interactions with the dev deployment
3. **Full automation** - Tests must run without manual steps
4. **Comprehensive validation** - From token creation to graduation
5. **Detailed reporting** - Every step documented with screenshots and traces

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
```bash
# Verify extension path exists
ls extensions/testnet-wallet/build
```

**Wallet connection fails:**
```bash
# Check testnet balance
npm run wallet:balance:testnet
```

**Tests timeout:**
- Some flows (token graduation) can take 15+ minutes
- Use headed mode to watch progress: `npm run test:gala:headed`

**Screenshots not saved:**
- Ensure `tests/screenshots/` directory exists
- Check write permissions

### Debug Mode

```bash
# Watch tests in real-time
npm run test:headed

# Interactive debugging with Playwright Inspector
npm run test:ui

# Run specific test file
npx playwright test tests/automated-token-graduation.spec.ts --headed
```

## 📄 License

MIT

---**Note**: This is a testing suite for development purposes. All tests run against the development environment and should not be used with real funds or mainnet wallets.
