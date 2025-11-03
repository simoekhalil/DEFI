# Test Execution Guide - LPAD QA Testing

**Last Updated:** October 16, 2025  
**Total Test Suites:** 29  
**Total Test Cases:** 190+

---

## 🚀 Quick Start

### Prerequisites Check ✅
- [x] Node.js installed
- [x] npm dependencies installed
- [x] Playwright browsers installed
- [ ] `.env` file configured (see below)

---

## 📋 Step-by-Step Execution Plan

### **Step 1: Configure Environment Variables**

Create a `.env` file in the root directory:

```bash
# Windows PowerShell
New-Item -ItemType File -Path .env -Force

# Then edit the file with your credentials
```

Required `.env` contents:
```ini
BASE_URL=https://lpad-frontend-dev1.defi.gala.com
METAMASK_PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Optional: Custom network configuration
# RPC_URL=
# CHAIN_ID=
# CHAIN_NAME=
# CHAIN_SYMBOL=
```

⚠️ **IMPORTANT:** Never commit the `.env` file or share your private key!

---

### **Step 2: Verify Setup**

```powershell
# Check Playwright installation
npm list @playwright/test

# Download MetaMask extension (optional but recommended)
npm run metamask:download
```

---

## 🎯 Recommended Test Execution Strategies

### **Strategy 1: Progressive Testing (RECOMMENDED for First Run)**

Run tests in stages, starting with critical flows:

#### **Phase 1: Smoke Tests (5-10 minutes)**
```powershell
# Test wallet connection first
npx playwright test wallet-connection.spec.ts --headed

# Test home screen
npx playwright test home-screen.spec.ts --headed
```

#### **Phase 2: Core Functionality (15-20 minutes)**
```powershell
# Token creation
npx playwright test create-single-token.spec.ts --headed

# Token trading
npx playwright test token-trading.spec.ts --headed

# Balances
npx playwright test balances.spec.ts --headed
```

#### **Phase 3: Advanced Flows (30-60 minutes)**
```powershell
# Complete graduation flow (longest test)
npx playwright test complete-graduation-flow.spec.ts --headed

# Graduation rewards
npx playwright test graduation-reward-validation-enhanced.spec.ts --headed

# DEX trading
npx playwright test dex-trading.spec.ts --headed
```

#### **Phase 4: Validation & Edge Cases (20-30 minutes)**
```powershell
# Fee validation
npx playwright test fee-validation.spec.ts --headed
npx playwright test gas-fees-validation.spec.ts --headed

# Bonding curve validation
npx playwright test bonding-curve-validation.spec.ts --headed

# Transaction rejection
npx playwright test transaction-rejection.spec.ts --headed
```

#### **Phase 5: UI/UX Tests (15-20 minutes)**
```powershell
# Responsive design
npx playwright test responsive-design.spec.ts --headed
npx playwright test responsive-advanced.spec.ts --headed

# Comments and badges
npx playwright test comments.spec.ts --headed
npx playwright test badges-filtering.spec.ts --headed
```

#### **Phase 6: Analytics & Performance (10-15 minutes)**
```powershell
# Performance monitoring
npx playwright test performance-monitoring.spec.ts --headed

# Treasury tracking
npx playwright test treasury-accumulation.spec.ts --headed
npx playwright test treasury-fee-tracking.spec.ts --headed
```

---

### **Strategy 2: Full Suite Run (For CI/CD or Comprehensive Testing)**

Run all tests sequentially in headless mode:

```powershell
# Full suite (headless - takes 2-4 hours)
npm run test:e2e

# View results after completion
npm run report
```

---

### **Strategy 3: Targeted Testing (For Specific Features)**

Run specific test suites based on what you're testing:

#### **Wallet & Authentication**
```powershell
npx playwright test wallet-connection.spec.ts --headed
```

#### **Token Launch & Creation**
```powershell
npx playwright test launch.spec.ts --headed
npx playwright test launch-validation.spec.ts --headed
npx playwright test create-single-token.spec.ts --headed
npx playwright test create-tokens-batch.spec.ts --headed
```

#### **Trading & Transactions**
```powershell
npx playwright test token-trading.spec.ts --headed
npx playwright test dex-trading.spec.ts --headed
npx playwright test slippage-tolerance.spec.ts --headed
```

#### **Graduation & Rewards**
```powershell
npx playwright test token-graduation-to-dex.spec.ts --headed
npx playwright test complete-graduation-flow.spec.ts --headed
npx playwright test graduation-rewards.spec.ts --headed
npx playwright test graduation-rewards-simple.spec.ts --headed
npx playwright test graduation-reward-validation-enhanced.spec.ts --headed
```

#### **Fees & Economics**
```powershell
npx playwright test fee-validation.spec.ts --headed
npx playwright test gas-fees-validation.spec.ts --headed
npx playwright test bonding-curve-validation.spec.ts --headed
```

#### **User Features**
```powershell
npx playwright test profile.spec.ts --headed
npx playwright test referral-programme.spec.ts --headed
npx playwright test diamond-hand-pool.spec.ts --headed
npx playwright test comments.spec.ts --headed
```

#### **UI/UX**
```powershell
npx playwright test responsive-design.spec.ts --headed
npx playwright test responsive-advanced.spec.ts --headed
npx playwright test badges-filtering.spec.ts --headed
```

---

### **Strategy 4: Parallel Testing by Category**

Open multiple terminal windows and run different categories simultaneously:

**Terminal 1 - Quick Tests:**
```powershell
npx playwright test home-screen.spec.ts wallet-connection.spec.ts balances.spec.ts
```

**Terminal 2 - Trading Tests:**
```powershell
npx playwright test token-trading.spec.ts dex-trading.spec.ts
```

**Terminal 3 - Validation Tests:**
```powershell
npx playwright test fee-validation.spec.ts gas-fees-validation.spec.ts
```

---

## 🔧 Useful Commands

### **Run with Options**

```powershell
# Run in headed mode (see browser)
npx playwright test <test-file> --headed

# Run specific test by name
npx playwright test <test-file> -g "test name pattern"

# Run with debug mode
npx playwright test <test-file> --debug

# Run and open report immediately
npx playwright test <test-file> && npm run report

# Run with specific browser
npx playwright test --project=chromium

# Run tests matching a pattern
npx playwright test -g "wallet connection"

# Run all tests in a directory
npx playwright test tests/

# List all available tests
npx playwright test --list
```

### **For Windows Users**

```powershell
# Run headed mode (PowerShell)
$env:HEADLESS='false'; npm run test:e2e

# Run specific test headed
$env:HEADLESS='false'; npx playwright test wallet-connection.spec.ts
```

---

## 📊 Test Results & Reports

### **View Results**

```powershell
# Open HTML report
npm run report

# View JSON report
cat playwright-report/report.json

# View JUnit XML
cat playwright-report/junit.xml
```

### **Bundle Artifacts**

```powershell
# Create zip archive of all test results
npm run bundle:artifacts
```

This creates: `artifacts/playwright-artifacts-<timestamp>.zip` containing:
- Screenshots
- Videos
- Traces
- HTML report
- JSON/JUnit reports

---

## 🎥 Recording & Screenshots

Test results are automatically saved in:
- **Screenshots:** `test-results/` (only on failure)
- **Videos:** `test-results/` (only on failure)
- **Full Reports:** `playwright-report/`

---

## ⚡ Performance Analysis

After running tests, analyze performance:

```powershell
# Generate performance analysis
npm run analyze:performance

# Create Jira tickets for performance issues
npm run jira:performance
```

---

## 🐛 Debugging Failed Tests

### **Method 1: Run in Debug Mode**
```powershell
npx playwright test <failed-test>.spec.ts --debug
```

### **Method 2: Run Headed with Screenshots**
```powershell
npx playwright test <failed-test>.spec.ts --headed
```

### **Method 3: View Trace**
```powershell
# If test was retried, trace is captured
npx playwright show-trace test-results/<test-name>/trace.zip
```

### **Method 4: Check Console Logs**
All tests include detailed console logging with `[TEST]` prefix for debugging.

---

## 📝 Test Execution Checklist

Before running tests:
- [ ] `.env` file created with valid credentials
- [ ] Sufficient GALA balance in wallet for transactions
- [ ] Wallet registered on Gala Chain
- [ ] Stable internet connection
- [ ] No other tests running (workers=1 in config)

During test execution:
- [ ] Monitor console for `[TEST]` log messages
- [ ] Watch for MetaMask popup confirmations (if headed)
- [ ] Check for error messages or timeouts
- [ ] Note any tests that need manual intervention

After test execution:
- [ ] Review HTML report (`npm run report`)
- [ ] Check screenshots for failures
- [ ] Document any issues found
- [ ] Update test cases if needed
- [ ] Bundle artifacts if sharing results

---

## 🔄 Continuous Testing Workflow

### **Daily Testing**
```powershell
# Run smoke tests every morning
npx playwright test wallet-connection.spec.ts home-screen.spec.ts balances.spec.ts --headed
```

### **Pre-Deployment Testing**
```powershell
# Run all critical flows
npx playwright test wallet-connection.spec.ts create-single-token.spec.ts token-trading.spec.ts complete-graduation-flow.spec.ts
```

### **Weekly Regression**
```powershell
# Run full suite
npm run test:e2e
npm run report
npm run bundle:artifacts
```

---

## 🚨 Common Issues & Solutions

### **Issue: MetaMask Extension Not Found**
```powershell
# Solution: Download MetaMask extension
npm run metamask:download
```

### **Issue: Insufficient GALA Balance**
- Ensure test wallet has sufficient GALA for transactions
- Each test may use 100-1000 GALA depending on operations

### **Issue: Wallet Not Registered**
- Run `wallet-connection.spec.ts` first to register wallet on Gala Chain
- Or manually register wallet before running tests

### **Issue: Tests Timing Out**
- Increase timeout in `playwright.config.ts`
- Check internet connection stability
- Verify BASE_URL is accessible

### **Issue: MetaMask Popup Not Appearing**
- Run in `--headed` mode to see browser
- Check if MetaMask extension is loaded
- Verify wallet credentials in `.env`

---

## 📈 Estimated Test Durations

| Test Suite | Estimated Time | Priority |
|------------|---------------|----------|
| wallet-connection | 2-3 min | 🔴 Critical |
| home-screen | 1-2 min | 🔴 Critical |
| create-single-token | 3-5 min | 🔴 Critical |
| token-trading | 5-7 min | 🔴 Critical |
| complete-graduation-flow | 20-30 min | 🟡 High |
| graduation-reward-validation | 15-20 min | 🟡 High |
| dex-trading | 5-10 min | 🟡 High |
| fee-validation | 3-5 min | 🟢 Medium |
| gas-fees-validation | 3-5 min | 🟢 Medium |
| bonding-curve-validation | 5-7 min | 🟢 Medium |
| responsive-design | 5-10 min | 🟢 Medium |
| performance-monitoring | 5-10 min | 🟢 Medium |
| treasury-accumulation | 10-15 min | 🔵 Low |
| transaction-rejection | 10-15 min | 🔵 Low |
| **TOTAL (All Tests)** | **2-4 hours** | - |

---

## 🎯 Recommended First Run

For your first test run, I recommend:

```powershell
# 1. Verify setup (5 minutes)
npx playwright test wallet-connection.spec.ts --headed

# 2. Run core functionality (15 minutes)
npx playwright test create-single-token.spec.ts token-trading.spec.ts --headed

# 3. View results
npm run report
```

This will give you confidence in the setup before running longer tests.

---

## 📞 Support

- **Documentation:** See `COMPLETE-TEST-CASES-LIST.md` for all test cases
- **Quick Reference:** See `README.md` for quick commands
- **Graduation Flow:** See `GRADUATION-FLOW-QUICK-START.md`
- **Enhanced Validation:** See `ENHANCED-REWARD-VALIDATION-GUIDE.md`

---

**Happy Testing! 🚀**

