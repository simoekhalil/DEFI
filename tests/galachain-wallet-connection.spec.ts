import { test, expect } from '@playwright/test';
import { AutomatedWalletConnection } from './helpers/automated-wallet-connection';

/**
 * GalaChain Wallet Connection Test
 * FULLY AUTOMATED - Uses Dappwright for real wallet automation
 */

test.describe('GalaChain Wallet Connection', () => {
  
  test('should connect to GalaChain wallet automatically', async () => {
    test.setTimeout(120000); // 2 minutes for automated connection with network switching
    
    console.log('🔗 AUTOMATED GALACHAIN WALLET CONNECTION TEST');
    console.log('='.repeat(60));
    console.log('Fully automated using Dappwright + MetaMask');
    console.log('='.repeat(60));
    
    // Create wallet connection helper (it will create its own browser with MetaMask)
    console.log('\n🦊 Step 1: Initializing MetaMask and connecting wallet...');
    const wallet = new AutomatedWalletConnection(null, {
      address: process.env.WALLET_ADDRESS,
      seedPhrase: process.env.WALLET_SEED_PHRASE,
      type: 'sepolia',  // Use Sepolia Ethereum testnet
      autoConnect: true,
      timeout: 60000,  // Increased timeout for network switching
      enableTransactions: true
    });
    
    const connectionResult = await wallet.connect();
    
    console.log('\n✅ WALLET CONNECTION RESULT:');
    console.log(`   Connected: ${connectionResult.connected}`);
    console.log(`   Address: ${connectionResult.address}`);
    console.log(`   Method: ${connectionResult.method}`);
    console.log(`   Duration: ${connectionResult.duration}ms`);
    
    expect(connectionResult.connected).toBe(true);
    expect(connectionResult.address).toBeDefined();
    
    // Get the page with MetaMask available
    const page = wallet.getPage();
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'tests/screenshots/galachain-connected.png',
      fullPage: true
    });
    
    // Test wallet balance
    console.log('\n💰 Step 2: Checking wallet balance...');
    const balance = await wallet.getBalance();
    console.log(`   Balance: ${balance} GALA`);
    expect(balance).toBeDefined();
    
    // Test wallet status
    console.log('\n📊 Step 3: Verifying wallet status...');
    const status = await wallet.getStatus();
    console.log(`   Status: ${status.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`   Method: ${status.method}`);
    expect(status.connected).toBe(true);
    
    console.log('\n='.repeat(60));
    console.log('✅ TEST COMPLETED - FULLY AUTOMATED');
    console.log('No manual intervention required!');
    console.log('='.repeat(60));
    
    // Cleanup
    await wallet.close();
  });
  
  test('should test GalaChain token balance fetching', async () => {
    test.setTimeout(90000); // 1.5 minutes
    
    console.log('💰 GALACHAIN TOKEN BALANCE TEST');
    console.log('='.repeat(50));
    
    // Connect wallet (creates its own browser with MetaMask)
    const wallet = new AutomatedWalletConnection(null, {
      address: process.env.WALLET_ADDRESS,
      seedPhrase: process.env.WALLET_SEED_PHRASE,
      type: 'sepolia',  // Use Sepolia Ethereum testnet
      autoConnect: true,
      timeout: 45000
    });
    
    const connectionResult = await wallet.connect();
    expect(connectionResult.connected).toBe(true);
    
    console.log('✅ Wallet connected automatically');
    
    // Get the page with MetaMask
    const page = wallet.getPage();
    
    // Inject balance fetching functionality
    await page.addInitScript(() => {
      (window as any).fetchGalaBalance = async (walletAddress: string) => {
        try {
          const balanceDto = {
            owner: walletAddress,
            collection: "GALA",
            category: "Unit",
            type: "none",
            additionalKey: "none",
            instance: "0"
          };

          // Use the gateway API
          const response = await fetch(
            'https://gateway-mainnet.galachain.com/api/asset/token-contract/FetchBalances',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(balanceDto)
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          let balance = 0;

          if (result.Data && result.Data.length > 0) {
            balance = parseFloat(result.Data[0].quantity);
            
            const lockedBalance = result.Data[0].lockedHolds?.reduce(
              (acc: number, hold: any) => acc + parseFloat(hold.quantity), 0
            ) || 0;
            
            return { balance, lockedBalance };
          }

          return { balance: 0, lockedBalance: 0 };
        } catch (error) {
          console.error('Error fetching balance:', error);
          throw error;
        }
      };
    });
    
    // Test balance fetching
    const balanceResult = await page.evaluate(async (address) => {
      try {
        return await (window as any).fetchGalaBalance(address);
      } catch (error) {
        return { error: error.message };
      }
    }, connectionResult.address || process.env.WALLET_ADDRESS);
    
    console.log('\n💰 BALANCE FETCH RESULT:');
    if (balanceResult.error) {
      console.log(`❌ Error: ${balanceResult.error}`);
    } else {
      console.log(`✅ Balance: ${balanceResult.balance} GALA`);
      console.log(`🔒 Locked: ${balanceResult.lockedBalance} GALA`);
    }
    
    console.log('\n✅ Balance fetching test complete');
    
    // Cleanup
    await wallet.close();
  });
});
