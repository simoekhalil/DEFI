# 🛠️ Scripts Directory

This directory contains utility scripts for wallet management and testing.

## Available Scripts

### `check-balance.ts`
**Purpose:** Retrieve your Gala wallet balance from GalaChain  
**Usage:**
```powershell
npm run balance
# or directly
npx ts-node scripts/check-balance.ts
```

**What it does:**
- Connects to GalaChain mainnet gateway
- Fetches your GALA token balance
- Shows total, locked, and available balance
- Displays detailed balance information

**Example output:**
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

---

## Setup

Before using these scripts, make sure you've:

1. **Created `.env` file** with your wallet credentials
   ```powershell
   npm run wallet:setup
   ```

2. **Added your private key** to `.env`
   ```env
   TEST_WALLET_ADDRESS=client|618ae395c1c653111d3315be
   TEST_PRIVATE_KEY=your_actual_private_key
   ```

3. **Verified the setup** by checking your balance
   ```powershell
   npm run balance
   ```

---

## Security Notes

🔒 **Important:**
- These scripts read from `.env` file which is git-ignored
- Never commit your private key to version control
- Use a dedicated testing wallet, not your main wallet
- Limit funds in testing wallet to what you need

---

## Troubleshooting

**Problem:** "Cannot find module 'dotenv'"  
**Solution:** Install dotenv: `npm install dotenv`

**Problem:** "Balance shows 0"  
**Solution:** 
- Verify your wallet address is correct
- Ensure wallet has GALA tokens
- Check you're connected to the correct network

**Problem:** "Private key not found"  
**Solution:** Make sure `.env` file exists and contains `TEST_PRIVATE_KEY`

