import { test, expect } from '@playwright/test';

test.describe('SuperClaw E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page
    await page.goto('/');
  });

  test('landing page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SuperClaw/i);
    await expect(page.getByRole('heading', { name: /superclaw/i })).toBeVisible();
  });

  test('can navigate to pricing page', async ({ page }) => {
    await page.getByRole('link', { name: /pricing/i }).first().click();
    await expect(page).toHaveURL(/.*pricing/);
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
  });

  test('can navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('can navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).first().click();
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('register page has required fields', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('login page has required fields', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});

test.describe('Pricing Page', () => {
  test('displays pricing tiers', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for pricing tier headings
    await expect(page.getByRole('heading', { name: /starter/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /pro/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /agency/i })).toBeVisible();
  });

  test('shows CTA buttons for each tier', async ({ page }) => {
    await page.goto('/pricing');
    
    // Should have Get Started buttons
    const getStartedButtons = page.getByRole('link', { name: /get started/i });
    await expect(getStartedButtons).toHaveCount(3);
  });
});
