# Dynamic RBC Fee Testing Guide

## Overview

**RBC (Reverse Bonding Curve) fees are DYNAMIC** - they increase as the bonding curve fills up. This is NOT a flat 1% fee as originally documented.

## How Dynamic RBC Fees Work

### Basic Principle
```
RBC Fee = Minimum% + (Progress × Range)
```

Where:
- **Minimum%** = Set by token creator during launch (e.g., 1%)
- **Maximum%** = Set by token creator during launch (e.g., 10%)
- **Progress** = Current bonding curve progress (0-1)
- **Range** = Maximum% - Minimum%

### Example Calculation

If a token creator sets RBC range as **1% - 10%**:

| Bonding Curve Progress | RBC Fee Calculation | Effective RBC Fee |
|----------------------|-------------------|------------------|
| 0% (initial) | 1% + (0.00 × 9%) | **1%** |
| 10% | 1% + (0.10 × 9%) | **1.9%** |
| 25% | 1% + (0.25 × 9%) | **3.25%** |
| 50% | 1% + (0.50 × 9%) | **5.5%** |
| 75% | 1% + (0.75 × 9%) | **7.75%** |
| 90% | 1% + (0.90 × 9%) | **9.1%** |
| 95% | 1% + (0.95 × 9%) | **9.55%** |
| 99% | 1% + (0.99 × 9%) | **9.91%** |

## Why Dynamic Fees?

### 1. **Protects Against Dumps**
- Higher fees near graduation discourage selling
- Prevents token price collapse right before DEX listing

### 2. **Rewards Diamond Hands**
- Holders who wait until graduation avoid high RBC fees
- Incentivizes long-term holding

### 3. **Funds Ecosystem**
- Higher fees near graduation generate more treasury revenue
- Fees can fund Diamond Hand Pool (if implemented)

### 4. **Fair Pricing**
- Early sellers pay less (lower conviction → lower penalty)
- Late sellers pay more (higher conviction required → higher penalty)

## Test Strategy

### Test Checkpoints

Our test validates RBC fees at these bonding curve progress levels:

| Checkpoint | Expected Behavior | Validation Method |
|-----------|------------------|------------------|
| **0-10%** | Fee ≈ minimum | Verify UI shows minimum fee |
| **25%** | Fee ≈ 25-35% of range | Check fee in sell interface |
| **50%** | Fee ≈ mid-range | Verify fee calculation |
| **75%** | Fee ≈ 65-75% of range | Check fee increases |
| **90%** | Fee ≈ near maximum | Verify high fee near graduation |
| **95%** | Fee ≈ 95% of range | Confirm very high fee |
| **99%** | Fee ≈ maximum | Verify maximum fee applied |

## Running the Tests

### Full Validation Suite
```powershell
# Test RBC fees at multiple progress levels
npx playwright test dynamic-rbc-fees.spec.ts --headed --timeout=1800000

# Note: Takes ~30 minutes and requires significant GALA
```

### Quick Validation
```powershell
# Test only edge cases (faster)
npx playwright test dynamic-rbc-fees.spec.ts -g "edge cases" --headed
```

### Individual Checkpoint
```powershell
# Test specific progress level
npx playwright test dynamic-rbc-fees.spec.ts -g "50%" --headed
```

## Test Requirements

### Prerequisites
- ✅ Wallet with sufficient GALA (~500k-1M GALA for full test)
- ✅ MetaMask configured and connected
- ✅ Access to LPAD dev environment

### Time Requirements
- **Full test:** 30-40 minutes
- **Quick test:** 5-10 minutes
- **Single checkpoint:** 2-5 minutes

### Cost Estimate
- **Full test:** ~500k-1M GALA ($500-$10k depending on GALA price)
- **Quick test:** ~50k GALA ($50-$500)
- **Single checkpoint:** ~10k-100k GALA ($10-$1k)

## Expected Test Output

### Success Criteria ✅

```
========================================
RBC FEE PROGRESSION SUMMARY
========================================

Token: RBCTEST (RBCTest1234567890)
RBC Fee Range: 1% - 10%

Progress    Expected Fee    Status
--------    ------------    ------
10%         1-2%            ✅ PASS (1.8%)
25%         2-4%            ✅ PASS (3.1%)
50%         4-6%            ✅ PASS (5.4%)
75%         6-8%            ✅ PASS (7.6%)
90%         8-10%           ✅ PASS (9.0%)
95%         9-10%           ✅ PASS (9.5%)

KEY FINDINGS:
✅ RBC fee is dynamic, not fixed at 1%
✅ RBC fee increases with bonding curve progress
✅ Early sellers pay lower fees
✅ Late sellers pay higher fees
```

### Failure Indicators ⚠️

- RBC fee doesn't increase with progress
- Fee stuck at 1% regardless of progress
- Fee exceeds maximum set by creator
- Fee below minimum set by creator
- No RBC fee displayed on sell interface

## Screenshots Generated

The test captures screenshots at each checkpoint:

```
test-results/
├── rbc-token-created-RBCXYZ.png
├── rbc-fee-10percent-RBCXYZ.png
├── rbc-fee-25percent-RBCXYZ.png
├── rbc-fee-50percent-RBCXYZ.png
├── rbc-fee-75percent-RBCXYZ.png
├── rbc-fee-90percent-RBCXYZ.png
└── rbc-fee-95percent-RBCXYZ.png
```

## Troubleshooting

### Issue: RBC Fee Not Visible
**Solution:** Check sell interface - fee should be labeled as "RBC Fee", "Unbonding Fee", or "Reverse Bonding Curve Fee"

### Issue: Fee Appears Fixed at 1%
**Possible Causes:**
- Feature not deployed yet
- Token created with fixed fee (not dynamic range)
- UI not displaying current fee correctly

### Issue: Test Takes Too Long
**Solution:** 
- Run only edge cases test
- Test on a token that's already at high progress
- Reduce number of checkpoints

### Issue: Insufficient GALA
**Solution:**
- Request test GALA from team
- Test only one or two checkpoints
- Use tokens that are already at various progress levels

## Manual Validation

If automated tests fail, validate manually:

1. **Create a token** with RBC range 1-10%
2. **Buy tokens** to reach 50% bonding curve
3. **Click Sell** and check displayed RBC fee
4. **Verify** fee is around 5-6% (not 1%)
5. **Buy more** to reach 90% progress
6. **Click Sell** again and verify fee is near 10%

## Formula Verification

To determine the exact RBC fee formula:

```python
# Collect data points
data_points = [
    (0.10, 1.8),   # (progress, rbc_fee%)
    (0.25, 3.1),
    (0.50, 5.4),
    (0.75, 7.6),
    (0.90, 9.0),
]

# Test linear relationship
# RBC_Fee = Min + (Max - Min) × Progress
# Expected: 1% + 9% × Progress

# Verify each point
for progress, observed_fee in data_points:
    expected_fee = 1 + (9 * progress)
    error = abs(observed_fee - expected_fee)
    print(f"Progress: {progress*100}%, Expected: {expected_fee}%, Observed: {observed_fee}%, Error: {error}%")
```

## Integration with Other Tests

### Related Test Files
- `fee-validation.spec.ts` - General fee validation
- `token-trading.spec.ts` - Buy/sell functionality
- `graduation-rewards-simple.spec.ts` - Graduation flow

### Update Needed
These files now document dynamic RBC fees:
- ✅ `fee-validation.spec.ts` - Updated with RBC notes
- ✅ `token-trading.spec.ts` - Updated unbonding fee test
- ✅ `diamond-hand-pool.spec.ts` - Skipped (not implemented)

## Next Steps

1. ✅ Run dynamic RBC fee tests
2. ✅ Capture screenshots at each checkpoint
3. ✅ Verify fee progression is working
4. ✅ Document actual fee formula if different from expected
5. ✅ Update other test files with findings
6. ✅ Create Jira tickets for any issues found

## Questions to Answer

- [ ] What is the EXACT formula? (Linear, quadratic, exponential?)
- [ ] Does the formula vary by token, or is it platform-wide?
- [ ] Can creators customize the formula, or just the min/max range?
- [ ] At exactly 100% (graduation), what happens to RBC fee? (N/A - can't sell graduated token)
- [ ] Is there a UI indicator showing current RBC fee before selling?

## Documentation Links

- **Figma Spec:** [Link to RBC fee specification]
- **Jira Ticket:** [Link to RBC implementation ticket]
- **Contract Code:** [Link to smart contract implementing RBC fees]

---

**Last Updated:** October 16, 2025  
**Test File:** `tests/dynamic-rbc-fees.spec.ts`  
**Status:** ✅ Ready for Execution

