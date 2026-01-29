# 🚀 Setup Instructions - Create Token with Wallet

## Quick Start Guide

### Step 1: Create Your .env File

1. **Copy the example file:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit the .env file and add your wallet credentials:**
   ```powershell
   notepad .env
   ```

3. **Replace these values:**
   - `TEST_WALLET_ADDRESS` - Your Gala wallet address (format: `client|...`)
   - `TEST_PRIVATE_KEY` - Your actual private key (keep this SECRET!)

### Step 2: Verify Your Setup

Check that your credentials are properly set:

```powershell
node -e "require('dotenv').config(); console.log('Wallet:', process.env.TEST_WALLET_ADDRESS); console.log('Private Key:', process.env.TEST_PRIVATE_KEY ? 'Set ✅' : 'Missing ❌');"
```

### Step 3: Run the Token Creation Script

Execute the automated script that will:
- Load the Gala wallet extension
- Connect using your wallet credentials
- Create a new token
- Verify it appears on the main page

```powershell
node create-token-with-wallet.js
```

## What the Script Does

The `create-token-with-wallet.js` script performs the following steps automatically:

1. ✅ Loads the Gala wallet extension from `extensions/testnet-wallet/build`
2. ✅ Navigates to https://lpad-frontend-dev1.defi.gala.com
3. ✅ Injects your wallet credentials (address and private key)
4. ✅ Connects the wallet to the site
5. ✅ Navigates to the token creation form
6. ✅ Fills in the token details (name, symbol, description)
7. ✅ Submits the token creation
8. ✅ Waits for confirmation
9. ✅ Navigates back to main page to verify the token

## Screenshots

The script automatically saves screenshots at each step:

- `token-creation-1-loaded.png` - Initial page load
- `token-creation-2-connected.png` - Wallet connected
- `token-creation-3-form.png` - Token creation form
- `token-creation-4-filled.png` - Form filled with data
- `token-creation-5-submitted.png` - After submission
- `token-creation-6-confirmed.png` - Confirmation page
- `token-creation-7-mainpage.png` - Token visible on main page

## Troubleshooting

### "Missing wallet credentials" Error

Make sure your `.env` file exists and contains:
```env
TEST_WALLET_ADDRESS=client|your_wallet_address_here
TEST_PRIVATE_KEY=your_actual_private_key_here
```

### Extension Not Loading

Verify the extension path exists:
```powershell
Test-Path extensions\testnet-wallet\build
```

If false, check that you have the extension in the correct location.

### Token Not Appearing on Main Page

- Wait a few more seconds - blockchain transactions take time
- Refresh the page manually
- Check the screenshots to verify the form was filled correctly

## Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS:**

1. **NEVER commit your .env file** - It's already in .gitignore
2. **Use a TEST WALLET ONLY** - Never use your main wallet
3. **Keep minimal funds** - Only what you need for testing
4. **Private key is sensitive** - Never share it with anyone
5. **Check .gitignore** - Make sure `.env` is listed

## Project Rules Reminder

According to the project rules:
- ✅ Always use Gala wallet extension from `C:\Users\Simone\web3-testing-app\extensions`
- ✅ Never simulate - always run on live URL: https://lpad-frontend-dev1.defi.gala.com/
- ✅ Full automation with no manual intervention required

## Next Steps

After creating your token:

1. **View it on the site:** https://lpad-frontend-dev1.defi.gala.com
2. **Search for your token** by name or symbol
3. **Test trading** - Buy/sell your token to test functionality
4. **Monitor graduation** - Track when your token reaches the bonding curve threshold

## Need Help?

If you encounter any issues:

1. Check the error screenshot: `token-creation-error.png`
2. Review the console output for specific error messages
3. Verify your .env file is properly configured
4. Ensure the extension is in the correct location

## Additional Scripts

Other useful scripts in this project:

- `open-extension-balance.js` - Check your wallet balance
- `create-token-with-extension.js` - Alternative token creation method
- `quick-balance-check.js` - Quick balance verification

---

✅ **You're all set!** Run the script and watch it create your token automatically.






