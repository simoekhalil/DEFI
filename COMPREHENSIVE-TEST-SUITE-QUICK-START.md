# Comprehensive Test Suite - Quick Start Guide

**Version:** 1.0  
**Updated:** October 20, 2025

---

## 🚀 Quick Start

Get up and running with the comprehensive test suite in 3 minutes.

---

## Prerequisites

✅ Node.js installed  
✅ MetaMask private key or seed phrase  
✅ GALA balance on Sepolia testnet (2000+ GALA recommended)

---

## Setup (One-Time)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
METAMASK_PRIVATE_KEY=0x4ab34585b4...
```

---

## Run Tests

### Run All Tests

```bash
npx playwright test --headed
```

### Run Specific Test

```bash
# Buy transactions
npx playwright test buy-transactions --headed

# Sell transactions
npx playwright test sell-transactions --headed

# Graduation trigger
npx playwright test complete-graduation-trigger --headed

# Distribution validation
npx playwright test graduation-distribution-validation --headed

# DEX pool validation
npx playwright test dex-pool-validation --headed

# DEX swaps
npx playwright test dex-swap-transactions --headed

# RBC fee measurement
npx playwright test dex-rbc-fee-measurement --headed
```

### Run Test Suite in Order

```bash
# Use the test runner script
node scripts/run-comprehensive-tests.mjs
```

---

## What Each Test Does

| Test | What It Tests | Time |
|------|---------------|------|
| **Buy Transactions** | Purchase tokens at different phases | 3-5 min |
| **Sell Transactions** | Sell tokens with RBC validation | 3-5 min |
| **Graduation Trigger** | Purchase final tokens to graduate | 3-5 min |
| **Distribution** | Validate creator, platform, DEX splits | 2 min |
| **DEX Pool** | Verify pool creation and liquidity | 2-3 min |
| **DEX Swaps** | Execute buy/sell on DEX | 4-6 min |
| **RBC Fees** | Measure RBC fee percentages | 3-5 min |

**Total Runtime:** ~20-35 minutes

---

## Quick Commands

### Debug Mode

```bash
npx playwright test buy-transactions --headed --debug
```

### Run Without Browser

```bash
npx playwright test buy-transactions
```

### With Retries

```bash
npx playwright test buy-transactions --headed --retries=2
```

### Specific Browser

```bash
npx playwright test buy-transactions --headed --project=chromium
```

---

## Understanding Test Output

### Successful Test

```
[TEST] ========================================
[TEST]   EARLY PHASE BUY TEST (0-5M)
[TEST] ========================================

[TEST] Step 1: Connecting wallet...
[TEST] ✓ Wallet connected

[TEST] Step 2: Entering buy amount...
[TEST] ✓ Amount entered

[TEST] Step 3: Confirming transaction...
[TEST] ✓ Transaction confirmed

[TEST] ========================================
[TEST]   VALIDATION RESULTS
[TEST] ========================================
[TEST] ✅ Transaction completed successfully
[TEST] ✅ GALA balance decreased
[TEST] ✅ UI updated after purchase
```

### Failed Test

```
[TEST] ⚠️  Swap button not enabled
[TEST] ⚠️  Possible reasons:
[TEST]     - Pool not indexed yet
[TEST]     - Insufficient balance
```

---

## Common Issues & Quick Fixes

### Issue: MetaMask Setup Fails

**Quick Fix:**
```bash
rm -rf test-results/
npx playwright test --headed --retries=1
```

---

### Issue: Wallet Connection Timeout

**Check:**
- Private key has `0x` prefix
- Wallet has GALA balance
- Network is Sepolia

---

### Issue: Token Not Found

**Wait Time:**
- DEX indexing takes 5-15 minutes
- Rerun test after waiting

---

### Issue: Test Skipped

**Reason:**
- Token in wrong state (e.g., already graduated)
- Insufficient balance
- Prerequisites not met

**Action:**
- Check test output for skip reason
- Adjust test token or balance

---

## Test Results

### Screenshots

All tests save screenshots to `test-results/`:

- `buy-*.png` - Buy transaction screenshots
- `sell-*.png` - Sell transaction screenshots
- `graduation-*.png` - Graduation screenshots
- `dex-*.png` - DEX screenshots
- `rbc-*.png` - RBC fee screenshots

### Reports

Generate HTML report:

```bash
npx playwright show-report
```

---

## Testing Different Tokens

### For Active Token (Pre-Graduation)

Run:
- ✅ Buy transactions
- ✅ Sell transactions

### For Token Near Graduation (95%+)

Run:
- ✅ Graduation trigger

### For Graduated Token

Run:
- ✅ Distribution validation
- ✅ DEX pool validation
- ✅ DEX swaps
- ✅ RBC fee measurement

---

## Expected Test Coverage

After running all tests:

| Category | Coverage |
|----------|----------|
| Buy Transactions | ✅ 100% |
| Sell Transactions | ✅ 100% |
| Graduation Flow | ✅ 100% |
| Distribution | ✅ 100% |
| DEX Pool | ✅ 100% |
| DEX Trading | ✅ 100% |
| RBC Fees | ✅ 100% |

---

## Quick Validation Checklist

After running tests, verify:

- ✅ All transactions confirmed
- ✅ Balance changes match expected
- ✅ UI updates correctly
- ✅ Screenshots captured
- ✅ No unexpected errors

---

## One-Command Full Test Run

```bash
# Run all tests with retries and HTML report
npx playwright test --headed --retries=1 && npx playwright show-report
```

---

## Test-Specific Requirements

### Buy Transactions
- **Needs:** Active token, GALA balance
- **Token State:** Pre-graduation

### Sell Transactions
- **Needs:** Active token, token balance, GALA for gas
- **Token State:** Pre-graduation

### Graduation Trigger
- **Needs:** Token at 95%+ progress, large GALA balance
- **Token State:** Near graduation

### Distribution Validation
- **Needs:** Recently graduated token
- **Token State:** Just graduated

### DEX Pool Validation
- **Needs:** Graduated token (wait 15 min after graduation)
- **Token State:** Graduated, indexed on DEX

### DEX Swaps
- **Needs:** Graduated token, token balance
- **Token State:** Graduated, indexed on DEX

### RBC Fee Measurement
- **Needs:** Graduated token, token balance
- **Token State:** Graduated, indexed on DEX

---

## Best Practices

### 1. Run Tests in Order

```bash
node scripts/run-comprehensive-tests.mjs
```

This ensures proper test sequencing.

### 2. Use Headless for CI/CD

```bash
npx playwright test
```

### 3. Use Headed for Debugging

```bash
npx playwright test --headed --debug
```

### 4. Save Evidence

Keep screenshots and HTML reports for bug reporting.

---

## Performance Tips

### Faster Test Runs

1. **Reduce timeouts** (if network is fast)
2. **Skip waiting** (if token already indexed)
3. **Run specific tests** (not full suite)
4. **Use headless mode** (faster than headed)

### Parallel Execution

```bash
# Run tests in parallel (use with caution)
npx playwright test --workers=2
```

---

## Next Steps

1. ✅ Run `buy-transactions` test
2. ✅ Review screenshots in `test-results/`
3. ✅ Check test output for validation results
4. ✅ Run additional tests as needed
5. ✅ Generate HTML report

---

## Full Documentation

For detailed information, see:
- **Full Docs:** `COMPREHENSIVE-TEST-SUITE-DOCUMENTATION.md`
- **Graduation Flow:** `COMPLETE-GRADUATION-FLOW-DOCUMENTATION.md`
- **Bonding Curve:** `BONDING-CURVE-EXECUTIVE-SUMMARY.md`

---

## Questions?

- **Test failing?** Check "Common Issues" section above
- **Need more details?** Read full documentation
- **Found a bug?** Run test with `--headed --debug`

---

## Summary

```bash
# 1. Install
npm install

# 2. Configure .env
echo 'METAMASK_PRIVATE_KEY=0x...' > .env

# 3. Run tests
npx playwright test --headed

# 4. View results
npx playwright show-report
```

**That's it!** 🎉

---

**Status:** ✅ Ready to test

**Time to first test:** < 3 minutes

**Total test coverage:** All gaps from executive summary filled

