import { test, expect, chromium, BrowserContext } from '@playwright/test';
import path from 'path';

/**
 * Automated Testnet Wallet Extension Test
 * This test automatically loads the testnet wallet extension and retrieves balance
 */

test.describe('Testnet Wallet Extension - Automated', () => {
  
  test('should load extension and check balance automatically', async () => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('\n🚀 AUTOMATED TESTNET WALLET TEST');
    console.log('='.repeat(70));
    console.log('This test will:');
    console.log('1. Launch browser with testnet wallet extension loaded');
    console.log('2. Navigate to the testnet launchpad');
    console.log('3. Attempt to connect wallet automatically');
    console.log('4. Read your balance from the UI');
    console.log('='.repeat(70));
    
    // Extension path
    const extensionPath = path.join(process.cwd(), 'extensions', 'testnet-wallet', 'build');
    console.log(`\n📦 Extension Path: ${extensionPath}`);
    
    // Launch browser with extension
    console.log('\n🌐 Step 1: Launching browser with testnet wallet extension...');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });
    
    console.log('✅ Browser launched with extension');
    
    // Get all pages (extension might open its own page)
    const pages = context.pages();
    console.log(`📄 Open pages: ${pages.length}`);
    
    // Create or get the main page
    const page = pages.length > 0 ? pages[0] : await context.newPage();
    
    // Navigate to testnet site
    console.log('\n📍 Step 2: Navigating to testnet launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded');
    
    await page.screenshot({ 
      path: 'tests/screenshots/testnet-auto-1-loaded.png',
      fullPage: true 
    });
    
    // Check if extension is active
    console.log('\n🔍 Step 3: Checking extension status...');
    const hasGalaProvider = await page.evaluate(() => {
      return {
        hasWindow: typeof window !== 'undefined',
        hasGala: typeof (window as any).gala !== 'undefined',
        hasGalaWallet: typeof (window as any).gala?.wallet !== 'undefined',
        hasEthereum: typeof (window as any).ethereum !== 'undefined',
      };
    });
    
    console.log('Extension Status:');
    console.log(`  Window available: ${hasGalaProvider.hasWindow}`);
    console.log(`  window.gala: ${hasGalaProvider.hasGala}`);
    console.log(`  window.gala.wallet: ${hasGalaProvider.hasGalaWallet}`);
    console.log(`  window.ethereum: ${hasGalaProvider.hasEthereum}`);
    
    // Look for connect button
    console.log('\n🔗 Step 4: Looking for Connect Wallet button...');
    const connectButton = page.locator('button:has-text("Connect")').first();
    
    if (await connectButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found Connect button');
      await connectButton.click();
      console.log('🖱️  Clicked Connect button');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/testnet-auto-2-clicked-connect.png',
        fullPage: true 
      });
      
      // Look for Gala Wallet option
      const galaOption = page.locator('text=/gala.*wallet/i').first();
      if (await galaOption.isVisible({ timeout: 5000 })) {
        console.log('✅ Found Gala Wallet option');
        await galaOption.click();
        console.log('🖱️  Selected Gala Wallet');
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('⚠️  Connect button not found or already connected');
    }
    
    // Wait for connection or wallet popup
    console.log('\n⏳ Step 5: Waiting for wallet connection...');
    console.log('👉 If wallet popup appears, please approve the connection');
    console.log('   Waiting up to 60 seconds...');
    
    // Check for connection indicators periodically
    let connected = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(2000);
      
      const status = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          hasDisconnect: text.includes('disconnect'),
          hasAddress: /client\|[a-f0-9]{24}/.test(document.body.innerText),
          hasBalance: /\d+.*gala/.test(text),
        };
      });
      
      if (status.hasDisconnect || status.hasAddress || status.hasBalance) {
        connected = true;
        console.log(`✅ Connection detected after ${(i + 1) * 2} seconds`);
        break;
      }
      
      if (i % 5 === 0 && i > 0) {
        console.log(`   Still waiting... (${(i + 1) * 2}s)`);
      }
    }
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'tests/screenshots/testnet-auto-3-after-connection.png',
      fullPage: true 
    });
    
    // Read balance from page
    console.log('\n💰 Step 6: Reading balance from page...');
    
    const balanceInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      const results = {
        balances: [] as string[],
        walletAddress: null as string | null,
        fullText: text.substring(0, 500), // First 500 chars for debugging
      };
      
      // Find GALA balance
      const galaMatches = text.matchAll(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*GALA/gi);
      for (const match of galaMatches) {
        if (match[1]) results.balances.push(match[1]);
      }
      
      // Find wallet address
      const addressMatch = text.match(/client\|[a-f0-9]{24}/i);
      if (addressMatch) results.walletAddress = addressMatch[0];
      
      return results;
    });
    
    console.log('\n📊 RESULTS:');
    console.log('='.repeat(70));
    
    if (balanceInfo.walletAddress) {
      console.log(`✅ Wallet Connected: ${balanceInfo.walletAddress}`);
    } else {
      console.log('⚠️  Wallet address not found in UI');
    }
    
    if (balanceInfo.balances.length > 0) {
      console.log(`\n💰 GALA Balance(s) Found:`);
      balanceInfo.balances.forEach((balance, i) => {
        console.log(`   ${i + 1}. ${balance} GALA`);
      });
    } else {
      console.log('\n⚠️  No GALA balance displayed');
      console.log('   This may mean:');
      console.log('   - Wallet not connected yet');
      console.log('   - Balance is 0');
      console.log('   - Balance shown in different format');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - testnet-auto-1-loaded.png');
    console.log('   - testnet-auto-2-clicked-connect.png');
    console.log('   - testnet-auto-3-after-connection.png');
    
    console.log('\n='.repeat(70));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(70) + '\n');
    
    // Keep browser open for inspection
    console.log('💡 Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    
    await context.close();
  });
  
});

