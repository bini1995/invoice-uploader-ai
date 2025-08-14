import { test, expect } from '@playwright/test';

test('landing page mobile experience', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('header');
  const headerBox = await header.boundingBox();
  const headerHeight = headerBox?.height ?? 0;
  await page.evaluate(() => window.scrollBy(0, 100));
  const afterScroll = await header.boundingBox();
  expect(afterScroll?.y).toBeLessThanOrEqual((headerBox?.y ?? 0) + 1);

  const cta = page.getByRole('button', { name: /schedule a demo/i }).first();
  const ctaBox = await cta.boundingBox();
  expect(ctaBox?.y).toBeLessThan(page.viewportSize().height);

  await page.getByRole('link', { name: /see how it works/i }).click();
  await page.waitForTimeout(200);
  const targetBox = await page.locator('#how-it-works').boundingBox();
  expect(targetBox?.y).toBeGreaterThanOrEqual(headerHeight - 1);
});
