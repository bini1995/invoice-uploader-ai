import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page has no obvious accessibility issues', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
