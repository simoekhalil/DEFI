# 🚀 Gala Launchpad Functionality Guide

## Overview
This document outlines the key functionality of the Gala Launchpad based on the provided documentation and spreadsheet analysis. This guide will serve as the foundation for comprehensive testing strategies.

## 🔢 Core Mathematical Components

### Bonding Curve Equation
- **Formula**: `v = a * s^(1 + b^-1)`
- **Variables**:
  - `v` = Price per token
  - `a` = Base price multiplier (1.6507E-05)
  - `s` = Current supply
  - `b` = Scaling factor (1.6507E-06)

### Key Parameters
- **Market Cap**: 164985
- **Base Price**: 1.6507E-05 (starting price when supply is at its lowest)
- **Scaling Factor**: 1.6507E-06 (controls price increase in bonding curve)

## 💰 Token Economics

### Buy/Sell Functions
1. **BuyWithExactTokens**: User specifies number of tokens to buy
   - Input: Number of tokens
   - Output: Cost in native currency + Number of tokens + Amount of native currency

2. **SellExactTokens**: User specifies number of tokens to sell
   - Input: Number of tokens
   - Output: Amount of native currency desired

3. **SellWithNative**: User specifies amount of native currency desired
   - Input: Amount of native currency desired
   - Output: Price you'll get

### Supply and Pricing Dynamics
- **Previous Supply Range**: 99999 - 9000000 tokens
- **Current Supply Range**: 1000000 - 10000000 tokens
- **Price Scaling**: Dramatic price increases as supply approaches maximum
- **Example**: At 9M supply, price jumps to 35586.8634 per token

## 🎯 Key Features to Test

### 1. Bonding Curve Mechanics
- **Price Calculation Accuracy**: Verify bonding curve formula implementation
- **Supply Impact**: Test how token supply affects pricing
- **Threshold Behavior**: Test dramatic price increases at high supply levels
- **Buy/Sell Parity**: Ensure buy and sell calculations are consistent

### 2. Diamond Hand Bonus System
- **Reverse Bonding Curve**: Activates to incentivize holding tokens
- **Fee Collection**: Increased fees for selling as token sale approaches end
- **Buying Pressure**: Collected fees create automatic buying pressure
- **Token Distribution**: Purchased tokens distributed to holders based on holdings
- **Dump Event Protection**: Stabilizes token price during significant sell-offs

### 3. Token Graduation Process
- **Completion Trigger**: When bonding curve reaches maximum supply
- **Fund Unlocking**: Funds released from Launchpad
- **DEX Integration**: New liquidity pool created on Gala DEX
- **Creator Incentives**: Substantial Gala token rewards (2x Pump Fun rates)
- **Standardization**: All graduated tokens have 1B supply and same starting price

### 4. Form Validation Requirements
- **Token Name**: 2-25 characters, alphanumeric only, no spaces
- **Token Symbol**: 1-8 characters, alphabets only, no numbers/spaces
- **Description**: 2-250 characters, alphanumeric + special characters allowed
- **Image Upload**: JPG/PNG formats, 4MB maximum file size

## 🧪 Testing Scenarios

### Critical Test Cases

#### 1. Bonding Curve Calculations
```typescript
// Test price calculation at different supply levels
const testSupplyLevels = [100000, 500000, 1000000, 5000000, 9000000];
// Verify price matches expected bonding curve formula
```

#### 2. Diamond Hand Bonus Activation
```typescript
// Test reverse bonding curve activation
// Verify fee collection mechanism
// Test token distribution to holders
// Validate dump event protection
```

#### 3. Token Graduation Flow
```typescript
// Test completion at maximum supply
// Verify fund unlocking
// Test DEX pool creation
// Validate creator incentive distribution
```

#### 4. Edge Cases
```typescript
// Test maximum supply scenarios
// Test minimum buy/sell amounts
// Test rapid succession of trades
// Test network interruption scenarios
```

## 📊 Test Data Requirements

### Sample Token Data
- **Valid Names**: "TestToken", "MyToken123", "GalaTest"
- **Valid Symbols**: "TEST", "GALA", "TKN"
- **Valid Descriptions**: "This is a test token for the Gala ecosystem"
- **Supply Scenarios**: Various levels from 100K to 10M tokens

### Price Calculation Test Cases
Based on the spreadsheet data:
- **Low Supply (100K)**: Expected price ~31.27
- **Medium Supply (1M)**: Expected price ~317.37
- **High Supply (5M)**: Expected price ~9348.46
- **Near Max (9M)**: Expected price ~35586.86

## 🔍 Validation Points

### Mathematical Accuracy
- Bonding curve formula implementation
- Price calculation precision
- Supply tracking accuracy
- Fee calculation correctness

### User Experience
- Form validation responsiveness
- Real-time price updates
- Transaction feedback
- Error handling

### Security Considerations
- Input sanitization
- Transaction validation
- Slippage protection
- Reentrancy protection

## 📝 Notes for Testing
1. **Precision**: There may be slight differences in values due to floating-point calculations
2. **Dynamic Updates**: Prices should update in real-time as supply changes
3. **Network Resilience**: Test behavior under network interruptions
4. **Gas Optimization**: Verify efficient gas usage for transactions
5. **Mobile Compatibility**: Ensure functionality works on mobile devices

## 🎯 Success Criteria
- All bonding curve calculations match expected mathematical model
- Diamond hand bonus activates and functions correctly
- Token graduation process completes successfully
- Form validation prevents invalid inputs
- Real-time updates work smoothly
- Creator incentives are distributed correctly
