# Environment Variables Template

Copy these values to your `.env` file (create one if it doesn't exist).

```env
# ===================================
# WALLET CONFIGURATION (REQUIRED)
# ===================================

# Wallet seed phrase for automated testing (12 or 24 words)
# This is used by Dappwright to automate wallet connections
WALLET_SEED_PHRASE="your twelve word seed phrase goes here for testing purposes only"

# Wallet address (optional - can be derived from seed phrase)
WALLET_ADDRESS="client|618ae395c1c653111d3315be"

# Private key (optional - alternative to seed phrase)
# WALLET_PRIVATE_KEY="0x..."

# ===================================
# NETWORK CONFIGURATION
# ===================================

# GalaChain RPC endpoint
GALACHAIN_RPC="https://rpc.galachain.com"

# GalaChain Chain ID
GALACHAIN_CHAIN_ID="12345"

# Test environment (testnet, mainnet, dev)
TEST_ENVIRONMENT="dev"

# Test site URL (default is dev environment)
TEST_SITE_URL="https://lpad-frontend-dev1.defi.gala.com"

# ===================================
# CI/CD CONFIGURATION
# ===================================

# Set to true when running in CI environment
CI=false

# Node environment
NODE_ENV="development"

# ===================================
# JIRA INTEGRATION (OPTIONAL)
# ===================================

# JIRA configuration for automated ticket creation
JIRA_HOST="your-domain.atlassian.net"
JIRA_USERNAME="your-email@example.com"
JIRA_API_TOKEN="your-api-token"
JIRA_PROJECT_KEY="YOUR-PROJECT"
```

## 🔐 Security Warnings

**IMPORTANT**: 
1. ⚠️ **NEVER commit your .env file to version control**
2. ⚠️ **Use a TEST WALLET ONLY** - never use your main wallet
3. ⚠️ **Keep minimal funds** in your test wallet (only what's needed for testing)
4. ⚠️ **Rotate credentials regularly** (change seed phrase every few months)
5. ⚠️ **Use environment-specific seed phrases** (different for testnet vs mainnet)
6. ⚠️ **Store production credentials in secure vaults** (GitHub Secrets, AWS Secrets Manager, etc.)

## 📋 Setup Steps

1. Create `.env` file in project root:
   ```bash
   touch .env
   ```

2. Copy the template above into your `.env` file

3. Replace `WALLET_SEED_PHRASE` with your **test wallet's** 12 or 24 word seed phrase

4. Replace `WALLET_ADDRESS` with your test wallet's address (optional but recommended)

5. Verify `.env` is in `.gitignore`:
   ```bash
   grep ".env" .gitignore
   ```

6. Test the configuration:
   ```bash
   npm run test:headed
   ```

## 🧪 For CI/CD

In your CI/CD platform (GitHub Actions, GitLab CI, etc.), set these as **encrypted secrets**:

### GitHub Actions
```yaml
env:
  WALLET_SEED_PHRASE: ${{ secrets.TEST_WALLET_SEED }}
  WALLET_ADDRESS: ${{ secrets.TEST_WALLET_ADDRESS }}
```

### GitLab CI
```yaml
variables:
  WALLET_SEED_PHRASE: $TEST_WALLET_SEED
  WALLET_ADDRESS: $TEST_WALLET_ADDRESS
```

### Jenkins
```groovy
withCredentials([
  string(credentialsId: 'test-wallet-seed', variable: 'WALLET_SEED_PHRASE'),
  string(credentialsId: 'test-wallet-address', variable: 'WALLET_ADDRESS')
]) {
  sh 'npm test'
}
```

## ✅ Verification

After setup, run this to verify:

```bash
# Check environment variables are loaded
node -e "require('dotenv').config(); console.log('WALLET_SEED_PHRASE:', process.env.WALLET_SEED_PHRASE ? '✅ Set' : '❌ Missing')"

# Run a simple test
npm run test:headed tests/simple-wallet-balance-check.spec.ts
```

If everything is configured correctly, you should see:
- ✅ Wallet connecting automatically
- ✅ No manual intervention prompts
- ✅ Tests running and passing






