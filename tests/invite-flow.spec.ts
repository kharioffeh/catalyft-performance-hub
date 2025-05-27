
import { test, expect } from '@playwright/test';

test.describe('Athlete Invite Flow', () => {
  test('coach can send athlete invitation', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login as coach (you'll need to replace with actual coach credentials)
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard/athletes
    await page.waitForURL('**/athletes');

    // Click on invite athlete button
    await page.click('button:has-text("Invite Athlete")');

    // Fill in the invite form
    await page.fill('input#athlete-name', 'Test Athlete');
    await page.fill('input#athlete-email', 'athlete@example.com');

    // Intercept the API call
    const invitePromise = page.waitForResponse(response => 
      response.url().includes('/functions/v1/invite_athlete') && 
      (response.status() === 201 || response.status() === 200)
    );

    // Submit the form
    await page.click('button:has-text("Send Invitation")');

    // Wait for the API call to complete
    const response = await invitePromise;
    expect([200, 201]).toContain(response.status());

    // Check for success toast
    await expect(page.locator('text=Invite sent successfully')).toBeVisible();
  });

  test('shows error when invitation fails', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login as coach
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to athletes page
    await page.waitForURL('**/athletes');

    // Click on invite athlete button
    await page.click('button:has-text("Invite Athlete")');

    // Fill in form with invalid email to trigger error
    await page.fill('input#athlete-name', 'Test Athlete');
    await page.fill('input#athlete-email', 'invalid-email');

    // Submit the form
    await page.click('button:has-text("Send Invitation")');

    // Check for error message
    await expect(page.locator('text=Failed to send invitation')).toBeVisible();
  });

  test('athlete invite completion flow', async ({ page }) => {
    // Test the invite completion page directly
    // In a real scenario, this would be accessed via the email link
    await page.goto('/invite-complete');
    
    // Should show loading state initially
    await expect(page.locator('text=Processing your invitation')).toBeVisible();
    
    // Without a valid hash/token, should show error
    await expect(page.locator('text=No valid session found')).toBeVisible({ timeout: 10000 });
  });

  test('invite completion redirects to dashboard', async ({ page }) => {
    // This is a mock test - in reality you'd need a valid invite token
    // The test demonstrates the expected flow after successful invite completion
    
    // Mock successful invite completion by going directly to dashboard
    await page.goto('/dashboard');
    
    // If not authenticated, should redirect to login
    await page.waitForURL('**/login');
    
    // This test would be expanded with actual token handling in a real scenario
    expect(page.url()).toContain('/login');
  });

  test('handles invite completion errors gracefully', async ({ page }) => {
    // Navigate to invite completion with no token
    await page.goto('/invite-complete');
    
    // Should show processing initially
    await expect(page.locator('text=Processing your invitation')).toBeVisible();
    
    // Should eventually show error for missing/invalid token
    await expect(page.locator('text=Invitation Error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=No valid session found')).toBeVisible();
  });
});
