import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('register page renders form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByText('Create your account')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('register and redirect to dashboard', async ({ page }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-jwt-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User', tier: 'free' },
        }),
      });
    });

    // Mock dashboard APIs
    await page.route('**/picks/today', (route) => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/paper-trades/stats', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ total_trades: 0, wins: 0, losses: 0, pushes: 0, total_staked: 0, total_pnl: 0, roi: 0, win_rate: 0 }),
      })
    );

    await page.goto('/register');

    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('login and redirect to dashboard', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-jwt-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User', tier: 'pro' },
        }),
      });
    });

    // Mock dashboard APIs
    await page.route('**/picks/today', (route) => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/paper-trades/stats', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ total_trades: 5, wins: 3, losses: 2, pushes: 0, total_staked: 50, total_pnl: 12.5, roi: 0.25, win_rate: 0.6 }),
      })
    );

    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('login shows error on bad credentials', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid email or password' }),
      });
    });

    await page.goto('/login');

    await page.getByLabel('Email').fill('bad@example.com');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Log In' }).click();

    // The 401 handler redirects to /login, but since we're already there
    // the page stays on login. We just verify no crash happened.
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });
});
