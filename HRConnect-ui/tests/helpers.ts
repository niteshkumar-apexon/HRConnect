import { test as base, type Page } from '@playwright/test';

const API = 'http://localhost:5243/api';

/** Builds an unsigned JWT for client-side decoding only. */
export const createJwt = (payload: Record<string, string | boolean>) => {
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

export const employeeToken = createJwt({
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '1',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'employee@example.com',
  IsAdmin: 'False',
});

export const adminToken = createJwt({
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '99',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'admin@example.com',
  IsAdmin: 'True',
});

/** Pre-seeds localStorage so protected pages render as a logged-in user. */
export const seedAuth = async (
  page: Page,
  user: { token: string; isAdmin: boolean; fullName?: string; email?: string }
) => {
  await page.addInitScript((u) => {
    localStorage.setItem('token', u.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '1',
        email: u.email ?? 'employee@example.com',
        fullName: u.fullName ?? 'Test User',
        isAdmin: u.isAdmin,
      })
    );
  }, user);
};

export const apiUrl = (path: string) => `${API}${path}`;

export { base as test };
export { expect } from '@playwright/test';
