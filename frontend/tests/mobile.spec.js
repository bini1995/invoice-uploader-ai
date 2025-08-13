import { test, expect } from '@playwright/test';

test('navbar collapse and hero CTA', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('button', { name: /request demo/i });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
