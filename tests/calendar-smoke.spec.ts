
import { test, expect } from '@playwright/test';

test.describe('Calendar Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load calendar page and verify basic elements', async ({ page }) => {
    // Login flow - adjust selectors based on your actual auth implementation
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard/calendar
    await page.waitForURL(/\/(dashboard|calendar)/);
    
    // Verify calendar elements are present
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
    await expect(page.locator('.fc-toolbar')).toBeVisible(); // FullCalendar toolbar
  });

  test('should verify event creation and display', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|calendar)/);
    
    // Look for existing events or create new ones
    const events = page.locator('.fc-event');
    const eventCount = await events.count();
    
    // Verify events are displayed if any exist
    if (eventCount > 0) {
      await expect(events.first()).toBeVisible();
    }
    
    // Test event interaction
    if (eventCount > 0) {
      await events.first().click();
      // Verify event details are shown (adjust selector based on your modal/popup)
      await expect(page.locator('[data-testid="event-details"]')).toBeVisible();
    }
  });

  test('should test drag and drop functionality', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|calendar)/);
    
    // Wait for calendar to load
    await page.waitForSelector('.fc-view');
    
    // Find an event to drag
    const event = page.locator('.fc-event').first();
    const eventExists = await event.count() > 0;
    
    if (eventExists) {
      // Get the original position
      const originalPos = await event.boundingBox();
      
      // Find a target time slot (next day)
      const nextDaySlot = page.locator('.fc-timegrid-slot').nth(10); // Arbitrary slot
      const targetPos = await nextDaySlot.boundingBox();
      
      if (originalPos && targetPos) {
        // Perform drag and drop
        await page.mouse.move(originalPos.x + originalPos.width / 2, originalPos.y + originalPos.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetPos.x + targetPos.width / 2, targetPos.y + targetPos.height / 2);
        await page.mouse.up();
        
        // Verify the event moved (this will depend on your implementation)
        await page.waitForTimeout(1000); // Wait for any animations
      }
    }
  });

  test('should verify network requests for session data', async ({ page }) => {
    // Monitor network requests
    const sessionRequests = [];
    page.on('request', request => {
      if (request.url().includes('/sessions') || request.url().includes('supabase')) {
        sessionRequests.push(request);
      }
    });
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|calendar)/);
    
    // Wait for calendar to load
    await page.waitForSelector('.fc-view');
    
    // Verify that session data requests were made
    expect(sessionRequests.length).toBeGreaterThan(0);
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|calendar)/);
    
    // Verify mobile calendar view
    await expect(page.locator('.fc-view')).toBeVisible();
    
    // Check if mobile-specific elements are present
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu).toBeVisible();
    }
  });
});
