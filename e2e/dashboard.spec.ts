import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('shows picks and stats when authenticated', async ({ page }) => {
    // Set auth state before navigating
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('propslab_token', 'test-jwt-token');
      localStorage.setItem(
        'propslab_user',
        JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User', tier: 'pro' })
      );
    });

    // Mock API calls
    await page.route('**/picks/today', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'p1',
            model_id: 'm1',
            model_name: 'Points Prophet',
            player_name: 'LeBron James',
            stat: 'points',
            line: 25.5,
            direction: 'over',
            confidence: 0.72,
            odds: -110,
            game: 'LAL vs BOS',
            game_time: '2024-01-15T19:30:00Z',
            result: null,
            actual_value: null,
          },
        ]),
      });
    });

    await page.route('**/paper-trades/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_trades: 25,
          wins: 15,
          losses: 9,
          pushes: 1,
          total_staked: 250,
          total_pnl: 47.5,
          roi: 0.19,
          win_rate: 0.6,
        }),
      });
    });

    await page.goto('/dashboard');

    // Check welcome message
    await expect(page.getByText('Welcome back, Test User')).toBeVisible();
    await expect(page.getByText('pro tier')).toBeVisible();

    // Check paper trade stats
    await expect(page.getByText('25', { exact: true })).toBeVisible();
    await expect(page.getByText('+$47.50')).toBeVisible();

    // Check picks
    await expect(page.getByText('LeBron James')).toBeVisible();
    await expect(page.getByText('OVER')).toBeVisible();
    await expect(page.getByText('25.5')).toBeVisible();
  });

  test('shows upgrade prompt for free tier', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('propslab_token', 'test-jwt-token');
      localStorage.setItem(
        'propslab_user',
        JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User', tier: 'free' })
      );
    });

    await page.route('**/picks/today', async (route) => {
      await route.fulfill({ status: 403, body: JSON.stringify({ detail: 'Upgrade required' }) });
    });

    await page.route('**/paper-trades/stats', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ total_trades: 0, wins: 0, losses: 0, pushes: 0, total_staked: 0, total_pnl: 0, roi: 0, win_rate: 0 }),
      });
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Upgrade Required')).toBeVisible();
    await expect(page.getByText('Unlock Full Access')).toBeVisible();
  });
});
