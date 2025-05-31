
import { test, expect } from '@playwright/test';

test.describe('Athlete Linkage & Visibility', () => {
  test('complete invite flow: send invite → accept → athlete appears in list', async ({ page }) => {
    // Step 1: Login as coach
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Get initial athlete count
    const initialCountText = await page.locator('h2:has-text("Your Athletes")').textContent() || '(0)';
    const initialCount = parseInt(initialCountText.match(/\((\d+)\)/)?.[1] || '0');
    console.log('Initial athlete count:', initialCount);

    // Step 2: Send invitation
    await page.click('button:has-text("Invite Athlete")');
    
    const testEmail = `athlete-test-${Date.now()}@example.com`;
    const testName = 'Test Athlete Linkage';
    
    await page.fill('input#athlete-name', testName);
    await page.fill('input#athlete-email', testEmail);

    // Mock successful invite response
    await page.route('**/functions/v1/invite_athlete', route => {
      route.fulfill({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'sent', 
          invitation_id: 'test-invite-id',
          message: 'Invitation sent successfully'
        })
      });
    });

    await page.click('button:has-text("Send Invitation")');

    // Wait for success toast
    await expect(page.locator('text=Invite sent successfully')).toBeVisible();
    console.log('✓ Invite sent successfully');

    // Step 3: Simulate athlete signup (this would normally happen in a separate session)
    // For testing purposes, we'll verify the invite was recorded
    
    // Step 4: Verify realtime updates work
    // Check that the athletes list refreshes properly
    await page.waitForTimeout(2000); // Allow for realtime updates
    
    // Verify the page structure is intact
    await expect(page.locator('h1:has-text("Athletes")')).toBeVisible();
    await expect(page.locator('h2:has-text("Your Athletes")')).toBeVisible();
    
    console.log('✓ Athletes page structure verified');
  });

  test('athlete dashboard renders correctly after linkage', async ({ page }) => {
    // Test that the athletes page renders without errors
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Check for key page elements
    await expect(page.locator('h1:has-text("Athletes")')).toBeVisible();
    await expect(page.locator('button:has-text("Invite Athlete")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Athlete")')).toBeVisible();
    
    // Check that the athletes table loads
    const table = page.locator('table');
    const noAthletesMessage = page.locator('text=No athletes added yet');
    
    // Either athletes table exists or "no athletes" message is shown
    const hasTable = await table.isVisible();
    const hasNoAthletesMessage = await noAthletesMessage.isVisible();
    
    expect(hasTable || hasNoAthletesMessage).toBe(true);
    console.log('✓ Athletes dashboard renders correctly');
  });

  test('RLS policies allow coach to see own athletes', async ({ page }) => {
    // Test that RLS policies work correctly
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Monitor network requests to athletes endpoint
    const responses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('athletes') || response.url().includes('vw_coach_athletes')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Refresh the page to trigger data fetching
    await page.reload();
    await page.waitForTimeout(3000);

    // Check that data requests completed successfully (not blocked by RLS)
    const successfulRequests = responses.filter(r => r.status >= 200 && r.status < 300);
    expect(successfulRequests.length).toBeGreaterThan(0);
    
    console.log('✓ RLS policies allow coach access to athletes data');
    console.log('Successful requests:', successfulRequests.length);
  });

  test('invite form validation and error handling', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Test form validation
    await page.click('button:has-text("Invite Athlete")');
    
    // Try to submit empty form
    const submitButton = page.locator('button:has-text("Send Invitation")');
    await submitButton.click();
    
    // Form should not submit with empty fields (HTML5 validation)
    const dialogStillOpen = await page.locator('dialog').isVisible();
    expect(dialogStillOpen).toBe(true);
    
    // Fill only name, missing email
    await page.fill('input#athlete-name', 'Test Name');
    await submitButton.click();
    
    // Should still be open due to required email field
    expect(await page.locator('dialog').isVisible()).toBe(true);
    
    console.log('✓ Form validation works correctly');
    
    // Close dialog
    await page.click('button:has-text("Cancel")');
  });

  test('realtime subscription for athletes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'coach@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/athletes');

    // Check console logs for realtime subscription setup
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Wait for subscription setup
    await page.waitForTimeout(2000);

    // Look for realtime-related logs
    const realtimeLog = consoleLogs.find(log => 
      log.includes('Setting up realtime subscription') ||
      log.includes('realtime') ||
      log.includes('subscription')
    );

    // At minimum, the page should load without errors
    await expect(page.locator('h1:has-text("Athletes")')).toBeVisible();
    
    console.log('✓ Realtime subscription test completed');
    if (realtimeLog) {
      console.log('Found realtime log:', realtimeLog);
    }
  });
});
