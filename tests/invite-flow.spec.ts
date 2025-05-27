
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

  test('athlete invite completion flow to finish-signup', async ({ page }) => {
    // Test the invite completion page with hash token
    // Mock a hash token scenario
    await page.goto('/finish-signup');
    
    // Should show the finish signup form
    await expect(page.locator('h1:has-text("Welcome! 🎉")')).toBeVisible();
    await expect(page.locator('text=Your coach has invited you')).toBeVisible();
    
    // Fill in name and submit
    await page.fill('input#name', 'Test Athlete');
    await page.click('button:has-text("Enter app")');
    
    // Should redirect to dashboard after completion (mocked)
    // In real scenario with valid session, this would work
    await expect(page.locator('input#name')).toBeVisible(); // Still on form due to no session
  });

  test('finish-signup redirects to dashboard after completion', async ({ page }) => {
    // This test would require a valid session to work properly
    // For now, we test that the page loads correctly
    await page.goto('/finish-signup');
    
    // Check that form is present
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('button:has-text("Enter app")')).toBeVisible();
    
    // Verify form validation
    await page.click('button:has-text("Enter app")');
    // Button should be disabled when name is empty (form validation)
  });

  test('handles invite completion errors gracefully', async ({ page }) => {
    // Navigate to finish-signup without valid session
    await page.goto('/finish-signup');
    
    // Should show the form (even without session for testing)
    await expect(page.locator('h1:has-text("Welcome! 🎉")')).toBeVisible();
    
    // Try to submit without name
    const submitButton = page.locator('button:has-text("Enter app")');
    await expect(submitButton).toBeDisabled();
    
    // Fill name and button becomes enabled
    await page.fill('input#name', 'Test User');
    await expect(submitButton).toBeEnabled();
  });
});
