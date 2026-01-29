const { chromium } = require('@playwright/test');
require('dotenv').config();

/**
 * Detailed Gala Wallet Balance Checker
 * Tests multiple address formats and APIs
 */

async function checkGalaBalanceDetailed() {
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 DETAILED GALA WALLET BALANCE CHECKER');
  console.log('='.repeat(60));
  console.log(`Original Wallet Address: ${walletAddress}`);
  console.log('='.repeat(60));

  // Try different address formats
  const addressFormats = [
    { name: 'Original (client|)', address: walletAddress },
    { name: 'With eth| prefix', address: walletAddress.replace('client|', 'eth|') },
    { name: 'Without prefix', address: walletAddress.split('|')[1] },
    { name: 'With client| prefix', address: `client|${walletAddress.split('|')[1]}` }
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('about:blank');

    for (const format of addressFormats) {
      console.log('\n' + '-'.repeat(60));
      console.log(`Testing format: ${format.name}`);
      console.log(`Address: ${format.address}`);
      console.log('-'.repeat(60));

      // Test with GalaChain mainnet gateway
      const result = await page.evaluate(async (testAddress) => {
        try {
          const balanceDto = {
            owner: testAddress,
            collection: "GALA",
            category: "Unit",
            type: "none",
            additionalKey: "none",
            instance: "0"
          };

          console.log('Request:', JSON.stringify(balanceDto, null, 2));

          const response = await fetch(
            'https://gateway-mainnet.galachain.com/api/asset/token-contract/FetchBalances',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(balanceDto)
            }
          );

          const result = await response.json();
          console.log('Response:', JSON.stringify(result, null, 2));

          if (!response.ok) {
            return {
              success: false,
              status: response.status,
              statusText: response.statusText,
              data: result
            };
          }

          if (result.Data && result.Data.length > 0) {
            const balance = parseFloat(result.Data[0].quantity);
            const lockedBalance = result.Data[0].lockedHolds?.reduce(
              (acc, hold) => acc + parseFloat(hold.quantity), 0
            ) || 0;
            
            return {
              success: true,
              balance,
              lockedBalance,
              available: balance - lockedBalance,
              fullData: result
            };
          }

          return {
            success: false,
            message: 'No balance data found',
            fullData: result
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }, format.address);

      if (result.success) {
        console.log('✅ SUCCESS!');
        console.log(`   Total Balance:     ${result.balance?.toLocaleString() || 0} GALA`);
        console.log(`   Locked Balance:    ${result.lockedBalance?.toLocaleString() || 0} GALA`);
        console.log(`   Available Balance: ${result.available?.toLocaleString() || 0} GALA`);
      } else {
        console.log('❌ FAILED');
        if (result.status) console.log(`   HTTP Status: ${result.status} ${result.statusText}`);
        if (result.error) console.log(`   Error: ${result.error}`);
        if (result.message) console.log(`   Message: ${result.message}`);
        if (result.data) console.log(`   Response Data:`, JSON.stringify(result.data, null, 2));
      }
    }

    // Also try the testnet gateway
    console.log('\n' + '='.repeat(60));
    console.log('TESTING TESTNET GATEWAY');
    console.log('='.repeat(60));

    const testnetResult = await page.evaluate(async (testAddress) => {
      try {
        const balanceDto = {
          owner: testAddress,
          collection: "GALA",
          category: "Unit",
          type: "none",
          additionalKey: "none",
          instance: "0"
        };

        const response = await fetch(
          'https://gateway-testnet.galachain.com/api/asset/token-contract/FetchBalances',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balanceDto)
          }
        );

        const result = await response.json();

        if (result.Data && result.Data.length > 0) {
          const balance = parseFloat(result.Data[0].quantity);
          const lockedBalance = result.Data[0].lockedHolds?.reduce(
            (acc, hold) => acc + parseFloat(hold.quantity), 0
          ) || 0;
          
          return {
            success: true,
            balance,
            lockedBalance,
            available: balance - lockedBalance
          };
        }

        return { success: false, message: 'No balance on testnet' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, walletAddress);

    if (testnetResult.success) {
      console.log('✅ TESTNET Balance Found!');
      console.log(`   Total Balance:     ${testnetResult.balance?.toLocaleString() || 0} GALA`);
      console.log(`   Locked Balance:    ${testnetResult.lockedBalance?.toLocaleString() || 0} GALA`);
      console.log(`   Available Balance: ${testnetResult.available?.toLocaleString() || 0} GALA`);
    } else {
      console.log('❌ No balance found on testnet');
      if (testnetResult.error) console.log(`   Error: ${testnetResult.error}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(60));
}

checkGalaBalanceDetailed().catch(console.error);

