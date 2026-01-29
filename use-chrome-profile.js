const { chromium } = require('@playwright/test');
const path = require('path');
const os = require('os');

/**
 * Use Your Chrome Profile with Extensions Enabled
 */

(async () => {
  console.log('🔌 USING YOUR CHROME PROFILE WITH EXTENSIONS');
  console.log('='.repeat(60));

  const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
  
  console.log(`Profile: ${userDataDir}\n`);
  console.log('⚠️  CLOSE ALL CHROME WINDOWS NOW!');
  console.log('   (If Chrome is open, this will fail)\n');
  console.log('⏳ Starting in 5 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    console.log('🚀 Launching Chrome with your extensions...');
    
    // Use a temporary profile directory to avoid locking issues
    const tempProfile = path.join(__dirname, 'temp-chrome-profile');
    
    const context = await chromium.launchPersistentContext(tempProfile, {
      headless: false,
      channel: 'chrome',
      args: [
        // Copy these from your Chrome://version page if needed
        `--profile-directory=Default`, // or Profile 1, Profile 2, etc.
      ],
      ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    });

    console.log('✅ Browser launched!\n');
    console.log('ℹ️  Note: This is using a temporary profile.');
    console.log('   Your extensions won\'t be here, but the browser is stable.\n');
    console.log('📝 To use your actual extensions, you\'ll need to:');
    console.log('   1. Install Gala wallet extension manually in this session, OR');
    console.log('   2. I can create a script that uses Puppeteer MCP instead\n');

    const page = await context.pages()[0] || await context.newPage();

    console.log('1️⃣ Navigating to Gala Launchpad...');
    await page.goto('https://lpad-frontend-dev1.defi.gala.com');
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded\n');

    await page.screenshot({ path: 'chrome-profile-test.png', fullPage: true });

    console.log('⏳ Browser will stay open for 2 minutes...');
    console.log('   You can manually:');
    console.log('   1. Install the Gala wallet extension (drag & drop the build folder)');
    console.log('   2. Connect your wallet');
    console.log('   3. Test the purchase flow\n');
    
    await page.waitForTimeout(120000);

    await context.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n✅ Done!');
})();






