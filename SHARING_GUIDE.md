# 📤 Project Sharing Guide

## How to Share This Project with Another Person

### **Step 1: Share the Project Files**

You can share this project via:
- ✅ **GitHub/GitLab** (recommended) - Push to a private repository
- ✅ **ZIP file** - Compress and send (exclude `node_modules`)
- ✅ **Cloud storage** - Google Drive, Dropbox, etc.

**Files to EXCLUDE when sharing:**
```
node_modules/
.env
test-results/
playwright-report/
screenshots/
*.png
*.zip
```

**Files to INCLUDE:**
```
✅ All .ts and .js test files
✅ package.json and package-lock.json
✅ playwright*.config.ts files
✅ extensions/ folder (Gala wallet extension)
✅ All documentation (*.md files)
```

---

### **Step 2: What the Other Person Needs to Do**

#### **2.1. Install Node.js**
- Download from: https://nodejs.org/
- Version required: Node.js 18+ or 20+

#### **2.2. Install Dependencies**
```bash
cd web3-testing-app
npm install
```

#### **2.3. Install Playwright Browsers**
```bash
npx playwright install chromium
```

#### **2.4. Create `.env` File**
They need to create a `.env` file in the root directory with their own credentials:

```bash
# .env
TEST_WALLET_ADDRESS=their_gala_wallet_address
TEST_PRIVATE_KEY=their_private_key
WALLET_SEED_PHRASE=their twelve word seed phrase

BASE_URL=https://lpad-frontend-dev1.defi.gala.com
```

**⚠️ IMPORTANT:** 
- Never share your own `.env` file!
- Each person must use their own wallet credentials
- The `.env` file should never be committed to Git

---

### **Step 3: Running the Tests**

Once set up, they can run tests with:

```bash
# Run the Dappwright-based token creation test
npx playwright test tests/create-token-dappwright.spec.ts --headed

# Run all Gala Launchpad tests
npm run test:gala

# Run with the live site config
npx playwright test --config=playwright-live.config.ts
```

---

### **Step 4: Verifying Setup**

They should verify their setup works:

```bash
# 1. Check Node.js version
node --version

# 2. Check npm version
npm --version

# 3. Check if dependencies installed
npm list --depth=0

# 4. Verify Playwright is ready
npx playwright --version

# 5. Check if .env file exists and has values
# PowerShell:
Get-Content .env

# Linux/Mac:
cat .env
```

---

## **Project Structure Overview**

```
web3-testing-app/
├── tests/                          # All test files
│   ├── create-token-dappwright.spec.ts  # New Dappwright test
│   ├── helpers/                    # Helper classes
│   │   └── automated-wallet-connection.ts
│   └── ...
├── extensions/                     # Gala wallet extension
│   └── testnet-wallet/build/
├── playwright*.config.ts           # Playwright configurations
├── package.json                    # Dependencies
├── .env                           # ⚠️ DO NOT SHARE - credentials
└── README.md                      # Project documentation
```

---

## **Common Issues & Solutions**

### Issue 1: "Cannot find module"
**Solution:** Run `npm install` again

### Issue 2: "Extension not found"
**Solution:** Verify `extensions/testnet-wallet/build/` folder exists

### Issue 3: "TEST_PRIVATE_KEY is undefined"
**Solution:** Check `.env` file exists and has correct format

### Issue 4: "Browser not installed"
**Solution:** Run `npx playwright install chromium`

---

## **Security Reminders**

🔒 **NEVER share:**
- Your `.env` file
- Your private keys
- Your seed phrases
- Your wallet addresses (publicly)

✅ **DO share:**
- The code
- The extension folder
- Documentation
- Configuration files (without secrets)

---

## **Quick Start for the Recipient**

After receiving the project:

```bash
# 1. Extract/clone the project
cd web3-testing-app

# 2. Install everything
npm install
npx playwright install chromium

# 3. Create .env file with your credentials
# (Use .env.example as a template if provided)

# 4. Run a test
npx playwright test tests/create-token-dappwright.spec.ts --headed
```

---

## **Support**

If they have issues:
1. Check this guide first
2. Verify all prerequisites are installed
3. Ensure `.env` file is properly configured
4. Check `SETUP_INSTRUCTIONS.md` for detailed setup






