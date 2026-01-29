# DEX Incentive APR Feature Test Plan

## Feature Overview

This test suite validates the new **Incentive APR** feature being deployed to the DEX platform.

### New Fields Added to Pool List

| Field | Type | Description |
|-------|------|-------------|
| `incentiveApr` | number | APR from incentive programs (bonus rewards) |
| `hasActiveIncentive` | boolean | Whether pool has an active incentive program |

### Calculation Changes

- **apr1d** now = **feeApr** + **incentiveApr**
- **incentiveApr** = (bonusPoolAmount / TVL) × (365 / programDuration) × 100

---

## Test Environment

| Component | URL |
|-----------|-----|
| **Frontend** | https://dex-frontend-test1.defi.gala.com |
| **Backend** | https://dex-backend-test1.defi.gala.com |
| **API** | https://dex-api-platform-dex-stage-gala.gala.com |

---

## Test Categories

### 1. Pool List Field Validation
- ✅ `incentiveApr` field present in pool responses
- ✅ `hasActiveIncentive` boolean field present
- ✅ `incentiveApr` is numeric and non-negative
- ✅ Values are correctly typed

### 2. APR Calculation Validation
- ✅ `apr1d` = `feeApr` + `incentiveApr`
- ✅ Incentive APR formula validation
- ✅ Zero APR for pools without active incentives
- ✅ Correct calculation based on bonus pool and duration

### 3. UI Display Validation
- ✅ Incentive indicator/badge visible
- ✅ Combined APR displayed correctly
- ✅ Tooltip shows APR breakdown (fee vs incentive)

### 4. Edge Cases
- ✅ Zero TVL pools handled gracefully
- ✅ Expired incentive programs show 0% APR
- ✅ APR sanity check (reasonable limits)

### 5. Performance & Consistency
- ✅ Consistent APR across multiple requests
- ✅ API response time within limits

---

## Running the Tests

### Run All Incentive APR Tests
```bash
npm run test:dex:incentive
```

### Run with Browser UI (Headed)
```bash
npm run test:dex:incentive:headed
```

### Run API Tests Only
```bash
npm run test:dex:incentive:api
```

### Run UI Tests Only
```bash
npm run test:dex:incentive:ui
```

### Run Specific Test
```bash
npx playwright test tests/dex-incentive-apr.spec.ts --grep "incentiveApr"
```

---

## Expected Results

### Before Feature Deployment
- Tests for new fields will fail (fields don't exist)
- This confirms the baseline state

### After Feature Deployment
- All field presence tests should pass
- Calculation tests should validate APR logic
- UI tests should show incentive badges where applicable

---

## Test File Location

```
tests/dex-incentive-apr.spec.ts
```

## Configuration File

```
playwright-dex-test1.config.ts
```

---

## Incentive APR Formula

```
incentiveApr = (bonusPoolAmount / TVL) × (365 / programDuration) × 100

Where:
- bonusPoolAmount: Total rewards in the incentive program (in USD or GALA)
- TVL: Total Value Locked in the pool
- programDuration: Length of the incentive program in days
```

### Example Calculation

| Parameter | Value |
|-----------|-------|
| Bonus Pool | $10,000 |
| TVL | $100,000 |
| Duration | 30 days |

```
incentiveApr = (10,000 / 100,000) × (365 / 30) × 100
            = 0.1 × 12.167 × 100
            = 121.67%
```

---

## Current Pool Structure (Pre-Deployment)

```json
{
  "poolPair": "GALA|Unit|none|none/GUSDC|Unit|none|none/3000",
  "poolName": "GALA/GUSDC",
  "tvl": 39426.68,
  "volume1d": 0,
  "volume30d": 45224.09,
  "fee": "0.3",
  "apr1d": 0
  // NEW FIELDS (after deployment):
  // "incentiveApr": 0,
  // "hasActiveIncentive": false
}
```

---

## Test Results Template

### Date: ___________
### Environment: TEST1

| Test Category | Passed | Failed | Skipped |
|---------------|--------|--------|---------|
| Field Validation | | | |
| APR Calculation | | | |
| UI Display | | | |
| Edge Cases | | | |
| Performance | | | |
| **TOTAL** | | | |

### Notes:
- 

---

## Contacts

- Feature Owner: [TBD]
- QA Lead: [TBD]
- Test Automation: Automated via Playwright

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 29, 2026 | Initial test suite creation |
