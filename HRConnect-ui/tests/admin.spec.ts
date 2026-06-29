import { test, expect, adminToken, seedAuth, apiUrl } from './helpers';

const employees = [
  { id: 'e1', userId: 'u1', fullName: 'Shivam Kumar', department: 'Engineering', designation: 'Developer', joiningDate: '2024-01-10T00:00:00' },
];
const users = [
  { id: 'u1', email: 'shivam@example.com', fullName: 'Shivam Kumar', designation: 'Developer', department: 'Engineering', isEmployeeCreated: true },
  { id: 'u2', email: 'aman@example.com', fullName: 'Aman Parab', isEmployeeCreated: false },
];
const pending = [
  { id: 'l1', employeeName: 'aman parab', leaveType: 'Sick', startDate: '2026-07-01T00:00:00', endDate: '2026-07-02T00:00:00', totalDays: 2, status: 'Pending' },
];

const mockAdmin = async (page: import('@playwright/test').Page) => {
  await seedAuth(page, { token: adminToken, isAdmin: true, fullName: 'Admin', email: 'admin@example.com' });
  await page.route(apiUrl('/Employees'), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(employees) }));
  await page.route(apiUrl('/Employees/user-report**'), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(users) }));
  await page.route(apiUrl('/Employees/available-users'), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([users[1]]) }));
  await page.route(apiUrl('/leaves/admin/pending'), (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pending) }));
};

test.describe('Admin panel', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdmin(page);
    await page.goto('/admin');
  });

  test('shows Admin Panel title and Logout button', async ({ page }) => {
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('three tabs are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Employees")')).toBeVisible();
    await expect(page.locator('button:has-text("All Users")')).toBeVisible();
    await expect(page.locator('button:has-text("Leave Requests")')).toBeVisible();
  });

  test('employees tab shows header count and add button', async ({ page }) => {
    await expect(page.locator('text=All Employees')).toBeVisible();
    await expect(page.locator('button:has-text("Add Employee")')).toBeVisible();
  });

  test('clicking +Add Employee opens new employee form', async ({ page }) => {
    await page.click('button:has-text("Add Employee")');
    await expect(page.locator('text=New Employee')).toBeVisible();
  });

  test('employee table columns are correct', async ({ page }) => {
    for (const h of ['Name', 'Department', 'Designation', 'Joining Date', 'Actions']) {
      await expect(page.locator(`th:has-text("${h}")`)).toBeVisible();
    }
  });

  test('search filters employees by name', async ({ page }) => {
    await page.fill('input[placeholder="Search employees..."]', 'Shivam');
    await expect(page.locator('td:has-text("Shivam Kumar")')).toBeVisible();
  });

  test('edit button opens edit employee form', async ({ page }) => {
    await page.click('button:has-text("Edit")');
    await expect(page.locator('text=Edit Employee')).toBeVisible();
  });

  test('all users tab shows search and table columns', async ({ page }) => {
    await page.click('button:has-text("All Users")');
    await expect(page.locator('input[placeholder="Search users..."]')).toBeVisible();
    for (const h of ['Username', 'Full Name', 'Is Employee Created']) {
      await expect(page.locator(`th:has-text("${h}")`)).toBeVisible();
    }
  });

  test('leave requests tab shows pending heading and columns', async ({ page }) => {
    await page.click('button:has-text("Leave Requests")');
    await expect(page.locator('text=Pending Leave Requests')).toBeVisible();
    for (const h of ['Employee', 'Type', 'No Of Days', 'Status', 'Actions']) {
      await expect(page.locator(`th:has-text("${h}")`)).toBeVisible();
    }
  });

  test('reject shows confirmation popup and cancel keeps pending', async ({ page }) => {
    await page.click('button:has-text("Leave Requests")');
    page.on('dialog', (d) => {
      expect(d.message()).toContain('Are you sure you want to reject this leave request?');
      d.dismiss();
    });
    await page.click('button:has-text("Reject")');
    await expect(page.locator('td:has-text("Pending")')).toBeVisible();
  });

  test('logout redirects to login', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login$/);
  });
});
