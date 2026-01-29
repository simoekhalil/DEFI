# 🔌 Testnet Wallet Extension Setup Guide

## 📦 Your Extension File

**Filename:** `build_Testnet(16_55)_20Aug (2)`

## 🚀 Quick Setup Instructions

### Step 1: Copy Extension to Project

Copy your extension file to the project's `extensions` folder:

```powershell
# If it's a folder, copy the folder:
Copy-Item -Path "path\to\build_Testnet(16_55)_20Aug (2)" -Destination "extensions\testnet-wallet" -Recurse

# If it's a zip file, extract it first:
Expand-Archive -Path "path\to\build_Testnet(16_55)_20Aug (2).zip" -DestinationPath "extensions\testnet-wallet"
```

### Step 2: Verify Extension Structure

The extension folder should contain:
- `manifest.json` (required)
- JavaScript files (`.js`)
- HTML files (`.html`)
- Other extension assets

### Step 3: Run Automated Tests

Once the extension is in place, run:

```powershell
npm run test:testnet:auto
```

This will:
- ✅ Automatically load your testnet wallet extension
- ✅ Connect to the testnet site
- ✅ Read your balance
- ✅ Enable full automation

---

## 📋 Manual Setup Steps

### Option A: Extension is a Folder

1. **Locate your extension folder:**
   - Find `build_Testnet(16_55)_20Aug (2)` on your computer

2. **Copy to project:**
   ```powershell
   Copy-Item -Path "C:\path\to\build_Testnet(16_55)_20Aug (2)" -Destination "C:\Users\Simone\web3-testing-app\extensions\testnet-wallet" -Recurse
   ```

3. **Verify it worked:**
   ```powershell
   dir extensions\testnet-wallet
   ```
   You should see `manifest.json` and other files

### Option B: Extension is a ZIP file

1. **Copy the ZIP to extensions folder:**
   ```powershell
   Copy-Item "C:\path\to\build_Testnet(16_55)_20Aug (2).zip" "C:\Users\Simone\web3-testing-app\extensions\"
   ```

2. **Extract it:**
   ```powershell
   cd extensions
   Expand-Archive -Path "build_Testnet(16_55)_20Aug (2).zip" -DestinationPath "testnet-wallet"
   ```

3. **Verify:**
   ```powershell
   dir testnet-wallet
   ```

---

## 🧪 What This Enables

Once the extension is set up, your tests will:

### ✅ Automatic Wallet Connection
- No manual clicking required
- Extension loads automatically
- Wallet connects programmatically

### ✅ Balance Retrieval
- Read balance directly from extension
- Access via browser APIs
- Get real-time testnet balance

### ✅ Full Test Automation
- Create tokens automatically
- Execute trades
- Test full graduation flow
- All with your testnet wallet

---

## 📁 Expected Directory Structure

```
C:\Users\Simone\web3-testing-app\
├── extensions/
│   └── testnet-wallet/
│       ├── manifest.json
│       ├── background.js (or similar)
│       ├── content.js (or similar)
│       └── ... (other extension files)
├── tests/
├── scripts/
└── ... (other project files)
```

---

## 🔧 Playwright Configuration

I'll create a special config that:
1. Loads the extension automatically
2. Grants necessary permissions
3. Injects your wallet credentials
4. Enables headless (or headed) testing

---

## ⚠️ Important Notes

1. **Keep Extension Updated:**
   - Extension stays in `extensions/testnet-wallet/`
   - Git-ignored for security
   - Update when testnet wallet updates

2. **Extension vs Credentials:**
   - Extension code: `extensions/testnet-wallet/`
   - Private key: `.env` file
   - Both needed for full automation

3. **Testnet Only:**
   - This extension is for testnet ONLY
   - Don't use with mainnet
   - No real funds at risk

---

## 🎯 Next Steps

1. **Copy the extension** using the commands above
2. **Tell me when it's done**
3. **I'll configure Playwright** to use it automatically
4. **Run automated tests** with full wallet access

Ready to copy your extension? Let me know when you've completed Step 1! 🚀

