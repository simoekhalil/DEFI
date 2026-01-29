# 🚀 Quick Start: Wallet Setup for Testing

Your Gala wallet is configured: `client|618ae395c1c653111d3315be`

## ✅ What's Already Done

1. ✅ `.env` file created (contains your wallet configuration)
2. ✅ `.env.example` created (template for others)
3. ✅ `.gitignore` updated (protects your private key)
4. ✅ `dotenv` installed (loads environment variables)
5. ✅ Balance checker script ready (`scripts/check-balance.ts`)
6. ✅ NPM scripts configured
7. ✅ Playwright config updated to load `.env`

## 🔐 NEXT STEP: Add Your Private Key

**Open the `.env` file and replace the placeholder:**

```powershell
notepad .env
```

Change this line:
```env
TEST_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

To:
```env
TEST_PRIVATE_KEY=your_actual_private_key
```

⚠️ **CRITICAL:** Never commit this file to git! (Already protected by `.gitignore`)

## 💰 Check Your Balance

Once you've added your private key, check your balance:

```powershell
npm run balance
```

Expected output:
```
💰 GALA WALLET BALANCE CHECKER
==================================================
Wallet: client|618ae395c1c653111d3315be
==================================================

✅ BALANCE RETRIEVED SUCCESSFULLY

💵 Total Balance:     1,234.56 GALA
🔒 Locked Balance:    100.00 GALA
✨ Available Balance: 1,134.56 GALA
```

## 🧪 Run Tests With Your Wallet

### Option 1: Automated Tests (Mock Wallet - Safe for CI)
```powershell
npm run test:automated
```

### Option 2: Real Wallet Tests
```powershell
npm run test:real:headed
```

### Option 3: Check Balance Only
```powershell
npm run wallet:balance
```

## 📁 Where Everything Is Stored

| Item | Location | Safe to Commit? |
|------|----------|----------------|
| **Private Key** | `.env` | ❌ NO - Already protected |
| **Wallet Address** | `.env` | ✅ Yes (already in code) |
| **Balance Script** | `scripts/check-balance.ts` | ✅ Yes |
| **Setup Script** | `setup-wallet.ps1` | ✅ Yes |
| **Guide** | `WALLET_SETUP_GUIDE.md` | ✅ Yes |

## 🔒 Security Checklist

- [x] `.env` is in `.gitignore`
- [x] Private key stored in `.env` only
- [ ] **YOU NEED TO:** Add your actual private key to `.env`
- [ ] **YOU NEED TO:** Verify `.env` is not committed to git
- [ ] **RECOMMENDED:** Use a dedicated testing wallet

## 🛠️ Available Commands

```powershell
# Setup wallet (already done for you)
npm run wallet:setup

# Check balance
npm run balance
npm run wallet:balance

# Run tests with automated wallet
npm run test:automated
npm run test:wallet:automated

# Run tests with real wallet
npm run test:real:headed
npm run test:galachain
npm run test:galachain:balance

# Create real tokens
npm run test:real:creation
npm run test:galachain:create
```

## 🆘 Troubleshooting

### "Cannot find private key"
✅ Make sure you've added your real private key to `.env`

### "Balance shows 0"
✅ Check your wallet actually has GALA tokens
✅ Verify wallet address is correct
✅ Ensure you're on mainnet (not testnet)

### "Environment variables not loading"
✅ Restart your terminal/IDE after creating `.env`
✅ Verify `dotenv` is installed: `npm list dotenv`

## 📚 Full Documentation

For complete details, see:
- `WALLET_SETUP_GUIDE.md` - Full setup guide
- `scripts/README.md` - Script documentation
- `.env.example` - Environment variable template

---

**Ready to test! Just add your private key to `.env` and run `npm run balance`** 🎉

