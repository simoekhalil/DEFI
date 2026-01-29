# Full Automation Setup Guide

## 🎯 Overview

This test suite is now **fully automated** with **NO manual intervention required**. It uses:
- ✅ **Dappwright** for real wallet extension automation
- ✅ **Live URL testing** on https://lpad-frontend-dev1.defi.gala.com/
- ✅ **CI/CD compatibility** with proper environment variables
- ❌ **No mock wallets** - real wallet automation only
- ❌ **No manual steps** - complete end-to-end automation

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your **test wallet credentials**:

```env
WALLET_SEED_PHRASE="your twelve word test wallet seed phrase here"
WALLET_ADDRESS="client|618ae395c1c653111d3315be"
```

⚠️ **SECURITY WARNING**: Only use a **test wallet** with minimal funds. Never use your main wallet!

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 4. Run Automated Tests

```bash
# Run all tests (headless)
npm run test

# Run with visible browser (for debugging)
npm run test:headed

# Run specific test suites
npm run test:gala
npm run test:testnet
```

---

## 🔐 Security Best Practices

### For Local Development

1. **Use Test Wallets Only**
   - Create a dedicated test wallet
   - Never use wallets containing real funds
   - Keep test wallet seed phrases separate from production

2. **Environment Variables**
   - Never commit `.env` file
   - Add `.env` to `.gitignore`
   - Rotate test credentials regularly

3. **Minimal Funds**
   - Keep only enough tokens for testing
   - Monitor test wallet balance
   - Set up alerts for unusual activity

### For CI/CD

1. **Store Credentials Securely**
   ```yaml
   # GitHub Actions example
   env:
     WALLET_SEED_PHRASE: ${{ secrets.TEST_WALLET_SEED }}
     WALLET_ADDRESS: ${{ secrets.TEST_WALLET_ADDRESS }}
   ```

2. **Use Environment-Specific Credentials**
   - Different credentials for dev/staging/production
   - Separate testnet and mainnet credentials
   - Never share credentials across environments

3. **Enable Audit Logging**
   - Track all credential access
   - Monitor test execution
   - Alert on suspicious patterns

---

## 🧪 How It Works

### Automated Wallet Connection

The test suite uses **Dappwright** to automate real wallet extensions:

```typescript
// Example from automated-wallet-connection.ts
const wallet = new AutomatedWalletConnection(page, {
  address: process.env.WALLET_ADDRESS,
  seedPhrase: process.env.WALLET_SEED_PHRASE,
  type: 'metamask',
  autoConnect: true,
  enableTransactions: true,
});

const result = await wallet.connect();
// ✅ Wallet connected automatically - no manual steps!
```

### What Was Removed

❌ **Deleted Files** (required manual intervention):
- `tests/simple-manual-test.spec.ts`
- `tests/manual-token-creation-guide.spec.ts`

🔧 **Updated Files** (now fully automated):
- `tests/helpers/automated-wallet-connection.ts` - Complete rewrite using Dappwright
- `tests/testnet-extension-wallet-balance.spec.ts` - Removed manual connection steps
- `tests/galachain-wallet-connection.spec.ts` - Removed manual instructions
- `tests/galachain-real-token-creation.spec.ts` - Removed manual wallet approval
- `tests/automated-token-buying.spec.ts` - Changed from mock to real wallet
- `tests/automated-token-graduation.spec.ts` - Changed from mock to real wallet

### Architecture

```
┌─────────────────────────────────────┐
│  Playwright Test Runner             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  AutomatedWalletConnection Helper   │
│  (uses Dappwright)                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Real Wallet Extension              │
│  (MetaMask/Gala Wallet)             │
│  - Automated via Dappwright         │
│  - No manual approval needed        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Live dApp                          │
│  https://lpad-frontend-dev1...      │
└─────────────────────────────────────┘
```

---

## 📋 Updated Test Files

### ✅ Fully Automated Tests

All tests now run without manual intervention:

1. **Wallet Connection Tests**
   - `testnet-extension-wallet-balance.spec.ts` - Automated balance check
   - `galachain-wallet-connection.spec.ts` - Automated GalaChain connection
   - `simple-wallet-balance-check.spec.ts` - Automated balance retrieval

2. **Token Creation Tests**
   - `automated-token-buying.spec.ts` - Real wallet + token trading
   - `automated-token-graduation.spec.ts` - Full token lifecycle
   - `galachain-real-token-creation.spec.ts` - Real token creation

3. **Integration Tests**
   - `gala-wallet-integration.spec.ts` - Full wallet integration
   - `complete-token-graduation.spec.ts` - Complete graduation flow
   - `end-to-end-token-graduation.spec.ts` - E2E testing

### 🔧 Configuration Required

Each test expects these environment variables:

```env
WALLET_SEED_PHRASE="..."  # Required for Dappwright
WALLET_ADDRESS="..."      # Optional but recommended
```

---

## 🐛 Troubleshooting

### "Wallet credentials required" Error

**Problem**: Missing environment variables

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Verify it contains required variables
cat .env | grep WALLET_SEED_PHRASE

# If missing, copy from example
cp .env.example .env
# Then edit .env with your test credentials
```

### Dappwright Installation Issues

**Problem**: Dappwright not installing properly

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify Dappwright is installed
npm list @tenkeylabs/dappwright

# Install Playwright browsers
npx playwright install chromium
```

### Wallet Connection Timeout

**Problem**: Wallet connection takes too long

**Solution**:
```typescript
// Increase timeout in test
const wallet = new AutomatedWalletConnection(page, {
  seedPhrase: process.env.WALLET_SEED_PHRASE,
  timeout: 60000, // Increase from 30000 to 60000
});
```

### Tests Failing in CI

**Problem**: Tests work locally but fail in CI

**Solution**:
1. Verify CI secrets are set correctly
2. Check network connectivity in CI environment
3. Ensure Playwright browsers are installed in CI:
   ```yaml
   - name: Install Playwright Browsers
     run: npx playwright install --with-deps chromium
   ```

---

## 📊 Running Tests

### Local Development

```bash
# Run all tests (headless, fast)
npm test

# Run with browser visible (for debugging)
npm run test:headed

# Run specific test file
npx playwright test tests/automated-token-buying.spec.ts

# Run in UI mode (interactive)
npm run test:ui
```

### CI/CD

```bash
# Set environment variables in CI
export WALLET_SEED_PHRASE="..."
export WALLET_ADDRESS="..."
export CI=true

# Run tests
npm run test:ci
```

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run tests
        env:
          WALLET_SEED_PHRASE: ${{ secrets.TEST_WALLET_SEED }}
          WALLET_ADDRESS: ${{ secrets.TEST_WALLET_ADDRESS }}
          CI: true
        run: npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎓 Migration Guide

If you have existing tests using manual intervention:

### Before (Manual)
```typescript
test('manual wallet connection', async ({ page }) => {
  await page.goto('...');
  
  // ❌ Manual steps
  console.log('1. Click Connect Wallet button');
  console.log('2. Approve in wallet extension');
  await page.waitForTimeout(60000); // Wait for manual action
});
```

### After (Automated)
```typescript
test('automated wallet connection', async ({ page }) => {
  await page.goto('...');
  
  // ✅ Fully automated
  const wallet = new AutomatedWalletConnection(page, {
    seedPhrase: process.env.WALLET_SEED_PHRASE,
    type: 'metamask',
    autoConnect: true,
  });
  
  await wallet.connect(); // Automatic, no waiting!
});
```

---

## 📚 Additional Resources

- [Dappwright Documentation](https://github.com/tenkeylabs/dappwright)
- [Playwright Documentation](https://playwright.dev)
- [MetaMask Testing Guide](https://docs.metamask.io/guide/testing.html)
- [Gala Documentation](https://docs.gala.com)

---

## ✅ Compliance Checklist

- [x] All tests use live URL (https://lpad-frontend-dev1.defi.gala.com/)
- [x] No mock wallet implementations
- [x] No manual intervention required
- [x] Full Dappwright integration
- [x] Environment variables properly configured
- [x] CI/CD compatible
- [x] Security best practices documented
- [x] All manual tests removed
- [x] All manual fallback logic removed

---

## 🆘 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review test logs for specific errors
3. Verify environment variables are set
4. Ensure wallet has sufficient test funds
5. Check network connectivity to the live URL

For additional help, refer to the `PROJECT_ANALYSIS_ISSUES.md` file for detailed analysis.






