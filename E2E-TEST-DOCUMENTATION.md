# Complete E2E Test: Token Creation to DEX Verification

## Overview

This document describes the complete end-to-end test that verifies the entire token lifecycle from creation on LPAD through graduation to verification on the DEX.

## Test File

`tests/token-graduation-to-dex.spec.ts`

## Test Flow

### Step 1: Connect Wallet to LPAD
- Navigates to LPAD homepage
- Connects MetaMask wallet
- Records initial GALA balance

### Step 2: Create Token
- Navigates to Launch page
- Handles any modals (e.g., "Enable Reverse Bonding Curve")
- Connects wallet on Launch page (required separately)
- Fills token creation form:
  - Token Name: `E2EToken{timestamp}`
  - Token Symbol: `E2E{unique}`
  - Description: E2E test token
  - Website: https://gala.games
  - Image: test-fixtures/token-emoji.png
- Submits form and confirms MetaMask signature
- Waits for token creation transaction to mine

### Step 3: Graduate Token
- Searches for the newly created token
- Makes incremental buy purchases to reach graduation threshold:
  - Buy 1: 50,000 GALA
  - Buy 2: 100,000 GALA
  - Buy 3: 200,000 GALA
  - Buy 4: 300,000 GALA
  - Buy 5: 500,000 GALA
  - Buy 6: 500,000 GALA
  - Buy 7: 200,000 GALA (if needed)
- Each buy:
  - Fills buy amount
  - Confirms in dApp
  - Confirms in MetaMask
  - Waits for transaction to mine
  - Checks graduation status
- Continues until token reaches 100% (graduated)

### Step 4: Verify Token on DEX
- Navigates to DEX frontend: https://dex-frontend-dev1.defi.gala.com/
- Connects wallet to DEX (if needed)
- Looks for Balance section
- Searches for the graduated token
- Verifies token appears with 10,000,000 tokens

## Expected Results

1. ✅ Token successfully created on LPAD
2. ✅ Token reaches graduation (100% bonding curve progress)
3. ✅ Token appears on DEX with 10M token supply in balance

## Technical Details

### Graduation Constants
- Graduation Threshold: 1,640,985.84 GALA (24.6k USD)
- Expected Token Supply: 10,000,000 tokens
- Creator Reward: 17,777 GALA (~1%)
- Platform Fee: 5%
- DEX Pool: 94%

### Test Timeout
- Total test timeout: 600 seconds (10 minutes)
- Allows for:
  - Token creation (~30 seconds)
  - 7 buy transactions (~140 seconds)
  - Transaction mining time (~140 seconds)
  - DEX navigation and verification (~30 seconds)

### Screenshots Captured
- `e2e-before-submit.png` - Launch form before submission
- `e2e-{symbol}-token-page.png` - Token page after creation
- `e2e-{symbol}-after-buy-{n}.png` - Progress after each buy
- `e2e-{symbol}-achieved.png` - Token graduation confirmed
- `e2e-{symbol}-dex-homepage.png` - DEX homepage
- `e2e-{symbol}-dex-after-connect.png` - DEX after wallet connection
- `e2e-{symbol}-dex-balance-section.png` - DEX balance section
- `e2e-{symbol}-dex-token-found.png` - Token found in DEX
- `e2e-{symbol}-dex-final.png` - Final DEX state

## Running the Test

```bash
# Run the complete E2E test
npm run test:e2e -- tests/token-graduation-to-dex.spec.ts

# Run with visible browser (for debugging)
$env:HEADLESS='false'; npm run test:e2e -- tests/token-graduation-to-dex.spec.ts

# Run with retries
npm run test:e2e -- tests/token-graduation-to-dex.spec.ts --retries=1
```

## Common Issues and Solutions

### Issue: MetaMask Initialization Fails
**Solution:** This is usually transient. Run the test again or use `--retries=1`.

### Issue: "Connect Wallet" Button Instead of "Launch Token"
**Solution:** The test now handles wallet connection on the Launch page separately.

### Issue: Token Not Found on DEX
**Possible Reasons:**
1. Token may need more time to sync to DEX
2. DEX indexing delay
3. Token didn't actually graduate (check screenshots)

### Issue: Graduation Takes Too Long
**Solution:** The test makes 7 buys totaling ~1.85M GALA which should be enough to reach graduation with ~6% fees. If not graduating, the threshold may have changed.

## Test Configuration

The test uses the same wallet fixture as other tests:
- MetaMask version: 12.23.0
- Network: Sepolia testnet
- Private key: From environment or bundled test key

## Notes

- The test creates a unique token each time (timestamp-based naming)
- All MetaMask confirmations are automated
- The test is idempotent - can be run multiple times
- Screenshots are saved to `test-results/` directory
- Test runs sequentially (not in parallel with other tests)

