import { test, expect } from './fixtures/wallet';
import { connectWallet } from './helpers/connect';

const BASE = process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com';

test('My Profile shows balances after connecting wallet', async ({ page, wallet }) => {
  console.log('[TEST] Test started');
  
  await test.step('open homepage and connect wallet', async () => {
    console.log('[TEST] Navigating to homepage...');
    await page.goto(`${BASE}`, { waitUntil: 'domcontentloaded' });
    console.log('[TEST] ✓ Homepage loaded');
    
    console.log('[TEST] Connecting wallet...');
    await connectWallet(page, wallet);
    console.log('[TEST] ✓ Wallet connected');
  });

  await test.step('navigate to profile', async () => {
    console.log('[TEST] Navigating to my-profile page...');
    await page.goto(`${BASE}/my-profile`, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('[TEST] ✓ Profile page loaded');
  });

  await test.step('wait for balances to load', async () => {
    console.log('[TEST] Waiting for Assets List to appear...');
    await page.getByRole('heading', { name: /assets list/i }).waitFor({ timeout: 45_000 });
    console.log('[TEST] ✓ Assets List heading visible');
    
    // Now wait for actual balance data to load - look for the GALA token amount pattern
    console.log('[TEST] Waiting for GALA balance data to load...');
    await page.locator('text=/[\\d,]+ GALA/').first().waitFor({ timeout: 45_000 });
    console.log('[TEST] ✓ Balances loaded');
  });

  await test.step('capture and report balances', async () => {
    console.log('[TEST] Capturing balances from Assets List...');
    await expect(page.getByRole('heading', { name: /assets list/i })).toBeVisible();
    
    // Target only the Assets List content area
    const assetsContainer = page.locator('.my_profile .content .tab_content .row>div').first();
    
    // Log the Assets List content only
    console.log('[TEST] ===== ASSETS LIST CONTENT =====');
    const assetsText = await assetsContainer.textContent().catch(() => 'Could not read assets');
    console.log(assetsText);
    console.log('[TEST] ===== END ASSETS LIST CONTENT =====');
    
    // Get GALA balance from within the assets container only
    const galaBalanceUSD = await assetsContainer
      .locator('text=/\\$\\s*[\\d.,]+K?/')
      .first()
      .textContent()
      .catch(() => null);

    const galaBalanceAmount = await assetsContainer
      .locator('text=/[\\d,]+ GALA/')
      .first()
      .textContent()
      .catch(() => null);

    console.log('[TEST] ===== BALANCES FOUND =====');
    console.log('[TEST] GALA Balance (USD):', galaBalanceUSD?.trim());
    console.log('[TEST] GALA Balance (Amount):', galaBalanceAmount?.trim());
    console.log('[TEST] ===== END BALANCES =====');
    
    // Take a screenshot of the Assets List section specifically
    console.log('[TEST] Taking Assets List screenshot...');
    const screenshot = await assetsContainer.screenshot();
    test.info().attach('assets-list-balances', {
      body: screenshot,
      contentType: 'image/png',
    });
    console.log('[TEST] ✓ Screenshot captured');

    test.info().annotations.push({ 
      type: 'balance', 
      description: `GALA: ${galaBalanceAmount?.trim() ?? 'not found'} (${galaBalanceUSD?.trim() ?? 'not found'})` 
    });
    console.log('[TEST] ✓ Test complete - Balances verified!');
  });
});
