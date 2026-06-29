import { test, expect, apiUrl } from './helpers';

const fillRegister = async (
  page: import('@playwright/test').Page,
  fullName: string,
  email: string,
  password: string,
  confirm: string
) => {
  if (fullName) await page.locator('input[type="text"]').fill(fullName);
  if (email) await page.locator('input[type="email"]').fill(email);
  if (password) await page.locator('input[type="password"]').nth(0).fill(password);
  if (confirm) await page.locator('input[type="password"]').nth(1).fill(confirm);
};

test.describe('Registration page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('registration page loads with all fields', async ({ page }) => {
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').nth(0)).toBeVisible();
    await expect(page.locator('input[type="password"]').nth(1)).toBeVisible();
    await expect(page.locator('button:has-text("Register")')).toBeVisible();
  });

  test('full name required validation', async ({ page }) => {
    await fillRegister(page, '', 'user@example.com', 'Pass@123', 'Pass@123');
    await page.click('button:has-text("Register")');
    await expect(page.getByText('Full Name is required', { exact: true })).toBeVisible();
  });

  test('email format validation', async ({ page }) => {
    await fillRegister(page, 'John Doe', 'invalidEmail', 'Pass@123', 'Pass@123');
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  test('password minimum length validation', async ({ page }) => {
    await fillRegister(page, 'John Doe', 'user@example.com', '12345', '12345');
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('confirm password required validation', async ({ page }) => {
    await fillRegister(page, 'John Doe', 'user@example.com', 'Pass@123', '');
    await page.click('button:has-text("Register")');
    await expect(page.getByText('Confirm Password is required', { exact: true })).toBeVisible();
  });

  test('duplicate email registration shows server error', async ({ page }) => {
    await page.route(apiUrl('/Auth/register'), (route) =>
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Email already exists' }) })
    );
    await fillRegister(page, 'John Doe', 'existing@example.com', 'Pass@123', 'Pass@123');
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  test('live validation clears after valid correction', async ({ page }) => {
    await page.locator('input[type="text"]').fill('J');
    await page.locator('input[type="text"]').fill('');
    await expect(page.getByText('Full Name is required', { exact: true })).toBeVisible();
    await page.locator('input[type="text"]').fill('John Doe');
    await expect(page.getByText('Full Name is required', { exact: true })).toHaveCount(0);
  });

  test('navigate to login from registration page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/\/login$/);
  });
});
