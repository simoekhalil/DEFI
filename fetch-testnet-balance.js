const { chromium } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

/**
 * Fetch Balance from Testnet Wallet Extension
 * Loads the extension and reads balance directly
 */

async function fetchExtensionBalance() {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 FETCHING BALANCE FROM TESTNET EXTENSION');
  console.log('='.repeat(60));
  console.log(`📍 Wallet Address: ${walletAddress}`);
  console.log(`📂 Extension Path: ${extensionPath}`);
  console.log('='.repeat(60));

  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to the Gala launchpad
    console.log('\n🌐 Loading Gala DeFi Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    console.log('✅ Page loaded');
    
    // Wait a bit for extension to inject
    await page.waitForTimeout(3000);
    
    // Try to find the connect wallet button
    console.log('\n🔍 Looking for wallet connection...');
    
    // Check if already connected
    const isConnected = await page.evaluate(() => {
      return !!window.ethereum || !!window.gala;
    });
    
    console.log(`📊 Extension injected: ${isConnected}`);
    
    // Look for wallet connection button
    const connectButton = await page.locator('button').filter({ hasText: /connect|wallet/i }).first();
    
    if (await connectButton.count() > 0) {
      console.log('\n🔗 Found connect button, clicking...');
      await connectButton.click({ timeout: 5000 }).catch(() => 
        console.log('⚠️  Could not click connect button'));
      await page.waitForTimeout(2000);
    }
    
    // Try to read balance from the page
    console.log('\n💰 Reading balance from page...');
    const balanceInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const results = {
        balances: [],
        walletConnected: false,
        walletAddress: null,
        rawText: bodyText.slice(0, 500) // First 500 chars for debugging
      };
      
      // Look for wallet address
      const addressMatch = bodyText.match(/client\|[a-f0-9]{24}/i);
      if (addressMatch) {
        results.walletAddress = addressMatch[0];
        results.walletConnected = true;
      }
      
      // Look for GALA balance patterns
      const galaPatterns = [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*GALA/gi,
        /GALA[:\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
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
      
      return results;
    });
    
    console.log('\n📊 BALANCE RESULTS:');
    console.log('='.repeat(60));
    
    if (balanceInfo.walletConnected) {
      console.log(`✅ Wallet Connected: ${balanceInfo.walletAddress}`);
    } else {
      console.log('⚠️  Wallet not detected on page');
    }
    
    if (balanceInfo.balances.length > 0) {
      console.log('\n💵 GALA Balances found:');
      balanceInfo.balances.forEach((balance, index) => {
        console.log(`   ${index + 1}. ${balance} GALA`);
      });
    } else {
      console.log('\n⚠️  No balance information found on page');
      console.log('\n📄 Page content preview:');
      console.log(balanceInfo.rawText);
    }
    
    console.log('\n='.repeat(60));
    
    // Get extension pages (popup/background)
    console.log('\n🔌 Checking extension pages...');
    const contexts = browser.contexts();
    for (const context of contexts) {
      const pages = context.pages();
      console.log(`   Found ${pages.length} pages`);
      for (const p of pages) {
        console.log(`   - ${p.url()}`);
      }
    }
    
    // Try to access extension popup directly
    const targets = await browser.pages();
    const extensionPages = targets.filter(p => 
      p.url().startsWith('chrome-extension://') && 
      (p.url().includes('index.html') || p.url().includes('popup'))
    );
    
    if (extensionPages.length > 0) {
      console.log('\n🎯 Found extension popup page!');
      const extPage = extensionPages[0];
      await extPage.bringToFront();
      await extPage.waitForTimeout(2000);
      
      const extBalance = await extPage.evaluate(() => {
        return {
          bodyText: document.body.innerText,
          title: document.title
        };
      });
      
      console.log('\n📱 Extension Popup Content:');
      console.log(extBalance.bodyText);
    }
    
    console.log('\n⏳ Keeping browser open for 30 seconds...');
    console.log('   (You can manually check the extension popup)');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

fetchExtensionBalance().catch(console.error);






