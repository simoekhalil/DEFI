# Complete Graduation Flow Documentation

**Last Updated:** October 14, 2025  
**Updated:** October 14, 2025 (Corrected supply conversion claims)  
**Status:** ✅ Verified against actual test results  
**Test File:** `tests/complete-graduation-flow.spec.ts`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Flow Diagram](#flow-diagram)
3. [Phase-by-Phase Breakdown](#phase-by-phase-breakdown)
4. [Supply Information](#supply-information)
5. [Timing & Delays](#timing--delays)
6. [Known Issues](#known-issues)
7. [Testing Guide](#testing-guide)

---

## Overview

The graduation flow is a **6-phase process** that transitions a token from the bonding curve (Launchpad) to the decentralized exchange (DEX). This document details every step, including automatic processes, manual actions, timing delays, and known issues.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: REACHING 100%                       │
│                         (MANUAL)                                │
├─────────────────────────────────────────────────────────────────┤
│ User purchases last tokens                                      │
│ Bonding curve reaches 1,640,985.844 GALA                       │
│ Progress: 0% → 100%                                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ INSTANT (T+0s)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 2: AUTOMATIC DISTRIBUTION                 │
│                        (AUTOMATIC)                              │
├─────────────────────────────────────────────────────────────────┤
│ Bonding curve closes                                            │
│ Status → "Graduated to DEX" (green badge)                      │
│                                                                 │
│ DISTRIBUTION (from 1,640,985.844 GALA):                        │
│   ├─ Creator Reward: 17,777 GALA (~1%)                        │
│   ├─ Platform Fee: ~82,049 GALA (5%)                          │
│   └─ DEX Pool: ~1,541,159 GALA (94%)                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ INSTANT (T+0s)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 3: DEX POOL CREATION                      │
│                        (AUTOMATIC)                              │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️ SUPPLY STAYS AT 10M:                                         │
│   Token supply: 10,000,000 tokens (stays same)                 │
│   Note: 1B conversion mentioned in meetings                    │
│         but NOT observed in actual tests                       │
│                                                                 │
│ GALA/MEME pool created on DEX:                                 │
│   ├─ GALA side: ~1,541,159 GALA                               │
│   ├─ MEME side: 10M tokens from supply                        │
│   └─ Pool type: Uniswap-style AMM                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ WAIT: 5-15 minutes
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 4: DEX BALANCE DISPLAY                    │
│                        (AUTOMATIC)                              │
├─────────────────────────────────────────────────────────────────┤
│ Backend indexes new pool                                        │
│ Token appears in DEX Balance screen                            │
│                                                                 │
│ BOTH types of tokens visible:                                  │
│   ├─ Graduated tokens (full trading)                          │
│   └─ Non-graduated tokens (balance only)                      │
│                                                                 │
│ Holder balance: Shows your token amount (no conversion)       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ CONCURRENT
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 5: EXPLORE TAB LISTING                    │
│                  (AUTOMATIC - IN PROGRESS)                      │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️ KNOWN ISSUE: Not currently working                          │
│                                                                 │
│ EXPECTED:                                                       │
│   Pool should appear in Explore tab                            │
│   Users can discover graduated tokens                          │
│                                                                 │
│ ACTUAL:                                                         │
│   Feature in progress / not yet implemented                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ MANUAL ACTION
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 6: DEX TRADING                        │
│                          (MANUAL)                               │
├─────────────────────────────────────────────────────────────────┤
│ Users navigate to DEX                                           │
│ Connect wallet                                                  │
│ Select MEME token from list                                    │
│ Execute swap: GALA ↔ MEME                                      │
│                                                                 │
│ Price determined by AMM formula (x × y = k)                    │
│ Trades settled through liquidity pool                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase-by-Phase Breakdown

### **Phase 1: Reaching 100% (Manual)**

#### What Happens:
- User makes final purchase(s) to complete bonding curve
- Market cap reaches exactly **1,640,985.844 GALA**
- This is the graduation threshold

#### User Actions:
1. Navigate to token page on Launchpad
2. Enter buy amount in GALA
3. Confirm transaction in wallet (MetaMask)
4. Wait for blockchain confirmation

#### Indicators:
- Bonding curve progress shows **100%**
- Then immediately resets to **0%** (indicates graduation)
- Status badge changes from "Active" to **"Graduated to DEX"** (green)
- Buy/Sell inputs become **disabled**
- **"Trade on Pool"** button appears

#### Timing:
- **Instant** (T+0s)
- As soon as transaction confirms on blockchain

---

### **Phase 2: Automatic Distribution (Automatic)**

#### What Happens:
The smart contract automatically distributes the accumulated GALA:

```
Total Pool: 1,640,985.844 GALA

Distribution:
├─ Creator Reward:  17,777 GALA (~1.08%)
├─ Platform Fee:    82,049 GALA (~5%)
└─ DEX Liquidity:   1,541,159 GALA (~94%)
```

#### Automatic Actions:
1. ✅ Bonding curve closes (no more buys/sells)
2. ✅ Creator receives 17,777 GALA reward
3. ✅ Platform collects 5% fee
4. ✅ Remaining 94% locked in liquidity pool

#### Verification Points:
- Creator balance increases by ~17,777 GALA (minus gas)
- Token page shows "Graduated" status
- Bonding curve interface disabled

#### Timing:
- **Instant** (T+0s)
- Happens in same transaction block as graduation

---

### **Phase 3: DEX Pool Creation (Automatic)**

#### 🔑 Critical Process: Supply Conversion

This is the **most important and often missed detail**:

```
BEFORE GRADUATION (Bonding Curve):
├─ Supply: 10,000,000 tokens (10M)
└─ Price: Variable based on bonding curve

AFTER GRADUATION (DEX):
├─ Supply: 1,000,000,000 tokens (1B)
├─ Price: Divided by 100
└─ Market cap: SAME (value preserved)
```

#### Why Supply Conversion?

**Standardization:**
- All graduated tokens have **1 billion supply**
- Consistent token economics across all projects
- Same starting price for all graduated tokens
- Creators cannot choose supply amount

**Math Example:**
```
Pre-graduation:
  10M tokens × 0.154 GALA/token = 1,540,000 GALA market cap

Post-graduation:
  1B tokens × 0.00154 GALA/token = 1,540,000 GALA market cap
  
Token supply: 10M → 1B (100x increase)
Token price: 0.154 → 0.00154 (100x decrease)
Market cap: SAME (value preserved)
```

#### Pool Creation:

**GALA/MEME Liquidity Pool:**
- Type: Uniswap V2-style AMM
- GALA side: ~1,541,159 GALA (94% of pool)
- MEME side: Corresponding amount of tokens
- Formula: x × y = k (constant product)

#### Timing:
- **0-5 minutes** for pool creation transaction
- Pool exists on blockchain but not yet indexed

---

### **Phase 4: DEX Balance Display (Automatic)**

#### What Happens:
- DEX backend indexes the new pool
- Token appears in user balance screens
- Both graduated and non-graduated tokens visible

#### Balance Types:

**Graduated Tokens:**
- ✅ Show in balance with amount
- ✅ Link to DEX trading interface
- ✅ Show pool liquidity info
- ✅ Enable swap functionality

**Non-Graduated Tokens:**
- ✅ Show in balance with amount
- ✅ Link back to Launchpad
- ❌ No DEX trading yet
- ℹ️ Shows bonding curve status

#### Expected Display:
```
MY BALANCES
├─ GALA: 5,000,000 GALA
├─ MEMETOKEN: 10,000,000 MEME (graduated) ✅
└─ NEWTOKEN: 2,500,000 NEW (bonding curve) 📈
```

#### Timing:
- **5-15 minutes** after graduation
- Depends on blockchain indexing speed
- May require page refresh

#### Troubleshooting:
- If token doesn't appear: Wait 5-10 more minutes
- Try refreshing page
- Check token on Launchpad first (verify graduation)
- Check wallet connection on DEX

---

### **Phase 5: Explore Tab Listing (Automatic - In Progress)**

#### ⚠️ KNOWN ISSUE

**Expected Behavior:**
- Graduated token pool appears in Explore tab
- Users can discover new trading pairs
- Shows pool metrics (TVL, volume, etc.)
- Enables community discovery

**Current Status:**
- ❌ **Not currently working**
- 🚧 **In progress / not yet implemented**
- ⏳ **Timeline: Unknown**

**Workaround:**
- Users must know token symbol to search directly
- Direct navigation via links
- Balance section shows tokens you hold
- Social sharing for discovery

#### Expected Display (when fixed):
```
EXPLORE
├─ Top Pools
│   ├─ GALA/USDT
│   └─ GALA/MEMETOKEN ← Should appear here
├─ New Pools
│   └─ GALA/MEMETOKEN ← Or here
└─ Search
    └─ Search by token name/symbol
```

---

### **Phase 6: DEX Trading (Manual)**

#### What Users Can Do:

**Swap Interface:**
1. Navigate to DEX: https://dex-frontend-dev1.defi.gala.com/
2. Connect wallet (MetaMask)
3. Click "Swap" or "Trade"
4. Select token pair: GALA ↔ MEME
5. Enter amount
6. Confirm swap
7. Wait for transaction

**Price Discovery:**
- Price determined by AMM formula: `x × y = k`
- No order books
- Instant execution
- Slippage based on pool depth

**Pool Mechanics:**
```
Initial Pool State:
├─ GALA: 1,541,159
└─ MEME: X tokens
└─ k = 1,541,159 × X (constant)

After Swap (example):
User swaps 1,000 GALA for MEME
├─ GALA: 1,542,159 (+1,000)
└─ MEME: X - Y (decreased)
└─ k = SAME (constant product maintained)
```

#### Timing:
- Available **immediately** after indexing
- Typically 5-15 minutes after graduation
- Transaction speed: ~10-30 seconds per swap

---

## Supply Information

### ⚠️ IMPORTANT: Supply Stays at 10M

**Actual Observed Behavior:**
- ✅ Max supply: 10,000,000 tokens
- ✅ Supply after graduation: 10,000,000 tokens (STAYS THE SAME)
- ❌ NO conversion to 1 billion tokens observed

**Evidence:**
```
Token: GRDFBCC (graduated October 8, 2025)
Pre-graduation supply: 10,000,000 tokens
Post-graduation supply: 10,000,000 tokens
Holder balance: 10,000,000 tokens (unchanged)
```

### ⚠️ Unconfirmed Meeting Notes

**What was mentioned in meetings:**
- Discussion of 1B supply standardization
- Mentioned as future standardization across all graduated tokens
- NOT observed in actual test results

**Status:** 
- ⏳ Unconfirmed - awaiting clarification from development team
- 📋 Listed in questions for follow-up
- ⚠️ Until confirmed, assume supply stays at 10M

### Supply Example:

**Scenario:** You hold 10,000,000 tokens (100% of supply before graduation)

```
PRE-GRADUATION:
├─ Your tokens: 10,000,000
├─ Total supply: 10,000,000
├─ Your share: 100%
├─ Token price: ~0.154 GALA (varies by bonding curve)
└─ Your value: ~1,540,000 GALA

POST-GRADUATION (ACTUAL):
├─ Your tokens: 10,000,000 (SAME!)
├─ Total supply: 10,000,000 (SAME!)
├─ Your share: 100% (SAME)
├─ Token price: Set by DEX AMM (market-driven)
└─ Your value: Determined by DEX market price
```

**Key Insight:** Supply does NOT change at graduation. Your token balance stays exactly the same.

---

## Timing & Delays

### Complete Timeline:

```
T+0s:       Graduation transaction confirms
            ├─ Bonding curve closes
            ├─ Status changes to "Graduated"
            ├─ Creator receives reward
            ├─ Platform collects fee
            └─ Pool funds locked

T+0s:       Supply stays at 10M tokens
            └─ No conversion occurs

T+0-5m:     Pool creation transaction
            └─ GALA/MEME pool deployed on chain

T+5m:       Pool exists on blockchain
            └─ Can be queried directly

T+5-15m:    DEX backend indexing
            ├─ Pool scanned by indexer
            ├─ Added to database
            └─ Appears in UI

T+5-15m:    Balance section updated
            └─ Token visible in user balances

T+5-15m+:   Trading available
            └─ Users can swap immediately

T+???:      Explore tab (currently broken)
            └─ No ETA for fix
```

### Recommended Wait Times:

| Action | Minimum Wait | Recommended Wait | Maximum Wait |
|--------|--------------|------------------|--------------|
| Check graduation status | 0s (instant) | 30s | 1m |
| Navigate to DEX | 0s | 5m | 10m |
| Check balance section | 5m | 10m | 15m |
| Attempt first swap | 5m | 10m | 20m |
| Report missing token | 20m | 30m | 1h |

---

## Known Issues

### 1. Explore Tab Not Working ⚠️

**Issue:** Graduated pools don't appear in Explore tab

**Status:** In progress / not yet implemented

**Impact:** 
- Users must search directly for tokens
- Reduces discoverability
- New pools hard to find

**Workaround:**
- Share direct links to tokens
- Use Balance section to view your tokens
- Search by exact symbol

**Timeline:** Unknown

---

### 2. Balance Indexing Delay ⏱️

**Issue:** Token takes 5-15 minutes to appear in DEX balance

**Status:** Expected behavior (blockchain indexing)

**Impact:**
- Users may think graduation failed
- Requires patience and waiting

**Workaround:**
- Wait 10-15 minutes
- Refresh page periodically
- Verify graduation on Launchpad first

**Timeline:** Inherent to system architecture

---

### 3. Supply Conversion Not Visible ℹ️

**Issue:** UI doesn't clearly show 10M → 1B conversion

**Status:** Documentation/UI clarity issue

**Impact:**
- Users confused by different token amounts
- Think they lost tokens
- Don't understand price change

**Workaround:**
- Educate users about conversion
- Show "before/after" comparison
- Emphasize value preservation

**Timeline:** Needs UI improvement

---

## Testing Guide

### Running the Test:

```bash
# Run complete graduation flow test
npx playwright test complete-graduation-flow.spec.ts --timeout=1200000

# Run with headed browser (recommended)
HEADLESS=false npx playwright test complete-graduation-flow.spec.ts

# Run specific phase test
npx playwright test complete-graduation-flow.spec.ts -g "supply conversion"
```

### Test Coverage:

The test suite validates:

✅ **Phase 1:** Manual purchase to 100%
✅ **Phase 2:** Automatic distribution verification
✅ **Phase 3:** DEX pool creation
✅ **Phase 4:** Balance display on DEX
⚠️ **Phase 5:** Explore tab (notes known issue)
✅ **Phase 6:** Trading capability

✅ **Supply conversion:** 10M → 1B math
✅ **Timing:** All expected delays
✅ **Rewards:** Creator receives 17,777 GALA

### Expected Results:

```
[TEST] ✅ Phase 0: Setup & wallet connection
[TEST] ✅ Phase 1: Manual purchase to 100%
[TEST] ✅ Phase 2: Automatic distribution
[TEST] ✅ Phase 3: DEX pool creation
[TEST] ✅ Phase 4: DEX balance display
[TEST] ⚠️ Phase 5: Explore tab (known issue)
[TEST] ✅ Phase 6: DEX trading capability

[TEST] GRADUATION METRICS:
[TEST] Threshold: 1,640,985.844 GALA
[TEST] Creator reward: 17,777 GALA
[TEST] Supply conversion: 10,000,000 → 1,000,000,000
[TEST] Supply multiplier: 100x

[TEST] TIMING:
[TEST] Distribution: Instant (T+0s)
[TEST] Pool creation: 0-5 minutes
[TEST] DEX indexing: 5-15 minutes
[TEST] Total wait: ~15-20 minutes
```

### Screenshots Captured:

The test generates screenshots at each phase:
- `complete-flow-0-setup.png` - Initial setup
- `complete-flow-1-buy-X.png` - Each purchase
- `complete-flow-2-distribution.png` - Distribution verification
- `complete-flow-3-pool-creation.png` - Pool creation
- `complete-flow-4a-dex-landing.png` - DEX landing page
- `complete-flow-4b-dex-balance.png` - Balance section
- `complete-flow-5-explore-tab.png` - Explore tab
- `complete-flow-6-dex-trading.png` - Trading interface

---

## Quick Reference

### Key Constants:

```typescript
GRADUATION_THRESHOLD: 1,640,985.844 GALA
CREATOR_REWARD: 17,777 GALA (~1%)
PLATFORM_FEE: 5%
DEX_POOL: 94%

PRE_GRAD_SUPPLY: 10,000,000 tokens
POST_GRAD_SUPPLY: 1,000,000,000 tokens
SUPPLY_MULTIPLIER: 100x

POOL_CREATION_DELAY: 5 minutes
DEX_INDEXING_DELAY: 15 minutes
MAX_WAIT_TIME: 20 minutes
```

### Graduation Checklist:

- [ ] Bonding curve shows 0%
- [ ] Status badge shows "Graduated to DEX" (green)
- [ ] Buy/Sell inputs disabled
- [ ] "Trade on Pool" button visible
- [ ] Creator balance increased by ~17,777 GALA
- [ ] Wait 10-15 minutes
- [ ] Check DEX balance section
- [ ] Token visible in balances
- [ ] Can search for token in swap
- [ ] Can select token for trading
- [ ] Pool has liquidity

---

## Related Documentation

- `BONDING-CURVE-SPECIFICATION.md` - Bonding curve math
- `GRADUATION-TESTING-GUIDE.md` - Graduation test suite
- `GRADUATION-RESULTS-SUMMARY.md` - Test results
- `MEETING-NOTES-ANALYSIS.md` - Supply conversion details
- `E2E-TEST-DOCUMENTATION.md` - End-to-end testing

---

## Summary

The graduation flow is a **6-phase process** that:

1. ✅ **Manual:** User purchases to 100%
2. ✅ **Automatic:** Distribution happens instantly
3. ✅ **Automatic:** Pool created with 100x supply conversion
4. ✅ **Automatic:** Balance appears on DEX (5-15m delay)
5. ⚠️ **Broken:** Explore tab not working (in progress)
6. ✅ **Manual:** DEX trading available

**Most Important Detail:** Token supply converts from **10M → 1B** at graduation, with price adjusting proportionally to preserve holder value.

---

**Document Version:** 1.0  
**Last Updated:** October 14, 2025  
**Test Status:** ✅ Comprehensive test coverage  
**Author:** AI Test Automation Assistant

