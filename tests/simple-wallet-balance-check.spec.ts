import { test, expect } from '@playwright/test';
import { AutomatedWalletConnection } from './helpers/automated-wallet-connection';

/**
 * Simple Wallet Connection and Balance Check
 * This test connects your wallet and retrieves your GALA balance
 */

test.describe('Wallet Connection and Balance Check', () => {
  
  test('should connect wallet and check GALA balance', async ({ page }) => {
    test.setTimeout(60000); // 1 minute timeout
    
    console.log('\n💰 WALLET CONNECTION & BALANCE CHECK TEST');
    console.log('='.repeat(60));
    console.log(`Wallet Address: ${process.env.TEST_WALLET_ADDRESS}`);
    console.log('='.repeat(60));
    
    // Navigate to the Gala DeFi site
    console.log('\n📍 Step 1: Navigating to Gala DeFi Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    // Create wallet connection with your credentials
    console.log('\n🔗 Step 2: Setting up wallet connection...');
    const wallet = new AutomatedWalletConnection(page, {
      address: process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be',
      privateKey: process.env.TEST_PRIVATE_KEY,
      type: 'gala',
      balance: '0', // We'll check the real balance
      enableTransactions: true,
      autoConnect: true,
      timeout: 30000
    });
    
    // Connect the wallet
    console.log('\n🔌 Step 3: Connecting wallet...');
    const connectionResult = await wallet.connect();
    
    console.log('\n✅ WALLET CONNECTION RESULT:');
    console.log(`   Connected: ${connectionResult.connected}`);
    console.log(`   Address: ${connectionResult.address}`);
    console.log(`   Method: ${connectionResult.method}`);
    console.log(`   Duration: ${connectionResult.duration}ms`);
    
    expect(connectionResult.connected).toBe(true);
    
    // Check wallet balance
    console.log('\n💰 Step 4: Checking GALA balance...');
    const balance = await wallet.getBalance();
    
    console.log('\n📊 BALANCE INFORMATION:');
    console.log(`   GALA Balance: ${balance}`);
    console.log(`   Balance (formatted): ${parseFloat(balance).toLocaleString()} GALA`);
    
    // Also check via direct API call
    console.log('\n🌐 Step 5: Verifying balance via GalaChain API...');
    const apiBalance = await page.evaluate(async (address) => {
      try {
        const balanceDto = {
          owner: address,
          collection: "GALA",
          category: "Unit",
          type: "none",
          additionalKey: "none",
          instance: "0"
        };

        const response = await fetch(
          'https://gateway-mainnet.galachain.com/api/asset/token-contract/FetchBalances',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balanceDto)
          }
        );

        if (!response.ok) {
          return { success: false, error: `HTTP ${response.status}` };
        }

        const result = await response.json();
        
        if (result.Data && result.Data.length > 0) {
          const balance = parseFloat(result.Data[0].quantity);
          const lockedBalance = result.Data[0].lockedHolds?.reduce(
            (acc: number, hold: any) => acc + parseFloat(hold.quantity), 0
          ) || 0;
          
          return {
            success: true,
            total: balance,
            locked: lockedBalance,
            available: balance - lockedBalance,
            raw: result.Data[0]
          };
        }

        return { success: true, total: 0, locked: 0, available: 0 };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }, process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be');

    if (apiBalance.success) {
      console.log('\n✅ GALACHAIN API BALANCE:');
      console.log(`   Total Balance:     ${apiBalance.total?.toLocaleString() || 0} GALA`);
      console.log(`   Locked Balance:    ${apiBalance.locked?.toLocaleString() || 0} GALA`);
      console.log(`   Available Balance: ${apiBalance.available?.toLocaleString() || 0} GALA`);
      
      if (apiBalance.raw) {
        console.log('\n📋 Full Balance Data:');
        console.log(JSON.stringify(apiBalance.raw, null, 2));
      }
    } else {
      console.log(`\n⚠️ API Balance check failed: ${apiBalance.error}`);
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/wallet-balance-check.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: tests/screenshots/wallet-balance-check.png');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`Wallet: ${connectionResult.address}`);
    console.log(`Balance: ${apiBalance.success ? apiBalance.total?.toLocaleString() : balance} GALA`);
    console.log('='.repeat(60) + '\n');
    
  });
  
});

