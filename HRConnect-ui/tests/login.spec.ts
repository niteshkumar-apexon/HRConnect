import { test, expect, createJwt, apiUrl } from './helpers';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page loads with email, password and login button', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('password required validation with valid email', async ({ page }) => {
    await page.locator('input[type="email"]').fill('user@example.com');
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('admin user is redirected to /admin', async ({ page }) => {
    const token = createJwt({
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '99',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'admin@example.com',
      IsAdmin: 'True',
    });
    await page.route(apiUrl('/**'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route(apiUrl('/Auth/login'), (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token }) })
    );

    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.route(apiUrl('/Auth/login'), (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    );
    await page.locator('input[type="email"]').fill('user@example.com');
    await page.locator('input[type="password"]').fill('Wrong@123');
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('shows loading state while login request is in progress', async ({ page }) => {
    await page.route(apiUrl('/Auth/login'), async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'No' }) });
    });
    await page.locator('input[type="email"]').fill('user@example.com');
    await page.locator('input[type="password"]').fill('Pass@123');
    await page.click('button:has-text("Login")');
    await expect(page.locator('button:has-text("Logging in...")')).toBeVisible();
  });

  test('old error clears on next login attempt', async ({ page }) => {
    let attempt = 0;
    await page.route(apiUrl('/Auth/login'), (route) => {
      attempt += 1;
      if (attempt === 1) {
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Login failed' }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: createJwt({ 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '1', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'user@example.com', IsAdmin: 'False' }) }) });
      }
    });
    await page.locator('input[type="email"]').fill('user@example.com');
    await page.locator('input[type="password"]').fill('Wrong@123');
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Login failed')).toBeVisible();

    await page.locator('input[type="password"]').fill('Right@123');
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Login failed')).toHaveCount(0);
  });
});
