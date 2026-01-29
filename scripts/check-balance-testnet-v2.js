const { chromium } = require('@playwright/test');
require('dotenv').config();

/**
 * Retrieve Gala Wallet Balance from TESTNET (v2)
 * Trying different API endpoints
 */

async function checkGalaBalanceTestnet() {
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 GALA WALLET BALANCE CHECKER (TESTNET v2)');
  console.log('='.repeat(50));
  console.log(`Wallet: ${walletAddress}`);
  console.log(`Network: TESTNET`);
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('about:blank');

    // Try multiple testnet endpoints
    const endpoints = [
      { name: 'Testnet Gateway v1', url: 'https://gateway-testnet.galachain.com/asset/token-contract/FetchBalances' },
      { name: 'Testnet Gateway v2', url: 'https://gateway-testnet.galachain.com/FetchBalances' },
      { name: 'Dev Gateway', url: 'https://gateway-dev.galachain.com/api/asset/token-contract/FetchBalances' },
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Trying: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      const result = await page.evaluate(async ({ url, address }) => {
        try {
          const balanceDto = {
            owner: address,
            collection: "GALA",
            category: "Unit",
            type: "none",
            additionalKey: "none",
            instance: "0"
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balanceDto)
          });

          const responseText = await response.text();
          let result;
          try {
            result = JSON.parse(responseText);
          } catch {
            result = responseText;
          }

          if (!response.ok) {
            return {
              success: false,
              status: response.status,
              statusText: response.statusText,
              response: result
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
              availableBalance: balance - lockedBalance,
              data: result.Data[0]
            };
          }

          return {
            success: false,
            message: 'No balance data in response',
            response: result
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }, { url: endpoint.url, address: walletAddress });

      if (result.success) {
        console.log('   ✅ SUCCESS!');
        console.log(`   💵 Total Balance:     ${result.balance?.toLocaleString() || 0} GALA`);
        console.log(`   🔒 Locked Balance:    ${result.lockedBalance?.toLocaleString() || 0} GALA`);
        console.log(`   ✨ Available Balance: ${result.availableBalance?.toLocaleString() || 0} GALA`);
        
        if (result.data) {
          console.log('\n📊 Full Balance Details:');
          console.log(JSON.stringify(result.data, null, 2));
        }
        
        await browser.close();
        return; // Exit on first success
      } else {
        console.log(`   ❌ Failed: ${result.status || result.error || result.message}`);
      }
    }

    // If we get here, all endpoints failed
    console.log('\n⚠️  All testnet endpoints failed.');
    console.log('\nℹ️  Your testnet wallet might be on a different network or you may need to:');
    console.log('   1. Check if your testnet tokens are on the correct GalaChain testnet');
    console.log('   2. Verify your wallet address is correct');
    console.log('   3. Contact Gala support for testnet access details');
    console.log(`\n📍 Your wallet: ${walletAddress}`);
    console.log('🔗 You can try checking at: https://testnet-explorer.galachain.com/');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await browser.close();
  }
}

checkGalaBalanceTestnet().catch(console.error);

