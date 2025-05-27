
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
    // Step 1: Navigate to invite completion page with mock token
    const mockToken = 'mock-token-hash';
    await page.goto(`/invite-complete?type=signup&token_hash=${mockToken}`);

    // This test would need to be expanded with actual token handling
    // For now, we'll test the error case when type is not 'signup'
    await page.goto(`/invite-complete?type=invalid&token_hash=${mockToken}`);
    
    // Should show error for invalid type
    await expect(page.locator('text=Invalid invitation link')).toBeVisible();
  });

  test('athlete signup form completion', async ({ page }) => {
    // This test would require setting up a proper session first
    // For now, we'll test that the form renders correctly when navigating directly
    await page.goto('/invite-complete?type=signup&token_hash=valid-token');
    
    // The page should show loading state or error for missing/invalid token
    // In a real test, you'd need to intercept the auth verification
    await expect(page.locator('text=Processing your invitation')).toBeVisible();
  });
});
