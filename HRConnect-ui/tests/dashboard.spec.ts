import { test, expect, employeeToken, seedAuth, apiUrl } from './helpers';

const dashboardBalances = {
  casualLeaveTotal: 8, casualLeaveUsed: 0, casualLeaveRemaining: 8,
  sickLeaveTotal: 6.5, sickLeaveUsed: 3.5, sickLeaveRemaining: 3.0,
  earnedLeaveTotal: 18, earnedLeaveUsed: 0, earnedLeaveRemaining: 18,
  pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0,
};

test.describe('Dashboard - My Available Balance', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page, { token: employeeToken, isAdmin: false });
    await page.route(apiUrl('/leaves/mine'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route(apiUrl('/leaves/dashboard'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dashboardBalances) })
    );
    await page.goto('/dashboard');
  });

  test('balance section shows three leave cards', async ({ page }) => {
    await expect(page.locator('text=My Available Balance')).toBeVisible();
    await expect(page.locator('text=Casual Leave')).toBeVisible();
    await expect(page.locator('text=Sick Leave')).toBeVisible();
    await expect(page.locator('text=Earned Leave')).toBeVisible();
  });

  test('casual leave remaining is 8', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Casual Leave' });
    await expect(card).toContainText('8');
    await expect(card).toContainText('Already taken');
  });

  test('sick leave remaining handles decimals (3)', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Sick Leave' });
    await expect(card).toContainText('3');
    await expect(card).toContainText('3.5 days');
  });

  test('earned leave remaining is 18', async ({ page }) => {
    const card = page.locator('.card', { hasText: 'Earned Leave' });
    await expect(card).toContainText('18');
  });

  test('apply for leave and logout buttons are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Apply for Leave")')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});
