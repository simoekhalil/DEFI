const { chromium } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

/**
 * Quick Gala Wallet Extension Balance Check
 * Simplified version with better error handling
 */

async function quickBalanceCheck() {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 GALA WALLET BALANCE - QUICK CHECK');
  console.log('='.repeat(60));
  console.log(`📍 Wallet: ${walletAddress}`);
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
      ],
    });

    const page = await browser.newPage();
    
    // Step 1: Load the launchpad site
    console.log('\n🌐 Step 1: Loading Gala DeFi Launchpad...');
    try {
      await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      console.log('✅ Page loaded');
    } catch (e) {
      console.log('⚠️  Page load timeout, continuing anyway...');
    }
    
    await page.waitForTimeout(3000);
    
    // Step 2: Get extension ID
    console.log('\n🔍 Step 2: Finding extension ID...');
    const extId = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src^="chrome-extension://"]'));
      if (scripts.length > 0) {
        const match = scripts[0].src.match(/chrome-extension:\/\/([a-z]+)/);
        return match ? match[1] : null;
      }
      return null;
    });
    
    if (!extId) {
      console.log('❌ Could not find extension ID');
      console.log('\n📝 MANUAL CHECK:');
      console.log('   The browser will stay open for 2 minutes.');
      console.log('   Please:');
      console.log('   1. Click the extension icon (puzzle piece) in the browser toolbar');
      console.log('   2. Click "Gala Wallet"');
      console.log('   3. View your balance in the popup');
      await page.waitForTimeout(120000);
      return;
    }
    
    console.log(`✅ Extension ID: ${extId}`);
    
    // Step 3: Try to open extension popup
    console.log('\n🚀 Step 3: Attempting to access extension...');
    const extensionUrl = `chrome-extension://${extId}/index.html`;
    console.log(`   URL: ${extensionUrl}`);
    
    try {
      // Set a shorter timeout for the extension page
      await page.goto(extensionUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      }).catch(err => {
        console.log(`⚠️  Navigation issue: ${err.message}`);
      });
      
      await page.waitForTimeout(3000);
      
      // Try to get page content
      console.log('\n📱 Step 4: Reading extension content...');
      const content = await page.evaluate(() => {
        return {
          title: document.title,
          body: document.body ? document.body.innerText : 'No body content',
          html: document.documentElement ? document.documentElement.outerHTML.substring(0, 500) : 'No HTML'
        };
      }).catch(err => {
        console.log(`⚠️  Could not read content: ${err.message}`);
        return null;
      });
      
      if (content) {
        console.log(`   Title: ${content.title}`);
        console.log('\n💰 CONTENT:');
        console.log('='.repeat(60));
        console.log(content.body);
        console.log('='.repeat(60));
        
        // Parse balance
        const galaMatch = content.body.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*GALA/i);
        if (galaMatch) {
          console.log(`\n✅ GALA BALANCE: ${galaMatch[1]} GALA`);
        } else {
          console.log('\n⚠️  No GALA balance found in text');
        }
        
        // Take screenshot
        try {
          await page.screenshot({ 
            path: 'extension-screenshot.png',
            fullPage: true 
          });
          console.log('\n📸 Screenshot saved: extension-screenshot.png');
        } catch (e) {
          console.log('\n⚠️  Could not save screenshot');
        }
      }
      
    } catch (err) {
      console.log(`❌ Error accessing extension: ${err.message}`);
      console.log('\n📝 FALLBACK - MANUAL CHECK:');
      console.log('   The browser will stay open.');
      console.log('   Please manually click the extension icon to view your balance.');
    }
    
    // Keep browser open
    console.log('\n⏳ Browser will remain open for 1 minute...');
    console.log('   You can manually inspect the extension');
    console.log('   Press Ctrl+C to close early\n');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

quickBalanceCheck().catch(console.error);






