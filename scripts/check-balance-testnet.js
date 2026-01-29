const { chromium } = require('@playwright/test');
require('dotenv').config();

/**
 * Retrieve Gala Wallet Balance from TESTNET
 * Usage: node scripts/check-balance-testnet.js
 */

async function checkGalaBalanceTestnet() {
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 GALA WALLET BALANCE CHECKER (TESTNET)');
  console.log('='.repeat(50));
  console.log(`Wallet: ${walletAddress}`);
  console.log(`Network: TESTNET`);
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('about:blank');

    // Fetch balance using GalaChain TESTNET API
    const balanceResult = await page.evaluate(async (address) => {
      try {
        const balanceDto = {
          owner: address,
          collection: "GALA",
          category: "Unit",
          type: "none",
          additionalKey: "none",
          instance: "0"
        };

        // Use GalaChain TESTNET gateway
        console.log('📡 Querying GalaChain Testnet Gateway...');
        const response = await fetch(
          'https://gateway-testnet.galachain.com/api/asset/token-contract/FetchBalances',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balanceDto)
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            details: errorData
          };
        }

        const result = await response.json();
        console.log('Response received:', JSON.stringify(result, null, 2));
        
        if (result.Data && result.Data.length > 0) {
          const balance = parseFloat(result.Data[0].quantity);
          
          // Calculate locked balance
          const lockedBalance = result.Data[0].lockedHolds?.reduce(
            (acc, hold) => acc + parseFloat(hold.quantity), 0
          ) || 0;
          
          const availableBalance = balance - lockedBalance;
          
          return {
            success: true,
            balance,
            lockedBalance,
            availableBalance,
            data: result.Data[0]
          };
        }

        return {
          success: true,
          balance: 0,
          lockedBalance: 0,
          availableBalance: 0,
          message: 'No balance found (wallet might be empty or new)'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }, walletAddress);

    if (balanceResult.success) {
      console.log('\n✅ BALANCE RETRIEVED SUCCESSFULLY\n');
      console.log(`💵 Total Balance:     ${balanceResult.balance?.toLocaleString() || 0} GALA`);
      console.log(`🔒 Locked Balance:    ${balanceResult.lockedBalance?.toLocaleString() || 0} GALA`);
      console.log(`✨ Available Balance: ${balanceResult.availableBalance?.toLocaleString() || 0} GALA`);
      
      if (balanceResult.data) {
        console.log('\n📊 Full Balance Details:');
        console.log(JSON.stringify(balanceResult.data, null, 2));
      }
      
      if (balanceResult.message) {
        console.log(`\nℹ️  ${balanceResult.message}`);
      }
    } else {
      console.log('\n❌ FAILED TO RETRIEVE BALANCE');
      console.log(`Error: ${balanceResult.error}`);
      if (balanceResult.details) {
        console.log('\nError Details:');
        console.log(JSON.stringify(balanceResult.details, null, 2));
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🧪 Testnet balance check complete');
  console.log('='.repeat(50));
}

checkGalaBalanceTestnet().catch(console.error);

