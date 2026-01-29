# 🔐 Wallet Setup Guide for Testing

## Your Gala Wallet

**Address:** `client|618ae395c1c653111d3315be`  
**Network:** GalaChain Mainnet  
**Status:** ✅ Ready for Testing

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Store Your Private Key Securely

1. **Copy the `.env.example` file:**
   ```powershell
   Copy-Item .env.example .env
   ```

 2. **Edit `.env` file and add your private key:**
    ```env
    TEST_WALLET_ADDRESS=client|618ae395c1c653111d3315be
    TEST_PRIVATE_KEY=Biology pull phrase dial phrase like success inherit truth birth torch indicate
    ```

3. **Verify `.env` is in `.gitignore`** ✅ (Already done!)

### Step 2: Check Your Balance

Run the balance checker script:
```powershell
npx ts-node scripts/check-balance.ts
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

### Step 3: Configure Tests to Use Your Wallet

Your tests can now access the private key via environment variables:

```typescript
// In your test files
const privateKey = process.env.TEST_PRIVATE_KEY;
const walletAddress = process.env.TEST_WALLET_ADDRESS;
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Store private keys in `.env` file (local only)
- ✅ Use environment variables in code
- ✅ Keep `.env` in `.gitignore`
- ✅ Use a dedicated testing wallet (not your main wallet)
- ✅ Limit funds in testing wallet to what you need

### ❌ DON'T:
- ❌ **NEVER** commit `.env` to git
- ❌ **NEVER** hardcode private keys in code files
- ❌ **NEVER** share your private key
- ❌ **NEVER** use your main wallet for testing
- ❌ **NEVER** store private keys in cloud/shared drives

---

## 📊 How Balance Retrieval Works

Your tests use the **GalaChain Gateway API** to fetch balances:

```typescript
// API Endpoint
POST https://gateway-mainnet.galachain.com/api/asset/token-contract/FetchBalances

// Request Body
{
  "owner": "client|618ae395c1c653111d3315be",
  "collection": "GALA",
  "category": "Unit",
  "type": "none",
  "additionalKey": "none",
  "instance": "0"
}
```

This returns:
- **Total balance** - All GALA tokens
- **Locked balance** - Tokens currently locked in holds
- **Available balance** - Tokens you can use

---

## 🧪 Using Your Wallet in Tests

### Example 1: Automated Wallet Connection

```typescript
import { AutomatedWalletConnection } from './tests/helpers/automated-wallet-connection';

const wallet = new AutomatedWalletConnection(page, {
  address: process.env.TEST_WALLET_ADDRESS!,
  privateKey: process.env.TEST_PRIVATE_KEY,
  type: 'gala',
  enableTransactions: true,
  autoConnect: true
});

const result = await wallet.connect();
const balance = await wallet.getBalance();
console.log(`Balance: ${balance} GALA`);
```

### Example 2: Real Token Creation

```typescript
test('create real token with my wallet', async ({ page }) => {
  const wallet = new AutomatedWalletConnection(page, {
    address: process.env.TEST_WALLET_ADDRESS!,
    privateKey: process.env.TEST_PRIVATE_KEY,
    type: 'gala',
    enableTransactions: true
  });

  await wallet.connect();
  
  // Check balance before transaction
  const balance = await wallet.getBalance();
  console.log(`Current balance: ${balance} GALA`);
  
  // Your test code here...
});
```

### Example 3: Token Buying/Selling

```typescript
// Buy tokens
const buyResult = await wallet.buyTokens('token_address', '100', {
  slippage: 1,
  gasLimit: '300000'
});

// Sell tokens
const sellResult = await wallet.sellTokens('token_address', '50', {
  slippage: 1
});

// Check token balance
const tokenBalance = await wallet.getTokenBalance('token_address');
```

---

## 🛠️ Available NPM Scripts

Add these to your `package.json` scripts:

```json
{
  "scripts": {
    "balance": "npx ts-node scripts/check-balance.ts",
    "test:real-wallet": "WALLET_TYPE=gala playwright test",
    "test:mock-wallet": "WALLET_TYPE=mock playwright test"
  }
}
```

Usage:
```powershell
# Check balance
npm run balance

# Run tests with real wallet
npm run test:real-wallet

# Run tests with mock wallet (safe for CI)
npm run test:mock-wallet
```

---

## 🔍 Troubleshooting

### Problem: "Private key not found"
**Solution:** Make sure `.env` file exists and contains `TEST_PRIVATE_KEY=your_key`

### Problem: "Balance shows 0"
**Solutions:**
1. Verify your wallet address is correct
2. Check you're using the correct network (mainnet vs testnet)
3. Ensure your wallet has GALA tokens

### Problem: "Cannot read environment variables"
**Solution:** Install dotenv and load it:
```typescript
import 'dotenv/config';
```

Or in playwright.config.ts:
```typescript
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  // ... your config
});
```

---

## 📚 Additional Resources

- **Your test files already configured:**
  - `tests/helpers/automated-wallet-connection.ts` - Wallet helper class
  - `tests/galachain-wallet-connection.spec.ts` - Wallet connection tests
  - `tests/real-token-creation.spec.ts` - Real token creation with wallet
  - `wallet-test-config.js` - Wallet configuration

- **Configuration files:**
  - `.env` - Your private credentials (never commit!)
  - `wallet-test-config.js` - Test wallet settings
  - `playwright-ci.config.ts` - CI/CD configuration

---

## ✅ Setup Checklist

- [ ] Created `.env` file with private key
- [ ] Verified `.env` is in `.gitignore`
- [ ] Ran balance check script successfully
- [ ] Tested wallet connection in tests
- [ ] Understood security best practices
- [ ] Using dedicated testing wallet (not main wallet)

---

## 🎯 Next Steps

1. **Check your balance:**
   ```powershell
   npx ts-node scripts/check-balance.ts
   ```

2. **Run a test with your wallet:**
   ```powershell
   npx playwright test tests/galachain-wallet-connection.spec.ts
   ```

3. **Try real token creation:**
   ```powershell
   npx playwright test tests/real-token-creation.spec.ts
   ```

---

## 🆘 Need Help?

If you encounter issues:
1. Check that `.env` file exists and is properly formatted
2. Verify your private key is correct
3. Ensure wallet has sufficient GALA balance
4. Review test logs for specific error messages

Your wallet is now ready for testing! 🚀

