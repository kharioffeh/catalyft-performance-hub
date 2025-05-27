
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
      response.status() === 201
    );

    // Submit the form
    await page.click('button:has-text("Send Invitation")');

    // Wait for the API call to complete
    const response = await invitePromise;
    expect(response.status()).toBe(201);

    // Check for success toast
    await expect(page.locator('text=Invite sent successfully')).toBeVisible();

    // Optional: Verify the invitation was recorded in the database
    // This would require additional setup to check the athlete_invites table
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
});
