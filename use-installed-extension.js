const { chromium } = require('@playwright/test');
const path = require('path');
const os = require('os');

/**
 * Use Already Installed Extension
 * Connects to your existing Chrome profile with Gala wallet already installed
 */

(async () => {
  console.log('🔌 USING YOUR INSTALLED GALA WALLET EXTENSION');
  console.log('='.repeat(60));

  // Common Chrome user data locations
  const userDataDirs = [
    path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data'),
    path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data'),
  ];

  let userDataDir = null;
  const fs = require('fs');
  
  for (const dir of userDataDirs) {
    if (fs.existsSync(dir)) {
      console.log(`✅ Found browser profile: ${dir}`);
      userDataDir = dir;
      break;
    }
  }

  if (!userDataDir) {
    console.error('❌ Could not find Chrome/Edge user data directory');
    console.log('\nPlease provide your Chrome profile path manually.');
    console.log('Common locations:');
    console.log('  Chrome: C:\\Users\\YourName\\AppData\\Local\\Google\\Chrome\\User Data');
    console.log('  Edge:   C:\\Users\\YourName\\AppData\\Local\\Microsoft\\Edge\\User Data');
    return;
  }

  console.log('\n⚠️  IMPORTANT: Close all Chrome/Edge windows before continuing!');
  console.log('   (Playwright needs exclusive access to the profile)\n');
  console.log('⏳ Starting in 5 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    console.log('🚀 Launching browser with your profile...');
    
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
      channel: 'chrome', // Use installed Chrome
    });

    console.log('✅ Browser launched with your extensions!\n');

    const page = await context.newPage();

    console.log('1️⃣ Navigating to Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('✅ Page loaded\n');

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'installed-1-loaded.png', fullPage: true });

    console.log('2️⃣ Checking wallet connection status...');
    const status = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasConnect: text.includes('Connect'),
        hasDisconnect: text.includes('Disconnect'),
        hasWalletAddress: text.match(/client\|[a-f0-9]{24}/i),
        bodyText: text.substring(0, 500)
      };
    });

    console.log(`   Has Connect button: ${status.hasConnect}`);
    console.log(`   Has Disconnect: ${status.hasDisconnect}`);
    console.log(`   Wallet address found: ${status.hasWalletAddress ? status.hasWalletAddress[0] : 'No'}`);

    if (status.hasDisconnect || status.hasWalletAddress) {
      console.log('\n✅ WALLET IS ALREADY CONNECTED!\n');
    } else {
      console.log('\n⚠️  Wallet not connected yet\n');
      console.log('3️⃣ Clicking Connect Wallet...');
      try {
        await page.click('button:has-text("Connect Wallet")', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'installed-2-connect-modal.png', fullPage: true });
        console.log('✅ Connect modal opened\n');
        
        console.log('4️⃣ Selecting Gala Wallet...');
        await page.click('button:has-text("Gala")', { timeout: 5000 });
        await page.waitForTimeout(3000);
        console.log('✅ Gala wallet selected - check for popup!\n');
      } catch (e) {
        console.log(`⚠️  Could not click connect: ${e.message}\n`);
      }
    }

    await page.screenshot({ path: 'installed-3-after-connect.png', fullPage: true });

    console.log('5️⃣ Looking for tokens...');
    const tokens = await page.locator('a[href*="/token/"]').count();
    console.log(`   Found ${tokens} tokens\n`);

    if (tokens > 0) {
      console.log('6️⃣ Clicking first token...');
      await page.locator('a[href*="/token/"]').first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'installed-4-token-page.png', fullPage: true });
      console.log('✅ Token page opened\n');

      console.log('7️⃣ Looking for buy interface...');
      const buyInput = await page.locator('input[type="number"]').count();
      if (buyInput > 0) {
        console.log('   Found amount input, entering 100 GALA...');
        await page.locator('input[type="number"]').first().fill('100');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'installed-5-amount-entered.png', fullPage: true });
        console.log('✅ Amount entered\n');

        console.log('8️⃣ Clicking Buy button...');
        const buyBtn = page.locator('button:has-text("Buy")').first();
        if (await buyBtn.count() > 0 && await buyBtn.isEnabled()) {
          await buyBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'installed-6-buy-clicked.png', fullPage: true });
          console.log('✅ Buy button clicked!\n');
        } else {
          console.log('⚠️  Buy button not available\n');
        }
      } else {
        console.log('⚠️  No amount input found\n');
      }
    }

    await page.screenshot({ path: 'installed-final.png', fullPage: true });

    console.log('✅ PURCHASE FLOW COMPLETED!');
    console.log('📸 Screenshots saved: installed-*.png\n');
    console.log('⏳ Browser will stay open for 60 seconds...');
    console.log('   You can manually complete the purchase if needed\n');
    
    await page.waitForTimeout(60000);

    console.log('🏁 Closing browser...');
    await context.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure ALL Chrome/Edge windows are closed');
    console.log('2. If error persists, try running with a different profile');
    console.log('3. You can manually specify the path by editing this script');
  }

  console.log('\n✅ Done!');
})();






