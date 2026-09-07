import { expect, test } from '@playwright/test';

test('collapsible filter expands advanced groups', async ({ page }) => {
  await page.goto('/');

  const moreButton = page.getByRole('button', { name: '필터 더보기' });
  await expect(moreButton).toBeVisible();
  await expect(page.getByRole('group', { name: '카테고리' })).toBeHidden();

  await moreButton.click();

  await expect(page.getByRole('button', { name: '필터 접기' })).toBeVisible();
  await expect(page.getByRole('group', { name: '카테고리' })).toBeVisible();
  await expect(page.getByRole('group', { name: '정렬' })).toBeVisible();
});
