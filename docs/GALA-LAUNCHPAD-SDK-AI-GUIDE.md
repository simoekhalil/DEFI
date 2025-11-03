# 🤖 Gala Launchpad SDK - AI Agent Integration Guide

> **Comprehensive guide for AI agents to understand, integrate, and build upon the Gala Launchpad SDK**

**Last Updated**: 2025-10-01
**Target Audience**: AI agents, MCP servers, automation tools, trading bots

---

## 📖 Table of Contents

1. [Quick Start for AI Agents](#quick-start-for-ai-agents)
2. [SDK Architecture Overview](#sdk-architecture-overview)
3. [Complete Method Catalog](#complete-method-catalog)
4. [Common AI Agent Workflows](#common-ai-agent-workflows)
5. [Type Reference for Code Generation](#type-reference-for-code-generation)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Best Practices for Agent Implementation](#best-practices-for-agent-implementation)
8. [Example MCP Tool Schemas](#example-mcp-tool-schemas)
9. [Environment Configuration](#environment-configuration)
10. [Testing and Validation](#testing-and-validation)

---

## Quick Start for AI Agents

### Minimal Setup (3 Lines)

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

const { sdk, validation } = await AgentConfig.quickSetup();
console.log(`Agent ready: ${validation.ready}`);
```

### What Just Happened?

1. **Auto-detected environment** from `NODE_ENV` or defaulted to `development`
2. **Created or imported wallet** from `process.env.PRIVATE_KEY` or generated new one
3. **Configured SDK** with appropriate timeouts and debug settings
4. **Validated setup** including balance checks and connectivity tests
5. **Ready for operations** with full error context if something failed

### Complete Setup with Options

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

const { sdk, wallet, config, validation } = await AgentConfig.quickSetup({
  environment: 'production',
  privateKey: process.env.TRADING_WALLET_KEY,
  timeout: 60000,
  debug: false,
  agentId: 'my-trading-bot-v1',
  autoValidate: true
});

// Check capabilities before proceeding
if (!validation.ready) {
  console.error('Setup issues:', validation.issues);
  process.exit(1);
}

if (!validation.capabilities.canTrade) {
  console.warn('Insufficient balance for trading:', validation.warnings);
}

// All good - start trading!
const pools = await sdk.fetchPools({ type: 'recent', limit: 10 });
```

---

## SDK Architecture Overview

### Service-Based Backend Alignment

The SDK internally uses 5 backend-aligned services (you don't interact with these directly):

1. **LaunchpadService** → `https://lpad-backend-{env}.defi.gala.com`
   - Pool management, trade history, comments, profiles

2. **GalaChainService** → `https://galachain-gateway-{env}.galachain.com`
   - Balances, transfers, blockchain operations

3. **DexService** → `https://dex-api-{env}.defi.gala.com`
   - Spot price queries

4. **BundleService** → `https://bundle-backend-{env}.defi.gala.com`
   - Token trading, transaction bundling

5. **WebSocketService** → `wss://bundle-backend-{env}.defi.gala.com`
   - Real-time transaction monitoring

### Flattened Public API

**You interact with a single SDK instance** that exposes all methods directly:

```typescript
// No child controllers - everything on sdk.*
sdk.fetchPools(...)           // Pool operations
sdk.buy(...)                  // Trading operations
sdk.fetchGalaBalance(...)     // Balance queries
sdk.postComment(...)          // Social features
sdk.transferGala(...)         // Token transfers
```

**This flattened design simplifies agent implementation** - no need to navigate controller hierarchies.

---

## Complete Method Catalog

### Category 1: Pool Management (8 methods)

#### `fetchPools(options?): Promise<PoolsResult>`

Fetch token pools with filtering and pagination.

**Options**:
```typescript
{
  type?: 'recent' | 'trending' | 'user',
  creatorAddress?: string,     // Filter by creator
  page?: number,               // Default: 1
  limit?: number               // Default: 20, max: 100
}
```

**Returns**:
```typescript
{
  pools: PoolData[],
  page: number,
  limit: number,
  total: number,
  totalPages: number,
  hasNext: boolean,
  hasPrevious: boolean
}
```

**Usage**:
```typescript
const recent = await sdk.fetchPools({ type: 'recent', limit: 10 });
console.log(`Found ${recent.total} pools, showing page ${recent.page}`);

for (const pool of recent.pools) {
  console.log(`${pool.tokenName}: ${pool.tokenSymbol} - $${pool.marketCap}`);
}
```

#### `fetchPoolDetails(tokenName: string): Promise<PoolDetailsData>`

Get detailed pool state directly from GalaChain bonding curve contract.

**Returns**:
```typescript
{
  basePrice: string,
  maxSupply: string,
  currentSupply: string,
  nativeTokenQuantity: string,
  reserveGala: string,
  saleStatus: 'ACTIVE' | 'FINALIZED' | 'CANCELLED',
  bondingCurveType: string,
  lastUpdated: Date
}
```

**Usage**:
```typescript
const details = await sdk.fetchPoolDetails('dragnrkti');
console.log(`Sale status: ${details.saleStatus}`);
console.log(`Current supply: ${details.currentSupply} / ${details.maxSupply}`);
console.log(`Reserve GALA: ${details.reserveGala}`);
```

#### `fetchTokenDistribution(tokenName: string): Promise<TokenDistributionResult>`

Get holder distribution and supply metrics.

**Returns**:
```typescript
{
  holders: Array<{
    address: string,
    balance: string,
    percentage: number
  }>,
  totalSupply: string,
  totalHolders: number,
  lastUpdated: Date
}
```

#### `fetchTokenBadges(tokenName: string): Promise<TokenBadgesResult>`

Get achievement badges for volume and engagement.

**Returns**:
```typescript
{
  volumeBadges: Array<{
    type: string,
    level: number,
    earned: boolean,
    threshold: string
  }>,
  engagementBadges: Array<{
    type: string,
    count: number,
    milestone: string
  }>
}
```

#### `fetchVolumeData(options): Promise<GraphDataResult>`

Get OHLCV (candlestick) data for charting.

**Options**:
```typescript
{
  tokenName: string,
  from?: Date,               // Default: 7 days ago
  to?: Date,                 // Default: now
  resolution?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'  // Default: '1h'
}
```

**Returns**:
```typescript
{
  dataPoints: Array<{
    timestamp: Date,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number
  }>
}
```

#### `isTokenNameAvailable(tokenName: string): Promise<boolean>`

Check if token name is available for creation.

**Usage**:
```typescript
const available = await sdk.isTokenNameAvailable('mynewtoken');
if (!available) {
  console.log('Name already taken');
}
```

#### `isTokenSymbolAvailable(symbol: string): Promise<boolean>`

Check if token symbol is available for creation.

#### `resolveVaultAddress(tokenName: string): Promise<string>`

Get the GalaChain vault address for a token (needed for some operations).

**Returns**: `"service|Token$Unit$SYMBOL$eth:address$launchpad"`

---

### Category 2: Trading Operations (6 methods)

#### `calculateBuyAmount(options): Promise<AmountCalculationResult>`

Calculate how many tokens you'll receive for a given GALA amount (or vice versa).

**Options**:
```typescript
{
  tokenName: string,
  amount: string,             // Standard decimal format (e.g., "1", "10.5")
  type: 'native' | 'token'    // 'native' = spending GALA, 'token' = buying exact tokens
}
```

**Returns**:
```typescript
{
  amount: string,                    // Calculated amount (opposite of input type)
  transactionFee: string,            // Platform fee in GALA
  reverseBondingCurveFee: string,    // RBC fee in GALA
  priceImpact: number,               // Percentage (e.g., 0.5 = 0.5%)
  effectivePrice: string             // Price per token after fees
}
```

**Usage**:
```typescript
// How many tokens for 10 GALA?
const quote = await sdk.calculateBuyAmount({
  tokenName: 'dragnrkti',
  amount: '10',  // 10 GALA
  type: 'native'
});

console.log(`You'll receive: ${quote.amount} DRAGNRKTI tokens`);
console.log(`Transaction fee: ${quote.transactionFee} GALA`);
console.log(`Price impact: ${quote.priceImpact}%`);
```

#### `calculateSellAmount(options): Promise<AmountCalculationResult>`

Calculate how much GALA you'll receive for selling tokens (or how many tokens needed for target GALA).

**Same interface as `calculateBuyAmount`**

#### `buy(options): Promise<TransactionResult>`

Execute a token purchase via GalaChain.

**Options**:
```typescript
{
  tokenName: string,
  amount: string,
  type: 'native' | 'token',
  expectedAmount: string,              // From calculateBuyAmount - REQUIRED
  slippageToleranceFactor: number      // Decimal format (0.05 = 5%) - REQUIRED
}
```

**Returns**:
```typescript
{
  transactionId: string,
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED',
  tokenName: string,
  amountIn: string,
  amountOut: string,
  timestamp: Date
}
```

**Usage**:
```typescript
// Step 1: Get quote
const quote = await sdk.calculateBuyAmount({
  tokenName: 'dragnrkti',
  amount: '5',  // 5 GALA
  type: 'native'
});

// Step 2: Execute trade with slippage protection
const result = await sdk.buy({
  tokenName: 'dragnrkti',
  amount: '5000000000000000000',
  type: 'native',
  expectedAmount: quote.amount,       // REQUIRED
  slippageToleranceFactor: 0.05       // 5% slippage - REQUIRED
});

console.log(`Transaction ID: ${result.transactionId}`);
console.log(`Status: ${result.status}`);
```

#### `sell(options): Promise<TransactionResult>`

Execute a token sale via GalaChain.

**Same interface as `buy()`**

#### `fetchTrades(options): Promise<TradesResult>`

Get trade history with filtering.

**Options**:
```typescript
{
  tokenName?: string,
  tradeType?: 'BUY' | 'SELL',
  userAddress?: string,
  page?: number,
  limit?: number,
  startDate?: Date,
  endDate?: Date,
  sortOrder?: 'ASC' | 'DESC'
}
```

**Returns**:
```typescript
{
  trades: Array<{
    id: string,
    tokenName: string,
    tradeType: 'BUY' | 'SELL',
    tokenAmount: string,
    galaAmount: string,
    userAddress: string,
    transactionId: string,
    createdAt: Date
  }>,
  page: number,
  total: number,
  hasNext: boolean
}
```

---

### Category 3: Balance & Portfolio (6 methods)

#### `fetchGalaBalance(walletAddress?: string): Promise<GalaBalanceInfo>`

Get GALA balance for a wallet (defaults to SDK wallet).

**Returns**:
```typescript
{
  userAddress: string,
  balance: string,           // Human-readable format (e.g., "100.5")
  quantity: string,          // Standard decimal format (e.g., "100.5")
  decimals: number,          // Always 18 for GALA
  lastUpdated: Date
}
```

**Usage**:
```typescript
const balance = await sdk.fetchGalaBalance();
console.log(`Balance: ${balance.balance} GALA`);
console.log(`Last updated: ${balance.lastUpdated.toISOString()}`);
```

#### `fetchTokenBalance(options): Promise<TokenBalanceInfo>`

Get launchpad token balance for a wallet.

**Options**:
```typescript
{
  tokenName?: string,          // For launchpad tokens
  tokenId?: string,            // For published GalaChain tokens
  walletAddress?: string       // Defaults to SDK wallet
}
```

**Returns**:
```typescript
{
  quantity: string,
  holdingPriceUsd: number,
  holdingPriceGala: string,
  isFinalized: boolean,
  lastUpdated: Date
}
```

#### `fetchTokensHeld(options): Promise<UserTokenListResult>`

Get all tokens held by a wallet.

**Options**:
```typescript
{
  address?: string,
  page?: number,
  limit?: number
}
```

**Returns**: Paginated list of held tokens with balances

#### `fetchTokensCreated(options): Promise<UserTokenListResult>`

Get all tokens created by a wallet.

#### `fetchProfile(walletAddress?: string): Promise<UserProfile>`

Get user profile data.

**Returns**:
```typescript
{
  fullName: string | null,
  profileImage: string | null,
  walletAddress: string,
  createdAt: Date,
  tradeCount: number,
  tokensCreated: number
}
```

#### `transferFaucets(options): Promise<TransferFaucetsData>`

Request testnet GALA from faucet (development only).

---

### Category 4: Token Creation (3 methods)

#### `launchToken(data): Promise<TokenLaunchResult>`

Create a new token on the launchpad.

**Data**:
```typescript
{
  tokenName: string,          // 2-20 chars, alphanumeric + dash/underscore
  tokenSymbol: string,        // 2-10 chars, uppercase alphanumeric
  description: string,
  imageUrl: string,
  totalSupply: string,        // Standard decimal format
  reserveGala: string,        // Initial GALA reserve for bonding curve
  bondingCurveType: 'LINEAR' | 'EXPONENTIAL',
  reverseBondingCurve: {
    enabled: boolean,
    feePercentage?: number,
    reservePercentage?: number
  }
}
```

**Usage**:
```typescript
const result = await sdk.launchToken({
  tokenName: 'mynewtoken',
  tokenSymbol: 'MNT',
  description: 'My amazing token',
  imageUrl: 'https://example.com/image.png',
  totalSupply: '1000000000000000000000000',  // 1M tokens
  reserveGala: '100000000000000000000',      // 100 GALA reserve
  bondingCurveType: 'LINEAR',
  reverseBondingCurve: {
    enabled: true,
    feePercentage: 5,
    reservePercentage: 10
  }
});

console.log(`Token created: ${result.transactionId}`);
```

#### `uploadImageByTokenName(options): Promise<ImageUploadResult>`

Upload token image (Node.js only).

**Options**:
```typescript
{
  tokenName: string,
  imagePath: string,          // Absolute file path
  imageBuffer?: Buffer,       // Alternative to imagePath
  filename?: string
}
```

#### `updateProfile(data): Promise<ProfileUpdateResult>`

Update user profile.

---

### Category 5: Comments & Social (2 methods)

#### `postComment(options): Promise<CommentResult>`

Post a comment on a token pool.

**Options**:
```typescript
{
  tokenName: string,
  content: string             // Max 500 chars
}
```

**Returns**:
```typescript
{
  id: string,
  tokenName: string,
  content: string,
  userAddress: string,
  createdAt: Date
}
```

#### `fetchComments(options): Promise<CommentsResult>`

Get comments for a token pool.

**Options**:
```typescript
{
  tokenName: string,
  page?: number,
  limit?: number
}
```

---

### Category 6: Token Transfers (2 methods)

#### `transferGala(options): Promise<TransferResult>`

Transfer GALA tokens to another wallet via GalaChain.

**Options**:
```typescript
{
  recipientAddress: string,      // Supports 0x... or eth|... format
  amount: string,                 // Standard decimal format
  uniqueKey?: string              // Optional idempotency key (must start with galaconnect-operation-)
}
```

**Usage**:
```typescript
const result = await sdk.transferGala({
  recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  amount: '1',  // 1 GALA
  uniqueKey: 'galaconnect-operation-my-transfer-123'
});

console.log(`Transfer ID: ${result.transactionId}`);
```

#### `transferToken(options): Promise<TransferResult>`

Transfer launchpad tokens to another wallet via GalaChain.

**Options**:
```typescript
{
  to: string,
  tokenName: string,
  amount: string,
  uniqueKey?: string
}
```

---

### Category 7: Utilities (4 methods)

#### `getAddress(): string`

Get the SDK wallet address in backend format (`eth|...`).

#### `getEthereumAddress(): string`

Get the SDK wallet address in Ethereum format (`0x...`).

#### `cleanup(): void`

Cleanup resources (close WebSocket connections, clear timers).

**Always call this before exiting your agent!**

```typescript
process.on('SIGINT', () => {
  sdk.cleanup();
  process.exit(0);
});
```

---

## Common AI Agent Workflows

### Workflow 1: Trading Bot

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

// Setup
const { sdk } = await AgentConfig.quickSetup({
  environment: 'production',
  agentId: 'trading-bot',
  autoValidate: true
});

// Monitor pools for opportunities
const pools = await sdk.fetchPools({ type: 'trending', limit: 50 });

for (const pool of pools.pools) {
  // Get current price
  const quote = await sdk.calculateBuyAmount({
    tokenName: pool.tokenName,
    amount: '1',  // 1 GALA
    type: 'native'
  });

  // Check price impact
  if (quote.priceImpact < 2.0) {  // Less than 2% impact
    console.log(`Good opportunity: ${pool.tokenName}`);

    // Execute trade
    const result = await sdk.buy({
      tokenName: pool.tokenName,
      amount: '1',
      type: 'native',
      expectedAmount: quote.amount,
      slippageToleranceFactor: 0.05
    });

    console.log(`Bought: ${result.transactionId}`);
  }
}

// Cleanup
sdk.cleanup();
```

### Workflow 2: Portfolio Monitor

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

const { sdk } = await AgentConfig.quickSetup();

// Check GALA balance
const galaBalance = await sdk.fetchGalaBalance();
console.log(`GALA: ${galaBalance.balance}`);

// Get all held tokens
const held = await sdk.fetchTokensHeld({
  address: sdk.getAddress(),
  limit: 100
});

console.log(`Holding ${held.tokens.length} tokens:`);

for (const token of held.tokens) {
  const balance = await sdk.fetchTokenBalance({
    tokenName: token.tokenName,
    walletAddress: sdk.getAddress()
  });

  console.log(`${token.tokenName}: ${balance.quantity} tokens = $${balance.holdingPriceUsd}`);
}

sdk.cleanup();
```

### Workflow 3: Token Creator Agent

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

const { sdk, validation } = await AgentConfig.quickSetup();

// Check if we have enough GALA
if (!validation.capabilities.canCreateTokens) {
  console.error('Need at least 100 GALA to create tokens');
  process.exit(1);
}

// Check name availability
const available = await sdk.isTokenNameAvailable('mytoken');
if (!available) {
  console.error('Name already taken');
  process.exit(1);
}

// Upload image first
const imageResult = await sdk.uploadImageByTokenName({
  tokenName: 'mytoken',
  imagePath: '/path/to/image.png'
});

// Create token
const result = await sdk.launchToken({
  tokenName: 'mytoken',
  tokenSymbol: 'MTK',
  description: 'Agent-created token',
  imageUrl: imageResult.imageUrl,
  totalSupply: '1000000000000000000000000',
  reserveGala: '100000000000000000000',
  bondingCurveType: 'LINEAR',
  reverseBondingCurve: { enabled: true, feePercentage: 5 }
});

console.log(`Token created: ${result.transactionId}`);
sdk.cleanup();
```

### Workflow 4: Multi-Wallet Management

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

// Setup multiple wallets for different purposes
const sdks = await AgentConfig.multiWalletSetup({
  trader: process.env.TRADER_WALLET,
  creator: process.env.CREATOR_WALLET,
  monitor: 'generate'  // Read-only operations
}, 'production');

// Use trader wallet for trading
const tradeResult = await sdks.trader.buy({
  tokenName: 'dragnrkti',
  amount: '5000000000000000000',
  type: 'native',
  expectedAmount: '...',
  slippageToleranceFactor: 0.05
});

// Use creator wallet for token creation
const createResult = await sdks.creator.launchToken({
  tokenName: 'newtoken',
  tokenSymbol: 'NEW',
  // ... rest of data
});

// Use monitor wallet for read-only operations (no balance needed)
const pools = await sdks.monitor.fetchPools({ type: 'recent' });

// Cleanup all
Object.values(sdks).forEach(sdk => sdk.cleanup());
```

---

## Type Reference for Code Generation

### Key Types to Know

```typescript
// Pool data structure
interface PoolData {
  tokenName: string;
  tokenSymbol: string;
  description: string;
  imageUrl: string;
  creator: string;
  createdAt: Date;
  marketCap: number;
  totalSupply: string;
  currentSupply: string;
  bondingCurveType: 'LINEAR' | 'EXPONENTIAL';
}

// Clean result types with pagination
interface PoolsResult {
  pools: PoolData[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Amount calculation results
interface AmountCalculationResult {
  amount: string;
  transactionFee: string;
  reverseBondingCurveFee: string;
  priceImpact: number;
  effectivePrice: string;
}

// Transaction results
interface TransactionResult {
  transactionId: string;
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  tokenName: string;
  amountIn: string;
  amountOut: string;
  timestamp: Date;
}

// Balance info
interface GalaBalanceInfo {
  userAddress: string;
  balance: string;
  quantity: string;
  decimals: number;
  lastUpdated: Date;
}

interface TokenBalanceInfo {
  quantity: string;
  holdingPriceUsd: number;
  holdingPriceGala: string;
  isFinalized: boolean;
  lastUpdated: Date;
}

// Options patterns (all multi-param methods use this)
interface FetchPoolsOptions {
  type?: 'recent' | 'trending' | 'user';
  creatorAddress?: string;
  page?: number;
  limit?: number;
}

interface BuyTokenOptions {
  tokenName: string;
  amount: string;
  type: 'native' | 'token';
  expectedAmount: string;
  slippageToleranceFactor: number;
}

// Error types
class ValidationError extends Error {
  field: string;
  constraint: string;
}

class TransactionFailedError extends Error {
  transactionId: string;
  reason: string;
}
```

---

## Error Handling Patterns

### Validation Errors

```typescript
import { ValidationError } from '@gala-chain/launchpad-sdk';

try {
  await sdk.buy({
    tokenName: 'invalid!name',  // Invalid characters
    amount: 'not-a-number',     // Invalid format
    type: 'native',
    expectedAmount: '...',
    slippageToleranceFactor: 0.05
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed: ${error.field} - ${error.constraint}`);
    // Handle validation error
  }
}
```

### Transaction Errors

```typescript
import { TransactionFailedError } from '@gala-chain/launchpad-sdk';

try {
  const result = await sdk.buy({ /* options */ });
  console.log(`Success: ${result.transactionId}`);
} catch (error) {
  if (error instanceof TransactionFailedError) {
    console.error(`Transaction ${error.transactionId} failed: ${error.reason}`);
    // Handle transaction failure
  }
}
```

### Network Errors

```typescript
try {
  const pools = await sdk.fetchPools({ type: 'recent' });
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Backend unreachable');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('Request timeout');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Setup Validation

```typescript
const { sdk, validation } = await AgentConfig.quickSetup();

if (!validation.ready) {
  console.error('Setup failed:');
  validation.issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

if (validation.warnings.length > 0) {
  console.warn('Setup warnings:');
  validation.warnings.forEach(warn => console.warn(`- ${warn}`));
}
```

---

## Best Practices for Agent Implementation

### 1. Always Use AgentConfig

```typescript
// ❌ Bad - manual setup
import { LaunchpadSDK } from '@gala-chain/launchpad-sdk';
import { Wallet } from 'ethers';
const wallet = new Wallet(process.env.PRIVATE_KEY);
const sdk = new LaunchpadSDK({ wallet, baseUrl: '...' });

// ✅ Good - AgentConfig handles everything
import { AgentConfig } from '@gala-chain/launchpad-sdk';
const { sdk } = await AgentConfig.quickSetup();
```

### 2. Validate Before Operating

```typescript
const { sdk, validation } = await AgentConfig.quickSetup({
  autoValidate: true
});

// Check specific capabilities
if (!validation.capabilities.canTrade) {
  console.error('Insufficient balance for trading');
  process.exit(1);
}
```

### 3. Always Calculate Before Trading

```typescript
// ❌ Bad - trading blindly
await sdk.buy({
  tokenName: 'dragnrkti',
  amount: '5000000000000000000',
  type: 'native',
  expectedAmount: '???',  // What should this be?
  slippageToleranceFactor: 0.05
});

// ✅ Good - calculate first
const quote = await sdk.calculateBuyAmount({
  tokenName: 'dragnrkti',
  amount: '5000000000000000000',
  type: 'native'
});

// Check quote before executing
if (quote.priceImpact > 5.0) {
  console.warn('High price impact, skipping trade');
  return;
}

await sdk.buy({
  tokenName: 'dragnrkti',
  amount: '5000000000000000000',
  type: 'native',
  expectedAmount: quote.amount,
  slippageToleranceFactor: 0.05
});
```

### 4. Use Slippage Protection

```typescript
// ❌ Bad - no slippage protection
slippageToleranceFactor: 0  // Will fail if price moves

// ✅ Good - reasonable slippage
slippageToleranceFactor: 0.05  // 5% tolerance for normal volatility
slippageToleranceFactor: 0.10  // 10% for high volatility

// ✅ Good - calculate dynamically based on liquidity
const quote = await sdk.calculateBuyAmount({ /* ... */ });
const slippage = quote.priceImpact < 1.0 ? 0.02 : 0.05;
```

### 5. Handle Rate Limits

```typescript
// Implement exponential backoff for rate limits
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {  // Rate limited
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const pools = await retryWithBackoff(() =>
  sdk.fetchPools({ type: 'recent' })
);
```

### 6. Clean Up Resources

```typescript
// Always cleanup before exiting
process.on('SIGINT', () => {
  console.log('Shutting down agent...');
  sdk.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  sdk.cleanup();
  process.exit(0);
});

// Or use try/finally
try {
  // Agent operations
  await runTradingStrategy(sdk);
} finally {
  sdk.cleanup();
}
```

### 7. Environment-Specific Configuration

```typescript
// Development - longer timeouts, debug enabled
const { sdk: devSdk } = await AgentConfig.quickSetup({
  environment: 'development',
  timeout: 60000,
  debug: true
});

// Production - optimized settings
const { sdk: prodSdk } = await AgentConfig.quickSetup({
  environment: 'production',
  timeout: 30000,
  debug: false,
  agentId: 'production-bot-v1'
});
```

### 8. Secure Wallet Management

```typescript
// ❌ Bad - hardcoded keys
const { sdk } = await AgentConfig.quickSetup({
  privateKey: '0x1234567890abcdef...'
});

// ✅ Good - environment variables
const { sdk } = await AgentConfig.quickSetup({
  privateKey: process.env.PRIVATE_KEY  // From .env file
});

// ✅ Good - multi-wallet with different permissions
const sdks = await AgentConfig.multiWalletSetup({
  trading: process.env.TRADING_WALLET,      // Low balance, frequent use
  creation: process.env.CREATION_WALLET,    // High balance, rare use
  monitoring: 'generate'                     // No balance needed
}, 'production');
```

---

## Example MCP Tool Schemas

### Tool 1: Fetch Pools

```json
{
  "name": "gala_launchpad_fetch_pools",
  "description": "Fetch token pools from Gala Launchpad with filtering and pagination",
  "inputSchema": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["recent", "trending", "user"],
        "description": "Type of pools to fetch"
      },
      "creatorAddress": {
        "type": "string",
        "pattern": "^(0x[a-fA-F0-9]{40}|eth\\|[a-fA-F0-9]{40})$",
        "description": "Filter by creator address (optional)"
      },
      "page": {
        "type": "number",
        "minimum": 1,
        "description": "Page number (default: 1)"
      },
      "limit": {
        "type": "number",
        "minimum": 1,
        "maximum": 100,
        "description": "Results per page (default: 20)"
      }
    }
  }
}
```

### Tool 2: Calculate Buy Amount

```json
{
  "name": "gala_launchpad_calculate_buy",
  "description": "Calculate token amounts for buying with slippage and fee breakdown",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tokenName": {
        "type": "string",
        "pattern": "^[a-z0-9_-]{2,20}$",
        "description": "Token name"
      },
      "amount": {
        "type": "string",
        "pattern": "^[0-9]+$",
        "description": "Amount in standard decimal format (e.g., '1' for 1 GALA)"
      },
      "type": {
        "type": "string",
        "enum": ["native", "token"],
        "description": "native = spending GALA, token = buying exact tokens"
      }
    },
    "required": ["tokenName", "amount", "type"]
  }
}
```

### Tool 3: Execute Buy

```json
{
  "name": "gala_launchpad_buy_tokens",
  "description": "Execute token purchase on Gala Launchpad with slippage protection",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tokenName": {
        "type": "string",
        "pattern": "^[a-z0-9_-]{2,20}$"
      },
      "amount": {
        "type": "string",
        "pattern": "^[0-9]+$"
      },
      "type": {
        "type": "string",
        "enum": ["native", "token"]
      },
      "expectedAmount": {
        "type": "string",
        "pattern": "^[0-9]+$",
        "description": "Expected output from calculateBuyAmount"
      },
      "slippageToleranceFactor": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Decimal format (0.05 = 5% slippage)"
      }
    },
    "required": ["tokenName", "amount", "type", "expectedAmount", "slippageToleranceFactor"]
  }
}
```

### Tool 4: Fetch Balance

```json
{
  "name": "gala_launchpad_fetch_gala_balance",
  "description": "Get GALA balance for a wallet address",
  "inputSchema": {
    "type": "object",
    "properties": {
      "walletAddress": {
        "type": "string",
        "pattern": "^(0x[a-fA-F0-9]{40}|eth\\|[a-fA-F0-9]{40})$",
        "description": "Wallet address (optional, defaults to SDK wallet)"
      }
    }
  }
}
```

### Tool 5: Post Comment

```json
{
  "name": "gala_launchpad_post_comment",
  "description": "Post a comment on a token pool",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tokenName": {
        "type": "string",
        "pattern": "^[a-z0-9_-]{2,20}$"
      },
      "content": {
        "type": "string",
        "maxLength": 500,
        "description": "Comment content (max 500 chars)"
      }
    },
    "required": ["tokenName", "content"]
  }
}
```

**See [MCP-TOOL-SPECIFICATION.md](./MCP-TOOL-SPECIFICATION.md) for complete tool catalog.**

---

## Environment Configuration

### Development Environment

```typescript
const { sdk } = await AgentConfig.quickSetup({
  environment: 'development',
  debug: true,
  timeout: 60000
});

// URLs used:
// - Launchpad: https://lpad-backend-dev1.defi.gala.com
// - GalaChain: https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com
// - Bundle: https://bundle-backend-dev1.defi.gala.com
```

### Production Environment

```typescript
const { sdk } = await AgentConfig.quickSetup({
  environment: 'production',
  debug: false,
  timeout: 30000,
  privateKey: process.env.PRODUCTION_WALLET
});

// URLs used:
// - Launchpad: https://lpad-backend-prod1.defi.gala.com
// - GalaChain: https://galachain-gateway-chain-platform-prod-chain-platform-eks.prod.galachain.com
// - Bundle: https://bundle-backend-prod1.defi.gala.com
```

### Custom Environment

```typescript
const { sdk } = await AgentConfig.quickSetup({
  environment: 'development',
  baseUrl: 'https://custom-backend.example.com',
  timeout: 45000
});
```

---

## Testing and Validation

### Unit Test Example

```typescript
import { AgentConfig } from '@gala-chain/launchpad-sdk';

describe('Trading Agent', () => {
  let sdk;

  beforeAll(async () => {
    const result = await AgentConfig.quickSetup({
      environment: 'testing',
      autoValidate: true
    });
    sdk = result.sdk;
  });

  afterAll(() => {
    sdk.cleanup();
  });

  test('should fetch pools', async () => {
    const result = await sdk.fetchPools({ type: 'recent', limit: 10 });
    expect(result.pools).toHaveLength(10);
    expect(result.hasNext).toBeDefined();
  });

  test('should calculate buy amount', async () => {
    const quote = await sdk.calculateBuyAmount({
      tokenName: 'testtoken',
      amount: '1',
      type: 'native'
    });

    expect(quote.amount).toBeDefined();
    expect(quote.transactionFee).toBeDefined();
    expect(quote.priceImpact).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Test Example

```typescript
test('complete trading flow', async () => {
  const { sdk, validation } = await AgentConfig.quickSetup({
    environment: 'testing'
  });

  // Verify setup
  expect(validation.ready).toBe(true);
  expect(validation.capabilities.canTrade).toBe(true);

  // Get quote
  const quote = await sdk.calculateBuyAmount({
    tokenName: 'testtoken',
    amount: '1000000000000000000',
    type: 'native'
  });

  expect(quote.amount).toBeTruthy();

  // Execute trade
  const result = await sdk.buy({
    tokenName: 'testtoken',
    amount: '1000000000000000000',
    type: 'native',
    expectedAmount: quote.amount,
    slippageToleranceFactor: 0.05
  });

  expect(result.transactionId).toBeTruthy();
  expect(result.status).toBe('PENDING');

  sdk.cleanup();
});
```

---

## Next Steps

1. **Read [MCP-TOOL-SPECIFICATION.md](./MCP-TOOL-SPECIFICATION.md)** for complete MCP server blueprint
2. **Explore [agent-examples/](./agent-examples/)** for working code samples
3. **Review [SDK Method Graph](../CURRENT-METHOD-GRAPH.md)** for endpoint mapping
4. **Check [Service Architecture Guide](./SERVICE_ARCHITECTURE_MIGRATION.md)** for internal architecture

---

## Support & Resources

- **SDK Documentation**: [README.md](../README.md)
- **API Reference**: [API.md](../../../API.md)
- **GitHub Issues**: [Report bugs](https://gitlab.com/gala-games/defi/launchpad/sdk/-/issues)
- **Package**: [@gala-chain/launchpad-sdk](https://www.npmjs.com/package/@gala-chain/launchpad-sdk)

---

**Built with ❤️ for AI agents and automation tools**

*Last updated: 2025-10-01*