import { test, expect } from '@playwright/test';
import { AutomatedWalletConnection } from './helpers/automated-wallet-connection';

/**
 * Testnet Wallet Extension Balance Check
 * FULLY AUTOMATED - Uses Dappwright for wallet automation
 */

test.describe('Testnet Extension Wallet Balance', () => {
  
  test('should connect via automated wallet extension and display balance', async ({ page }) => {
    test.setTimeout(60000); // 1 minute for automated connection
    
    console.log('\n💰 AUTOMATED TESTNET WALLET BALANCE CHECK');
    console.log('='.repeat(70));
    console.log('Fully automated wallet connection using Dappwright');
    console.log('='.repeat(70));
    console.log(`\n📋 Wallet: ${process.env.WALLET_ADDRESS}`);
    console.log('🌐 Network: Testnet/Dev');
    console.log('='.repeat(70));
    
    // Navigate to the testnet site
    console.log('\n📍 Step 1: Loading Gala DeFi Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    await page.screenshot({ 
      path: 'tests/screenshots/testnet-initial.png',
      fullPage: true 
    });
    
    // Automated wallet connection using Dappwright
    console.log('\n🔗 Step 2: Connecting wallet automatically...');
    const wallet = new AutomatedWalletConnection(page, {
      address: process.env.WALLET_ADDRESS,
      seedPhrase: process.env.WALLET_SEED_PHRASE,
      type: 'metamask',
      autoConnect: true,
      timeout: 30000,
      enableTransactions: false
    });
    
    const connectionResult = await wallet.connect();
    
    console.log('\n✅ WALLET CONNECTION RESULT:');
    console.log(`   Connected: ${connectionResult.connected}`);
    console.log(`   Address: ${connectionResult.address}`);
    console.log(`   Method: ${connectionResult.method}`);
    console.log(`   Duration: ${connectionResult.duration}ms`);
    
    expect(connectionResult.connected).toBe(true);
    
    await page.waitForTimeout(3000); // Wait for balance to load
    
    await page.screenshot({ 
      path: 'tests/screenshots/testnet-connected.png',
      fullPage: true 
    });
    
    // Check wallet balance
    console.log('\n💰 Step 3: Reading balance...');
    const balance = await wallet.getBalance();
    
    console.log(`\n💵 GALA Balance: ${balance}`);
    expect(balance).toBeDefined();
    
    // Extract additional balance info from page
    const balanceInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const results = {
        balances: [] as string[],
        walletAddress: null as string | null,
      };
      
      // Look for GALA balance patterns
      const galaPatterns = [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*GALA/gi,
        /GALA.*?(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /balance[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)\s*GALA/gi
      ];
      
      for (const pattern of galaPatterns) {
        const matches = bodyText.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            results.balances.push(match[1]);
          }
        }
      }
      
      // Look for wallet address
      const addressMatch = bodyText.match(/client\|[a-f0-9]{24}|0x[a-f0-9]{40}/i);
      if (addressMatch) {
        results.walletAddress = addressMatch[0];
      }
      
      return results;
    });
    
    console.log('\n📊 PAGE BALANCE INFO:');
    console.log('='.repeat(70));
    
    if (balanceInfo.walletAddress) {
      console.log(`📍 Address on page: ${balanceInfo.walletAddress}`);
    }
    
    if (balanceInfo.balances.length > 0) {
      console.log('\n💵 GALA Balances displayed:');
      balanceInfo.balances.forEach((displayBalance, index) => {
        console.log(`   ${index + 1}. ${displayBalance} GALA`);
      });
    }
    
    console.log('\n='.repeat(70));
    console.log('✅ TEST COMPLETED - FULLY AUTOMATED');
    console.log('='.repeat(70));
    console.log('📸 Screenshots saved:');
    console.log('   - tests/screenshots/testnet-initial.png');
    console.log('   - tests/screenshots/testnet-connected.png');
    console.log('='.repeat(70) + '\n');
  });
});







