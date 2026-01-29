const { chromium } = require('@playwright/test');
const path = require('path');

/**
 * Quick Button Inspector
 * Lists all buttons on the token creation form
 */

async function inspectButtons() {
  const extensionPath = path.join(__dirname, 'extensions', 'testnet-wallet', 'build');
  const siteUrl = 'https://lpad-frontend-dev1.defi.gala.com';
  
  console.log('\n🔍 BUTTON INSPECTOR');
  console.log('='.repeat(80));
  
  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    viewport: { width: 1400, height: 900 }
  });

  try {
    const page = await browser.newPage();
    
    console.log('\n📍 Step 1: Navigating to main page...');
    await page.goto(siteUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    console.log('✅ Main page loaded\n');
    
    console.log('📍 Step 2: Clicking Launch button...');
    await page.locator('a:has-text("Launch")').first().click();
    await page.waitForTimeout(3000);
    console.log('✅ Form page loaded\n');
    console.log(`📍 Current URL: ${page.url()}\n`);
    
    // Analyze all buttons
    console.log('='.repeat(80));
    console.log('BUTTON ANALYSIS');
    console.log('='.repeat(80));
    
    const allButtons = await page.locator('button').all();
    console.log(`\n📊 Found ${allButtons.length} <button> elements:\n`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      const text = await btn.textContent().catch(() => '');
      const isVisible = await btn.isVisible().catch(() => false);
      const isEnabled = await btn.isEnabled().catch(() => false);
      const className = await btn.getAttribute('class').catch(() => '');
      const type = await btn.getAttribute('type').catch(() => '');
      const disabled = await btn.getAttribute('disabled').catch(() => null);
      
      console.log(`Button ${i + 1}:`);
      console.log(`  Text: "${text?.trim() || '(empty)'}"`);
      console.log(`  Visible: ${isVisible}`);
      console.log(`  Enabled: ${isEnabled}`);
      console.log(`  Disabled attr: ${disabled !== null ? 'YES' : 'NO'}`);
      console.log(`  Type: ${type || 'button (default)'}`);
      console.log(`  Class: ${className || '(none)'}`);
      console.log('');
    }
    
    // Check for role=button elements
    const roleButtons = await page.locator('[role="button"]').all();
    console.log(`\n📊 Found ${roleButtons.length} elements with role="button":\n`);
    
    for (let i = 0; i < Math.min(roleButtons.length, 10); i++) {
      const btn = roleButtons[i];
      const text = await btn.textContent().catch(() => '');
      const isVisible = await btn.isVisible().catch(() => false);
      const tagName = await btn.evaluate(el => el.tagName).catch(() => '');
      const className = await btn.getAttribute('class').catch(() => '');
      
      console.log(`Role Button ${i + 1}:`);
      console.log(`  Tag: <${tagName.toLowerCase()}>`);
      console.log(`  Text: "${text?.trim() || '(empty)'}"`);
      console.log(`  Visible: ${isVisible}`);
      console.log(`  Class: ${className || '(none)'}`);
      console.log('');
    }
    
    // Check for inputs
    const inputs = await page.locator('input[type="submit"], input[type="button"]').all();
    console.log(`\n📊 Found ${inputs.length} submit/button inputs\n`);
    
    for (let i = 0; i < inputs.length; i++) {
      const inp = inputs[i];
      const value = await inp.getAttribute('value').catch(() => '');
      const isVisible = await inp.isVisible().catch(() => false);
      const type = await inp.getAttribute('type').catch(() => '');
      
      console.log(`Input ${i + 1}:`);
      console.log(`  Type: ${type}`);
      console.log(`  Value: "${value}"`);
      console.log(`  Visible: ${isVisible}`);
      console.log('');
    }
    
    // Get form structure
    console.log('\n='.repeat(80));
    console.log('FORM STRUCTURE');
    console.log('='.repeat(80) + '\n');
    
    const forms = await page.locator('form').all();
    console.log(`Found ${forms.length} forms\n`);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const html = await form.evaluate(el => el.outerHTML).catch(() => 'Error');
      console.log(`Form ${i + 1}:`);
      console.log(html.substring(0, 1500));
      console.log('\n...(truncated)\n');
    }
    
    console.log('\n⏸️  Browser will stay open for 60 seconds for manual inspection...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Inspection complete!');
  }
}

inspectButtons().catch(console.error);






