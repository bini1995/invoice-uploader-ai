import { test, expect } from '@playwright/test';

test('glossary tooltip opens via keyboard', async ({ page }) => {
  await page.goto('/');
  const help = page.getByLabel(/AI Extracted from CMS1500/i);
  await help.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).not.toBeVisible();
});
