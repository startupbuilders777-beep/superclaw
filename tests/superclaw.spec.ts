import { test, expect } from '@playwright/test';

test.describe('SuperClaw E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('landing page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SuperClaw/i);
    await expect(page.getByRole('heading', { name: /SuperClaw/i })).toBeVisible();
  });

  test('can navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).first().click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('can navigate to register page via Get Started', async ({ page }) => {
    await page.getByRole('link', { name: /get started/i }).first().click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('can navigate to register page via Start Free', async ({ page }) => {
    await page.getByRole('link', { name: /start free/i }).click();
    await expect(page).toHaveURL(/.*register/);
  });
});

test.describe('Authentication Flow', () => {
  test('register page has required fields', async ({ page }) => {
    await page.goto('/register');
    
    // Check form fields exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('login page has required fields', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

test.describe('Pricing Page', () => {
  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
  });
});
