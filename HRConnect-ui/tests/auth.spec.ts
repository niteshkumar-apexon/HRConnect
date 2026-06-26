import { test, expect } from '@playwright/test';

const createJwt = (payload: Record<string, string | boolean>) => {
  const base64Url = (value: string) =>
    Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

test.describe('Auth flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows validation errors on empty login form', async ({ page }) => {
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is requi.red')).toBeVisible();
  });

  test('shows validation error for invalid login email', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('securePass1');
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  test('logs in successfully and navigates to dashboard', async ({ page }) => {
    const token = createJwt({
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '123',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'testuser@example.com',
      IsAdmin: 'False',
    });

    await page.route('http://localhost:5243/api/Auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token }),
      })
    );

    await page.getByLabel('Email').fill('testuser@example.com');
    await page.getByLabel('Password').fill('SecurePass123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('shows registration validation errors for empty form', async ({ page }) => {
    await page.goto('/register');
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Full Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=Confirm Password is required')).toBeVisible();
  });

  test('shows password mismatch validation on registration', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('testuser@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password321');
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('registers successfully and returns to login page', async ({ page }) => {
    await page.goto('/register');
    await page.route('http://localhost:5243/api/Auth/register', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Registered successfully' }),
      })
    );

    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePass123');
    await page.getByLabel('Confirm Password').fill('SecurePass123');
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('navigates from login to register page', async ({ page }) => {
    await page.click('text=Register');
    await expect(page).toHaveURL(/\/register$/);
  });
});
