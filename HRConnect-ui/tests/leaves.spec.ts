import { test, expect, employeeToken, seedAuth, apiUrl } from './helpers';

const leaveBalance = [
  { leaveType: 'Casual', totalDays: 8, usedDays: 0, remainingDays: 8 },
  { leaveType: 'Sick', totalDays: 6.5, usedDays: 3.5, remainingDays: 3 },
  { leaveType: 'Earned', totalDays: 18, usedDays: 0, remainingDays: 18 },
];

test.describe('Leaves - Apply for Leave', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page, { token: employeeToken, isAdmin: false });
    await page.route(apiUrl('/leaves/mine'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route(apiUrl('/leaves/leave-balance'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(leaveBalance) })
    );
    await page.goto('/leaves');
  });

  test('apply form shows all key fields', async ({ page }) => {
    await expect(page.locator('text=Apply for Leave')).toBeVisible();
    await expect(page.locator('.select')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toHaveCount(2);
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Submit Request")')).toBeVisible();
    await expect(page.locator('button:has-text("Back")')).toBeVisible();
  });

  test('back button returns to dashboard', async ({ page }) => {
    await page.route(apiUrl('/leaves/dashboard'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    );
    await page.click('button:has-text("Back")');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('submit is disabled when mandatory fields empty', async ({ page }) => {
    await expect(page.locator('button:has-text("Submit Request")')).toBeDisabled();
  });

  test('reason below 10 chars keeps submit disabled', async ({ page }) => {
    await page.locator('.select').selectOption('Sick');
    await page.locator('input[type="date"]').nth(0).fill('2026-07-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-07-02');
    await page.locator('textarea').fill('short');
    await expect(page.locator('button:has-text("Submit Request")')).toBeDisabled();
  });

  test('number of days auto-calculates for date range', async ({ page }) => {
    await page.locator('input[type="date"]').nth(0).fill('2026-07-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-07-02');
    await expect(page.locator('input[readonly]')).toHaveValue('2');
  });

  test('weekend is excluded from day count (Fri to Mon = 2)', async ({ page }) => {
    await page.locator('input[type="date"]').nth(0).fill('2026-07-03');
    await page.locator('input[type="date"]').nth(1).fill('2026-07-06');
    await expect(page.locator('input[readonly]')).toHaveValue('2');
  });

  test('half-day options disabled for non-single-day leave', async ({ page }) => {
    await page.locator('input[type="date"]').nth(0).fill('2026-07-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-07-02');
    await expect(page.locator('input[type="checkbox"]').nth(0)).toBeDisabled();
    await expect(page.locator('input[type="checkbox"]').nth(1)).toBeDisabled();
  });

  test('successful submit refreshes list', async ({ page }) => {
    await page.route(apiUrl('/leaves'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    );
    await page.locator('.select').selectOption('Sick');
    await page.locator('input[type="date"]').nth(0).fill('2026-07-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-07-02');
    await page.locator('textarea').fill('Medical consultation');
    await expect(page.locator('button:has-text("Submit Request")')).toBeEnabled();
    await page.click('button:has-text("Submit Request")');
    await expect(page.locator('text=My Leave History')).toBeVisible();
  });

  test('API failure on submit shows error', async ({ page }) => {
    await page.route(apiUrl('/leaves'), (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'error' }) })
    );
    await page.locator('.select').selectOption('Sick');
    await page.locator('input[type="date"]').nth(0).fill('2026-07-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-07-02');
    await page.locator('textarea').fill('Medical consultation');
    await page.click('button:has-text("Submit Request")');
    await expect(page.locator('text=Failed to submit leave.')).toBeVisible();
  });
});
