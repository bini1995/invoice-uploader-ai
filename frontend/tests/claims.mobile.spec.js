import { test, expect } from '@playwright/test';

const claim = {
  id: 1,
  claim_id: 'CLM-1',
  vendor: 'Vendor',
  amount: 100,
  approval_status: 'Pending',
  flagged_issues: 0,
  assignee: 'Alice',
  updated_at: '2024-01-01T00:00:00Z'
};

test('nav collapses and search input expands', async ({ page }) => {
  await page.route('**/api/default/claims?status=Pending', route => route.fulfill({ body: JSON.stringify([]) }));
  await page.goto('/opsclaim');
  const search = page.locator('#searchInput');
  await expect(search).toBeVisible();
  const box = await search.boundingBox();
  expect(box.width).toBeGreaterThan(300);
});

test('claim list renders as cards and action bar enables', async ({ page }) => {
  await page.route('**/api/default/claims?status=Pending', route => route.fulfill({ body: JSON.stringify([claim]) }));
  await page.goto('/opsclaim');
  await expect(page.getByText('Claim ID: CLM-1')).toBeVisible();
  await page.getByRole('checkbox').nth(1).check();
  const approve = page.getByRole('button', { name: 'Approve' });
  await expect(approve).toBeEnabled();
});

test('notes modal full screen and dismissible', async ({ page }) => {
  await page.route('**/api/default/claims?status=Pending', route => route.fulfill({ body: JSON.stringify([claim]) }));
  await page.goto('/opsclaim');
  await page.getByTitle('Notes').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(Math.round(box.width)).toBeGreaterThan(350);
  await page.getByLabel('Close').click();
  await expect(dialog).toBeHidden();
  await page.getByTitle('Notes').click();
  await page.click('[data-testid="notes-overlay"]');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByTitle('Notes').click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});
