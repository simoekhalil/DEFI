# 🐛 BUG-001: Price Percentage Change Displays "NaN%"

**Severity:** 🟠 **Major**  
**Priority:** High  
**Environment:** TEST1 (https://lpad-frontend-test1.defi.gala.com/)  
**Component:** Token Detail Page / Price Display  
**Status:** Open  
**Reported Date:** January 14, 2026  

---

## Summary

The price percentage change indicator displays "+NaN%" instead of a valid percentage value on newly created token detail pages.

---

## Steps to Reproduce

1. Navigate to https://lpad-frontend-test1.defi.gala.com/
2. Create a new token via the Launch page OR use SDK to launch token
3. Navigate to the token detail page: `/buy-sell/testlaunch01`
4. Observe the Price section

---

## Actual Result

![Price NaN Bug](../screenshots/price-nan-bug.png)

The price display shows:
```
Price  +NaN%
0.00002 GALA
```

The **"+NaN%"** indicator is invalid and should display a proper percentage.

---

## Expected Result

The price percentage change should display:
- **"0%"** for newly created tokens with no price history
- **"+X.XX%"** or **"-X.XX%"** for tokens with price movement
- Or be hidden entirely if no historical data is available

---

## Technical Analysis

### Root Cause (Probable)
The percentage calculation is likely performing a division operation where:
- `previousPrice` is `0`, `null`, or `undefined`
- Formula: `((currentPrice - previousPrice) / previousPrice) * 100`
- Result: Division by zero or undefined produces `NaN`

### Affected Tokens
- `testlaunch01` (TLAUNCH) - newly created
- Likely affects ALL newly created tokens

---

## Environment Details

| Property | Value |
|----------|-------|
| URL | https://lpad-frontend-test1.defi.gala.com/buy-sell/testlaunch01 |
| Token Name | testlaunch01 |
| Token Symbol | TLAUNCH |
| Price | 0.00002 GALA |
| Marketcap | 0.09638 USD |
| Volume | 10 GALA |
| Browser | Chrome/Chromium |

---

## Console Output

```
No specific JavaScript error logged for NaN calculation
(Silent failure - no error thrown)
```

---

## Suggested Fix

```javascript
// Before (buggy)
const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

// After (fixed)
const calculatePriceChange = (current, previous) => {
  if (!previous || previous === 0 || !current) {
    return null; // or 0
  }
  return ((current - previous) / previous) * 100;
};

// In render
{priceChange !== null && !isNaN(priceChange) ? (
  <span className={priceChange >= 0 ? 'positive' : 'negative'}>
    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
  </span>
) : null}
```

---

## Impact

| Aspect | Impact |
|--------|--------|
| User Experience | 🟠 Poor - confusing display |
| Functionality | 🟡 Works - price value still shows |
| Data Integrity | 🟢 None - display only issue |
| Trust | 🟠 Reduced - looks unprofessional |

---

## Acceptance Criteria

- [ ] Price percentage should NOT display "NaN%"
- [ ] Newly created tokens should show "0%" or hide percentage
- [ ] Tokens with price history should show accurate percentage
- [ ] Add unit tests for edge cases (zero, null, undefined prices)

---

## Related

- Token: `testlaunch01` (TLAUNCH)
- Transaction ID: `74156765-c94e-4f56-8e0d-33ab963a7530`
- Created: January 14, 2026

---

## Attachments

Screenshot showing the NaN% display on token detail page.
