import { test, expect } from './fixtures/wallet';

const BASE = process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com';

test('My Profile shows balances after connecting wallet', async ({ page, wallet }) => {
  await page.goto(`${BASE}/my-Profile`, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /connect/i }).click();

  await wallet.approve();

  await Promise.race([
    page.waitForResponse((response) => response.url().includes('/balances') && response.ok(), {
      timeout: 20_000,
    }),
    page.getByRole('heading', { name: /balance/i }).waitFor({ timeout: 20_000 }),
  ]);

  const balancesSection = page.getByRole('heading', { name: /balance/i });
  await expect(balancesSection).toBeVisible();

  const ethBalanceText = await page
    .locator('[data-testid="balance-ETH"]')
    .textContent()
    .catch(() => null);

  test.info().annotations.push({ type: 'balance', description: `ETH: ${ethBalanceText ?? 'not found'}` });
});
