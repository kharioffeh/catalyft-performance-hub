import { test, expect } from '@playwright/test';

// Demo account credentials - update these with actual test accounts
const COACH_DEMO = {
  email: 'coach-demo@example.com',
  password: 'demo-password-123'
};

const SOLO_DEMO = {
  email: 'solo-demo@example.com', 
  password: 'demo-password-123'
};

test.describe('Role Guard Functionality', () => {
  
  test.describe('Coach Role Experience', () => {
    test.beforeEach(async ({ page }) => {
      // Login as coach
      await page.goto('/login');
      await page.fill('input[type="email"]', COACH_DEMO.email);
      await page.fill('input[type="password"]', COACH_DEMO.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/athletes/); // Should redirect to athletes page
    });

    test('should redirect coach to /athletes by default', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/athletes/);
    });

    test('should show coach-only navigation items', async ({ page }) => {
      // Check that Athletes link is visible
      await expect(page.locator('nav').getByText('Athletes')).toBeVisible();
      
      // Check that Risk Board link is visible
      await expect(page.locator('nav').getByText('Risk Board')).toBeVisible();
    });

    test('should allow access to coach-only pages', async ({ page }) => {
      // Test Athletes page access
      await page.click('nav a[href="/athletes"]');
      await expect(page).toHaveURL(/\/athletes/);
      
      // Test Risk Board page access
      await page.click('nav a[href="/risk-board"]');
      await expect(page).toHaveURL(/\/risk-board/);
    });
  });

  test.describe('Solo Role Experience', () => {
    test.beforeEach(async ({ page }) => {
      // Login as solo user
      await page.goto('/login');
      await page.fill('input[type="email"]', SOLO_DEMO.email);
      await page.fill('input[type="password"]', SOLO_DEMO.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/); // Should redirect to dashboard
    });

    test('should redirect solo user to /dashboard by default', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should NOT show coach-only navigation items', async ({ page }) => {
      // Check that Athletes link is NOT visible
      await expect(page.locator('nav').getByText('Athletes')).not.toBeVisible();
      
      // Check that Risk Board link is NOT visible
      await expect(page.locator('nav').getByText('Risk Board')).not.toBeVisible();
    });

    test('should show solo-specific navigation items', async ({ page }) => {
      // Check that Program link is visible (solo-only)
      await expect(page.locator('nav').getByText('Program')).toBeVisible();
    });

    test('should be redirected away from coach-only pages', async ({ page }) => {
      // Try to access Athletes page directly
      await page.goto('/athletes');
      await expect(page).toHaveURL(/\/dashboard/); // Should be redirected
      
      // Try to access Risk Board page directly
      await page.goto('/risk-board');
      await expect(page).toHaveURL(/\/dashboard/); // Should be redirected
    });

    test('should have access to solo-allowed pages', async ({ page }) => {
      // Test Program page access
      await page.click('nav a[href="/program"]');
      await expect(page).toHaveURL(/\/program/);
      
      // Test Dashboard access
      await page.click('nav a[href="/dashboard"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Common Navigation', () => {
    test('both roles should have access to shared pages', async ({ page }) => {
      // Test with coach account
      await page.goto('/login');
      await page.fill('input[type="email"]', COACH_DEMO.email);
      await page.fill('input[type="password"]', COACH_DEMO.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/athletes/);
      
      // Test Chat access
      await page.click('nav a[href="/chat"]');
      await expect(page).toHaveURL(/\/chat/);
      
      // Test Settings access
      await page.click('nav a[href="/settings"]');
      await expect(page).toHaveURL(/\/settings/);
    });
  });
});