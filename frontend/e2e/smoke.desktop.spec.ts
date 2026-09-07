import { expect, test } from '@playwright/test';

test('home filter toggles and section renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'POPCAST' })).toBeVisible();

  const statusGroup = page.getByRole('group', { name: '진행 상태' });
  await expect(statusGroup).toBeVisible();

  const activeTab = statusGroup.getByRole('button', { pressed: true });
  await expect(activeTab).toBeVisible();

  const ongoingTab = statusGroup.getByRole('button', { name: '진행중' });
  await ongoingTab.click();
  await expect(ongoingTab).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByText('전체 팝업')).toBeVisible();
});

test('login page renders', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible();
  await expect(page.getByLabel('비밀번호')).toBeVisible();
  await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible();
});
