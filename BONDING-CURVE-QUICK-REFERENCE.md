# Bonding Curve Quick Reference

**Last Updated:** October 14, 2025  
**Status:** ✅ Validated Against Lpad

---

## 🎯 Critical Values

```
Market Cap Target: 1,640,985.844 GALA
Max Supply: 10,000,000 tokens
Base Price: 0.000018050687151 GALA
Scaling Factor: 0.000001186069
```

---

## 📊 Quick Checkpoint Table

| Supply | Cumulative Cost | Progress | Price Per Token |
|--------|----------------|----------|-----------------|
| 1M | 100 GALA | 0.01% | 0.00201 GALA |
| 2M | 423 GALA | 0.03% | 0.00352 GALA |
| 3M | 1.5k GALA | 0.09% | 0.00510 GALA |
| 4M | 4.8k GALA | 0.29% | 0.00693 GALA |
| 5M | 15.6k GALA | 0.95% | 0.01085 GALA |
| 6M | 49.8k GALA | 3.03% | 0.02417 GALA |
| 7M | 157k GALA | 9.55% | 0.10068 GALA |
| 8M | 509k GALA | 31.00% | 0.35195 GALA |
| 9M | 1.63M GALA | 99.60% | 1.12585 GALA |
| **10M** | **1.64M GALA** | **100%** 🎓 | N/A |

---

## 💰 Cost by Phase

| Phase | Tokens | Cost | % of Total |
|-------|--------|------|------------|
| **Early** | 0-5M | 15.6k | 0.95% |
| **Mid** | 5-8M | 493k | 30% |
| **Late** | 8-10M | 1.13M | 69% |

---

## 🚀 Growth Ratios

- **1M → 2M:** 1.75x
- **2M → 3M:** 1.45x
- **3M → 4M:** 1.36x
- **4M → 5M:** 1.57x
- **5M → 6M:** 2.23x
- **6M → 7M:** 4.16x ⚡ (HIGHEST)
- **7M → 8M:** 3.50x
- **8M → 9M:** 3.20x

**Average:** 2.40x per million tokens

---

## ⚡ Critical Point

**6M → 7M supply range has the HIGHEST growth ratio (4.16x)**

This is where the double exponential effect is most pronounced.

---

## 🧪 Run Tests

```bash
npx playwright test tests/bonding-curve-validation.spec.ts
```

**Expected:** ✅ 7/7 tests passing

---

## 📚 Full Documentation

See `BONDING-CURVE-TEST-SUMMARY.md` for complete analysis.

