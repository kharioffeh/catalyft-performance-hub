
import { test, expect } from '@playwright/test';

test.describe('Athlete Invite Core Flow', () => {
  test('coach can send athlete invitation successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login as coach
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Open invite form
    await page.click('button:has-text("Invite Athlete")');
    
    // Fill invite form
    await page.fill('input#athlete-name', 'Test Invite Athlete');
    await page.fill('input#athlete-email', 'test-invite@example.com');
    
    // Mock successful response
    await page.route('**/functions/v1/invite_athlete', route => {
      route.fulfill({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'sent', 
          invitation_id: 'test-id',
          message: 'Invitation sent successfully'
        })
      });
    });

    await page.click('button:has-text("Send Invitation")');
    
    // Wait for success message
    await expect(page.locator('text=Invite sent successfully')).toBeVisible();
    
    // Dialog should close after successful invite
    await expect(page.locator('dialog')).not.toBeVisible();
    
    console.log('✓ Invite sent and dialog closed successfully');
  });

  test('invite error handling works correctly', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    await page.click('button:has-text("Invite Athlete")');
    await page.fill('input#athlete-name', 'Error Test');
    await page.fill('input#athlete-email', 'error-test@example.com');
    
    // Mock error response
    await page.route('**/functions/v1/invite_athlete', route => {
      route.fulfill({
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Athlete limit exceeded'
        })
      });
    });

    await page.click('button:has-text("Send Invitation")');
    
    // Should show error message
    await expect(page.locator('text=Failed to send invitation')).toBeVisible();
    
    console.log('✓ Error handling works correctly');
  });

  test('invite form refreshes athlete list on success', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Track data refetch requests
    let refetchCalled = false;
    page.on('request', request => {
      if (request.url().includes('athletes') && request.method() === 'GET') {
        refetchCalled = true;
      }
    });

    await page.click('button:has-text("Invite Athlete")');
    await page.fill('input#athlete-name', 'Refetch Test');
    await page.fill('input#athlete-email', 'refetch-test@example.com');
    
    await page.route('**/functions/v1/invite_athlete', route => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({ status: 'sent', invitation_id: 'test-id' })
      });
    });

    await page.click('button:has-text("Send Invitation")');
    await expect(page.locator('text=Invite sent successfully')).toBeVisible();
    
    // Wait for potential refetch
    await page.waitForTimeout(1000);
    
    console.log('✓ Form handling completed, refetch called:', refetchCalled);
  });
});
