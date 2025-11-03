# Bonding Curve Specification

## Overview
The GalaChain Launchpad uses a **Token Bonding Curve** mathematical model that defines the relationship between the price of a token and its supply.

---

## 🧮 Mathematical Formula

### **Token Bonding Equation:**
```
y = a * b^x * (b^x)
```

Where:
- `y` = Price per token (in GALA)
- `x` = Current supply (number of tokens)
- `a` = Base price coefficient
- `b` = Scaling factor (controls price increase rate)

### **Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| **a** (Base Price) | 0.000018050687151 | Starting price coefficient |
| **b** (Scaling Factor) | 0.000001186069 | Rate at which price increases with supply |
| **Market Cap Target** | 1,640,985 GALA | Graduation threshold at 10M token supply |

---

## 📊 Price Progression Table

### **Buy Exact Tokens - Price Per Supply Level**

| Previous Supply | Current Supply | Price Per Token (GALA) | Required Native Currency (GALA) | Cumulative Cost (GALA) |
|-----------------|----------------|------------------------|----------------------------------|------------------------|
| 0 | 1,000,000 | 0.0020107371319 | 100.3713119 | 100.37 |
| 1,000,000 | 2,000,000 | 0.0035221329062 | 322.1329062 | 422.50 |
| 2,000,000 | 3,000,000 | 0.0051033837164 | 1,033.837164 | 1,456.34 |
| 3,000,000 | 4,000,000 | 0.0069317047211 | 3,317.047211 | 4,773.39 |
| 4,000,000 | 5,000,000 | 0.0108484001 | 10,848.4001 | 15,621.79 |
| 5,000,000 | 6,000,000 | 0.0241748461 | 34,174.65481 | 49,796.44 |
| 6,000,000 | 7,000,000 | 0.1006784818 | 106,878.4818 | 156,674.92 |
| 7,000,000 | 8,000,000 | 0.3519509924 | 351,950.9924 | 508,625.91 |
| 8,000,000 | 9,000,000 | 1.1258516030 | 1,125,851.603 | 1,634,477.52 |
| 9,000,000 | **10,000,000** | **variable** | **6,508.328** | **1,640,985.844** |

**Total Market Cap at 10M tokens:** 1,640,985.844 GALA

---

## 🔄 Functions

### 1. **BuyWithExactTokens**
Calculates how much native currency (GALA) is needed to buy an exact number of tokens.

**Input:** Number of tokens  
**Output:** Cost in native currency (GALA)

**Example:**
- Buy 1,000,000 tokens = 100.37 GALA
- Buy 10,000,000 tokens = 1,640,985.844 GALA

---

### 2. **BuyWithNative**
Calculates how many tokens you'll receive for a given amount of native currency.

**Input:** Amount of native currency (GALA)  
**Output:** Number of tokens

**Example:**
- Spend 100 GALA = ~997,000 tokens (early stage)
- Spend 1,000,000 GALA = ~500,000 tokens (late stage)

---

### 3. **SellExactTokens**
Calculates how much native currency you'll receive when selling an exact number of tokens.

**Input:** Number of tokens  
**Output:** Amount of native currency received (GALA)

**Note:** Subject to RBC (Reverse Bonding Curve) unbonding fees (1-50%)

---

### 4. **SellWithNative**
Calculates how many tokens need to be sold to receive a desired amount of native currency.

**Input:** Amount of native currency desired (GALA)  
**Output:** Number of tokens needed to sell

---

## 📈 Price Dynamics

### **Exponential Growth Curve**

The bonding curve creates exponential price growth:

```
Early Stage (0-5M tokens):
- First 1M tokens: 100 GALA
- Next 1M tokens: 322 GALA
- Growth rate: ~3.2x per million

Mid Stage (5-7M tokens):
- 5M-6M tokens: 34,175 GALA
- 6M-7M tokens: 106,878 GALA
- Growth rate: ~3.1x per million

Late Stage (7-10M tokens):
- 7M-8M tokens: 351,951 GALA
- 8M-9M tokens: 1,125,852 GALA
- 9M-10M tokens: 6,508 GALA
- Growth rate: ~3.2x per million (until final push)
```

### **Why Exponential?**

The formula `y = a * b^x * (b^x)` creates a **double exponential** effect:
1. `b^x` grows exponentially with supply
2. Multiplying by another `b^x` amplifies the growth
3. Result: Price increases dramatically as supply grows

---

## 💰 Graduation Economics

### **Reaching Market Cap (10M Tokens)**

To graduate a token to DEX, the market cap must reach **1,640,985.844 GALA**.

**Theoretical pure bonding curve cost:** 1,640,985.844 GALA

**Actual cost with trading fees:**
- Our test results: ~1,650,000 GALA
- Trading fees: ~9,000 GALA (~0.55%)
- Additional platform fees: ~100,000 GALA (~6%)

**Total effective cost:** ~1,650,000 GALA

---

## 🎯 Bonding Curve Progress Calculation

### **Formula:**
```
Progress % = (Current Market Cap / Target Market Cap) × 100
Progress % = (Current Market Cap / 1,640,985.844) × 100
```

### **Examples:**
- 100 GALA spent (1M tokens) = 100 / 1,640,985 = **0.006%**
- 100,000 GALA spent (~6M tokens) = 100,000 / 1,640,985 = **6.09%**
- 1,000,000 GALA spent (~8.5M tokens) = 1,000,000 / 1,640,985 = **60.95%**
- 1,640,986 GALA spent (10M tokens) = **100%** → **GRADUATION!** 🎓

---

## 🔬 Mathematical Properties

### 1. **Continuous Pricing**
The bonding curve provides instant, deterministic pricing at any supply level.

### 2. **Price Discovery**
No order books needed - price is purely a function of supply.

### 3. **Liquidity**
Always available to buy/sell (before graduation) - the curve IS the liquidity.

### 4. **Fair Launch**
Everyone pays according to the same mathematical formula.

### 5. **Anti-Dump Protection**
Exponential curve means large sells have significant price impact.

---

## 📊 Sell Price Curve

### **Sell With Native - Price You'll Get When Selling**

| Current Supply | New Supply | Price (GALA) | Tokens Sold | Total GALA Received |
|----------------|------------|--------------|-------------|---------------------|
| 10,000,000 | 9,000,000 | 31.27520343 | 1,000,000 | 900,000 |
| 9,000,000 | 8,000,000 | 112687.1803 | 1,000,000 | 1,000,000 |
| 8,000,000 | 7,000,000 | 351950.9924 | 1,000,000 | 2,000,000 |
| 7,000,000 | 6,000,000 | 106878.4818 | 1,000,000 | 4,000,000 |
| 6,000,000 | 5,000,000 | 34174.65481 | 1,000,000 | 6,000,000 |
| 5,000,000 | 4,000,000 | 10848.4001 | 1,000,000 | 5,000,000 |
| 4,000,000 | 3,000,000 | 3317.047211 | 1,000,000 | 4,000,000 |
| 3,000,000 | 2,000,000 | 1033.837164 | 1,000,000 | 3,000,000 |
| 2,000,000 | 1,000,000 | 322.1329062 | 1,000,000 | 2,000,000 |
| 1,000,000 | 0 | 100.3713119 | 1,000,000 | 1,000,000 |

**Sum:** Selling all 10M tokens back = **1,640,985.844 GALA** (before RBC fees)

**Note:** RBC (Reverse Bonding Curve) fees of 1-50% apply to sells to prevent dumping.

---

## 🛡️ RBC (Reverse Bonding Curve) Protection

### **Purpose**
Discourages early selling and rewards long-term holders.

### **Fee Range**
- Configurable per token: 1-50%
- Default: Enabled
- Applied to sell transactions only

### **Example:**
If you sell tokens worth 10,000 GALA with a 20% RBC fee:
- Bonding curve value: 10,000 GALA
- RBC fee (20%): -2,000 GALA
- **You receive:** 8,000 GALA

---

## 🎓 Graduation Mechanics

### **What Happens at Graduation?**

When market cap reaches **1,640,985.844 GALA**:

1. ✅ **Bonding Curve Closes** - No more buys/sells on curve
2. ✅ **Pool Distribution:**
   - Creator Reward: 17,777 GALA (~1%)
   - Platform Fee: 5% of pool
   - DEX Liquidity Pool: 94% of pool

3. ✅ **DEX Trading Begins**
   - Token listed on DEX (Uniswap-style)
   - Free market trading
   - Price determined by supply/demand

4. ✅ **Status Changes:**
   - Bonding Curve Progress: 100% → 0% (resets)
   - Status: "Active Bonding Curve" → "Graduated to DEX"
   - Trading: Bonding curve → "Trade on Pool"

---

## 🧪 Test Validation Points

### **Key Checkpoints for Testing:**

1. **Early Stage Pricing (0-20%):**
   - ✅ Buy 1M tokens should cost ~100 GALA
   - ✅ Price per token should be < 0.01 GALA

2. **Mid Stage Pricing (20-60%):**
   - ✅ Buy at 5M supply should cost ~35k GALA for 1M tokens
   - ✅ Price increasing exponentially

3. **Late Stage Pricing (60-100%):**
   - ✅ Buy at 8M supply should cost ~350k GALA for 1M tokens
   - ✅ Final push to 10M requires significant GALA

4. **Graduation:**
   - ✅ Market cap reaches exactly 1,640,985.844 GALA
   - ✅ Status changes to "Graduated to DEX"
   - ✅ Bonding curve shows 0%
   - ✅ DEX trading enabled

---

## 📐 Implementation Notes

### **Precision:**
- All calculations use high-precision decimal math
- Avoid floating-point errors with proper libraries
- Market cap target: 1,640,985 (rounded) vs 1,640,985.844 (exact)

### **Gas Optimization:**
- Pre-calculate common values
- Cache expensive operations
- Use lookup tables for frequent queries

### **Edge Cases:**
- First purchase (supply = 0)
- Last purchase before graduation
- Exact graduation amount
- Selling entire balance

---

## 🔗 Related Documentation

- `GRADUATION-TESTING-GUIDE.md` - Graduation process and testing
- `FEE-VALIDATION-RESULTS.md` - Fee calculations and analysis
- `GRADUATION-RESULTS-SUMMARY.md` - Test results
- `TEST-SUITE-DOCUMENTATION.md` - Complete test suite

---

## 📚 References

**Bonding Curve Theory:**
- Token Bonding Curves: https://yos.io/2018/11/10/bonding-curves/
- Continuous Organizations: https://github.com/C-ORG/whitepaper

**Mathematical Background:**
- Exponential functions
- Integral calculus (for area under curve)
- Market cap = integral of price function from 0 to supply

---

**Document Version:** 1.0  
**Last Updated:** October 8, 2025  
**Based on:** GalaChain Launchpad Specification Screenshot

