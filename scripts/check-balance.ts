import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Retrieve Gala Wallet Balance
 * Usage: npx ts-node scripts/check-balance.ts
 */

async function checkGalaBalance() {
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 GALA WALLET BALANCE CHECKER');
  console.log('='.repeat(50));
  console.log(`Wallet: ${walletAddress}`);
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to any page (we just need the API)
    await page.goto('about:blank');

    // Fetch balance using GalaChain API
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

        // Use GalaChain mainnet gateway
        const response = await fetch(
          'https://gateway-mainnet.galachain.com/api/asset/token-contract/FetchBalances',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balanceDto)
          }
        );

        if (!response.ok) {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }

        const result = await response.json();
        
        if (result.Data && result.Data.length > 0) {
          const balance = parseFloat(result.Data[0].quantity);
          
          // Calculate locked balance
          const lockedBalance = result.Data[0].lockedHolds?.reduce(
            (acc: number, hold: any) => acc + parseFloat(hold.quantity), 0
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
          message: 'No balance found'
        };
      } catch (error: any) {
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
    } else {
      console.log('\n❌ FAILED TO RETRIEVE BALANCE');
      console.log(`Error: ${balanceResult.error}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await browser.close();
  }
}

// Run the balance check
checkGalaBalance().catch(console.error);

