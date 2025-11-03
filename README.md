# Gala Launchpad QA Testing Suite

[![Playwright Tests](https://github.com/YOUR_USERNAME/qa-testing/actions/workflows/playwright.yml/badge.svg)](https://github.com/YOUR_USERNAME/qa-testing/actions/workflows/playwright.yml)

A comprehensive end-to-end testing suite for the Gala Launchpad platform, built with Playwright and MetaMask integration using [dappwright](https://github.com/TenKeyLabs/dappwright).

## 🚀 Features

- **Complete Token Lifecycle Testing** - From bonding curve creation to DEX graduation
- **MetaMask Integration** - Automated wallet interactions without manual clicking
- **Blockchain Validation** - Wei-level precision balance tracking with ethers.js
- **Comprehensive Coverage** - 26+ test suites covering all critical functionality
- **Performance Monitoring** - Automated performance benchmarking and reporting
- **CI/CD Ready** - GitHub Actions workflow included

## 📋 Test Coverage

### Core Functionality
- ✅ Token creation and validation
- ✅ Buy/sell transactions with bonding curve pricing
- ✅ Graduation flow (bonding curve → DEX)
- ✅ Creator rewards (17,777 GALA)
- ✅ Platform fees and treasury accumulation
- ✅ DEX pool creation and liquidity
- ✅ DEX swap transactions
- ✅ RBC (Reverse Bonding Curve) fee validation

### Additional Tests
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Profile management
- ✅ Token badges and achievements
- ✅ Comment system
- ✅ Slippage tolerance
- ✅ Transaction rejection handling
- ✅ Balance loading and display

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ (v25+ recommended for SDK integration)
- npm or yarn
- A MetaMask-compatible wallet with test funds

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/qa-testing.git
   cd qa-testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   npx playwright install chromium
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your wallet private key:
   ```ini
   BASE_URL=https://lpad-frontend-dev1.defi.gala.com
   METAMASK_PRIVATE_KEY=your_private_key_here_without_0x_prefix
   ```
   
   ⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

4. **(Optional) Pre-download MetaMask extension**
   ```bash
   npm run metamask:download
   ```

## 🧪 Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run with Visible Browser (Debug Mode)
```bash
npm run test:e2e:headed
# Or on Windows PowerShell:
$env:HEADLESS='false'; npm run test:e2e
```

### Run Specific Test Suite
```bash
npx playwright test buy-transactions
npx playwright test complete-graduation-flow
npx playwright test dex-trading
```

### Run Tests with Tag
```bash
npx playwright test -g "graduation"
npx playwright test -g "DEX"
```

### View Test Report
```bash
npm run report
```

## 📊 Key Test Suites

### Complete Graduation Flow
**File**: `tests/complete-graduation-flow.spec.ts`

Validates the entire token graduation process:
- Manual purchase to reach 100% graduation threshold
- Automatic distribution (creator reward, platform fee, DEX pool)
- DEX pool creation
- Token balance display on DEX
- DEX trading capability

```bash
npx playwright test complete-graduation-flow --headed
```

### Enhanced Creator Reward Validation
**File**: `tests/graduation-reward-validation-enhanced.spec.ts`

Validates the 17,777 GALA creator reward with precision using three methods:
- Direct blockchain balance query (wei-level precision)
- Transaction log parsing (finds exact `CreatorRewardPaid` event)
- Gas-adjusted calculation (tracks every transaction's gas cost)

```bash
npx playwright test graduation-reward-validation-enhanced --headed
```

### Comprehensive Test Suite
A complete suite covering ALL testing gaps identified during QA:
- Buy/sell transactions at different phases
- Graduation trigger and distribution validation
- DEX pool validation and swap transactions
- RBC fee measurement

```bash
# Run with intelligent test runner
node scripts/run-comprehensive-tests.mjs

# Or run individual suites
npx playwright test buy-transactions --headed
npx playwright test sell-transactions --headed
npx playwright test dex-swap-transactions --headed
```

## 📁 Project Structure

```
qa-testing/
├── tests/                      # Test files
│   ├── fixtures/              # Shared test fixtures
│   ├── helpers/               # Helper utilities
│   └── *.spec.ts              # Test suites
├── scripts/                    # Utility scripts
│   ├── jira-config.mjs        # Jira integration config
│   └── *.mjs                  # Various automation scripts
├── docs/                       # Documentation
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── playwright.config.ts       # Playwright configuration
└── package.json               # Dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Required |
|----------|-------------|----------|
| `BASE_URL` | Gala Launchpad URL | Yes |
| `METAMASK_PRIVATE_KEY` | Wallet private key (no 0x) | Yes |
| `RPC_URL` | Custom RPC endpoint | No |
| `CHAIN_ID` | Custom chain ID | No |
| `CHAIN_NAME` | Custom chain name | No |
| `CHAIN_SYMBOL` | Chain symbol (e.g., ETH) | No |

### Jira Integration (Optional)

For bug reporting and ticket creation:

| Variable | Description |
|----------|-------------|
| `JIRA_BASE_URL` | Your Jira instance URL |
| `JIRA_EMAIL` | Your Jira email |
| `JIRA_API_TOKEN` | Your Jira API token |
| `JIRA_PROJECT_KEY` | Your project key |

## 🤖 CI/CD

This project includes a GitHub Actions workflow that runs tests automatically.

### Setting Up GitHub Actions

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add the following repository secret:
   - **Name**: `METAMASK_PRIVATE_KEY`
   - **Value**: Your wallet's private key (without `0x` prefix)

### Workflow Triggers

- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop`
- Daily schedule at 2 AM UTC
- Manual trigger via workflow dispatch

Test reports and artifacts are retained for 30 days after each run.

## 📖 Documentation

Comprehensive documentation is available in the following files:

- `COMPLETE-GRADUATION-FLOW-DOCUMENTATION.md` - Detailed graduation flow documentation
- `GRADUATION-FLOW-QUICK-START.md` - Quick start guide for graduation tests
- `COMPREHENSIVE-TEST-SUITE-DOCUMENTATION.md` - Complete test suite documentation
- `ENHANCED-REWARD-VALIDATION-GUIDE.md` - Creator reward validation guide
- `BONDING-CURVE-SPECIFICATION.md` - Bonding curve formula and implementation
- `TEST-EXECUTION-GUIDE.md` - Guide for running and debugging tests

## 🐛 Troubleshooting

### MetaMask Extension Issues
If MetaMask fails to load:
```bash
# Clear cache and re-download
rm -rf node_modules/@tenkeylabs/dappwright/metamask
npm run metamask:download
```

### Test Timeouts
- Increase timeout in `playwright.config.ts` (default: 60s)
- Check network connectivity
- Verify wallet has sufficient funds

### Balance Validation Failures
- Ensure wallet has enough GALA for transactions
- Check for pending transactions
- Wait for blockchain confirmations

## 📝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code style
- Test writing best practices
- Pull request process
- Issue reporting

## 🔒 Security

- Never commit `.env` files
- Never share your private keys
- Use test wallets with limited funds
- Review all transactions before signing

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- MetaMask integration via [dappwright](https://github.com/TenKeyLabs/dappwright)
- Blockchain interactions with [ethers.js](https://docs.ethers.org/)

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review test execution logs

---

**Note**: This is a testing suite for the Gala Launchpad platform. Make sure you're testing against the correct environment and have appropriate permissions.

