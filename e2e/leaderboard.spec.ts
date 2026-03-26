import { test, expect } from '@playwright/test';

test.describe('Leaderboard', () => {
  test('displays models in table', async ({ page }) => {
    await page.route('**/leaderboard/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Points Prophet', stat: 'points', roi: 0.12, win_rate: 0.56, total_bets: 350, p_value: 0.003 },
          { id: '2', name: 'Rebound King', stat: 'rebounds', roi: 0.09, win_rate: 0.54, total_bets: 280, p_value: 0.012 },
          { id: '3', name: 'Three Ball', stat: 'threes', roi: -0.02, win_rate: 0.48, total_bets: 200, p_value: 0.15 },
        ]),
      });
    });

    await page.goto('/leaderboard');

    await expect(page.getByText('Model Leaderboard')).toBeVisible();

    // Check table exists with testid
    const table = page.locator('[data-testid="leaderboard-table"]');
    await expect(table).toBeVisible();

    // Check all models are shown
    await expect(page.getByText('Points Prophet')).toBeVisible();
    await expect(page.getByText('Rebound King')).toBeVisible();
    await expect(page.getByText('Three Ball')).toBeVisible();

    // Check ROI values
    await expect(page.getByText('12.0%')).toBeVisible();
    await expect(page.getByText('9.0%')).toBeVisible();
    await expect(page.getByText('-2.0%')).toBeVisible();

    // Check p-values
    await expect(page.getByText('0.0030')).toBeVisible();
    await expect(page.getByText('0.1500')).toBeVisible();
  });

  test('shows empty state when no models', async ({ page }) => {
    await page.route('**/leaderboard/', async (route) => {
      await route.fulfill({ status: 200, body: '[]' });
    });

    await page.goto('/leaderboard');
    await expect(page.getByText('No models available yet.')).toBeVisible();
  });
});
