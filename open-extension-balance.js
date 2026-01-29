const { chromium } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

/**
 * Open Gala Wallet Extension Popup and Read Balance
 * Directly accesses the extension popup URL
 */

async function openExtensionBalance() {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  const walletAddress = process.env.TEST_WALLET_ADDRESS || 'client|618ae395c1c653111d3315be';
  
  console.log('💰 OPENING GALA WALLET EXTENSION');
  console.log('='.repeat(60));
  console.log(`📍 Expected Wallet: ${walletAddress}`);
  console.log(`📂 Extension Path: ${extensionPath}`);
  console.log('='.repeat(60));

  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  try {
    // Create a page to work with
    const page = await browser.newPage();
    
    console.log('\n🔍 Finding extension ID...');
    
    // Navigate to chrome://extensions to find the extension ID
    // Alternative: use the extension management API
    const extensionId = await page.evaluate(async () => {
      // Try to get the extension ID from the injected content
      // The extension ID is typically available in the extension context
      return new Promise((resolve) => {
        // Check if chrome.runtime is available
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
          resolve(chrome.runtime.id);
        } else {
          // Extension ID needs to be found another way
          resolve(null);
        }
      });
    });

    if (extensionId) {
      console.log(`✅ Found extension ID: ${extensionId}`);
    } else {
      console.log('⚠️  Could not auto-detect extension ID');
      console.log('   Will try to find it from loaded extensions...');
    }

    // Get all background/service worker targets
    const allPages = await browser.pages();
    console.log(`\n📄 Found ${allPages.length} pages/contexts`);
    
    let extId = extensionId;
    let extensionPopupUrl = null;

    // Look through all pages for extension URLs
    for (const p of allPages) {
      const url = p.url();
      console.log(`   - ${url}`);
      
      if (url.startsWith('chrome-extension://')) {
        // Extract extension ID from URL
        const match = url.match(/chrome-extension:\/\/([a-z]+)/);
        if (match) {
          extId = match[1];
          console.log(`\n✅ Found extension ID from URL: ${extId}`);
        }
      }
    }

    // If we still don't have the ID, try to navigate to a test page and inject the extension
    if (!extId) {
      console.log('\n🌐 Loading test page to trigger extension...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com');
      await page.waitForTimeout(2000);
      
      // Try to get extension ID from injected scripts
      extId = await page.evaluate(() => {
        // Look for any chrome-extension:// URLs in the page
        const scripts = Array.from(document.querySelectorAll('script[src^="chrome-extension://"]'));
        if (scripts.length > 0) {
          const match = scripts[0].src.match(/chrome-extension:\/\/([a-z]+)/);
          return match ? match[1] : null;
        }
        return null;
      });
      
      if (extId) {
        console.log(`✅ Found extension ID from injected scripts: ${extId}`);
      }
    }

    // If still no ID, calculate it from the path (Chrome uses a deterministic algorithm)
    if (!extId) {
      console.log('\n⚠️  Could not auto-detect extension ID');
      console.log('📝 Manual step required:');
      console.log('   1. Look at the browser window that opened');
      console.log('   2. Click the extension icon (puzzle piece) in the toolbar');
      console.log('   3. Click on "Gala Wallet"');
      console.log('   4. The wallet popup should open');
      console.log('\n⏳ Keeping browser open for 2 minutes for manual inspection...');
      await page.waitForTimeout(120000);
      return;
    }

    // Construct the extension popup URL
    extensionPopupUrl = `chrome-extension://${extId}/index.html`;
    console.log(`\n🔗 Extension popup URL: ${extensionPopupUrl}`);

    // Navigate to the extension popup
    console.log('\n🚀 Opening extension popup...');
    await page.goto(extensionPopupUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(3000);

    // Take a screenshot
    await page.screenshot({ path: 'extension-popup-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to: extension-popup-screenshot.png');

    // Extract all text from the popup
    console.log('\n📱 EXTENSION POPUP CONTENT:');
    console.log('='.repeat(60));
    
    const popupContent = await page.evaluate(() => {
      const getText = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => el.innerText.trim()).filter(Boolean);
      };

      return {
        title: document.title,
        bodyText: document.body.innerText,
        // Look for specific balance-related elements
        balanceElements: getText('[class*="balance" i], [id*="balance" i]'),
        amountElements: getText('[class*="amount" i], [id*="amount" i]'),
        galaElements: getText('[class*="gala" i], [id*="gala" i]'),
        // Get all visible text
        allText: Array.from(document.body.querySelectorAll('*'))
          .filter(el => el.offsetParent !== null && el.innerText && el.children.length === 0)
          .map(el => el.innerText.trim())
          .filter(text => text.length > 0 && text.length < 200)
      };
    });

    console.log(`📄 Title: ${popupContent.title}`);
    console.log('\n📝 Full Content:');
    console.log(popupContent.bodyText);

    // Parse balance information
    console.log('\n💰 BALANCE INFORMATION:');
    console.log('='.repeat(60));

    const bodyText = popupContent.bodyText;
    
    // Look for GALA balance
    const galaMatch = bodyText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*GALA/i);
    if (galaMatch) {
      console.log(`💵 GALA Balance: ${galaMatch[1]} GALA`);
    }

    // Look for wallet address
    const addressMatch = bodyText.match(/client\|[a-f0-9]{24}/i);
    if (addressMatch) {
      console.log(`📍 Wallet Address: ${addressMatch[0]}`);
    }

    // Look for any numbers that might be balances
    const numberPattern = /(\d+(?:,\d{3})*(?:\.\d{2,})?)/g;
    const numbers = bodyText.match(numberPattern);
    if (numbers) {
      console.log('\n🔢 All numbers found:');
      numbers.forEach((num, idx) => {
        console.log(`   ${idx + 1}. ${num}`);
      });
    }

    // Display balance-related elements
    if (popupContent.balanceElements.length > 0) {
      console.log('\n💳 Balance Elements:');
      popupContent.balanceElements.forEach(el => console.log(`   - ${el}`));
    }

    if (popupContent.amountElements.length > 0) {
      console.log('\n💰 Amount Elements:');
      popupContent.amountElements.forEach(el => console.log(`   - ${el}`));
    }

    console.log('\n='.repeat(60));
    console.log('\n⏳ Keeping browser open for 60 seconds for manual inspection...');
    console.log('   You can interact with the extension popup');
    console.log('   Press Ctrl+C to close early');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed');
  }
}

openExtensionBalance().catch(console.error);

