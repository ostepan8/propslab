import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads with hero section and CTA', async ({ page }) => {
    // Mock API calls
    await page.route('**/stats/global', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_picks: 12500,
          total_models: 42,
          avg_roi: 0.087,
          avg_win_rate: 0.545,
          total_users: 3200,
        }),
      });
    });

    await page.route('**/leaderboard/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Points Prophet', stat: 'points', roi: 0.12, win_rate: 0.56, total_bets: 350, p_value: 0.003 },
          { id: '2', name: 'Rebound King', stat: 'rebounds', roi: 0.09, win_rate: 0.54, total_bets: 280, p_value: 0.012 },
          { id: '3', name: 'Assist Master', stat: 'assists', roi: 0.07, win_rate: 0.52, total_bets: 310, p_value: 0.025 },
        ]),
      });
    });

    await page.goto('/');

    // Hero section
    await expect(page.getByText('NBA Player Props,')).toBeVisible();
    await expect(page.getByText('Backed by Data')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started Free' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Leaderboard' })).toBeVisible();

    // Global stats
    await expect(page.getByText('12,500')).toBeVisible();
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByText('8.7%')).toBeVisible();
    await expect(page.getByText('54.5%')).toBeVisible();

    // Leaderboard preview
    await expect(page.getByText('Points Prophet')).toBeVisible();
    await expect(page.getByText('Rebound King')).toBeVisible();
  });

  test('navbar has login and signup links', async ({ page }) => {
    await page.route('**/stats/global', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.route('**/leaderboard/', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));

    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
    // PropsLab brand link in navbar
    await expect(page.locator('nav').getByText('PropsLab')).toBeVisible();
  });
});
