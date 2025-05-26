
import { test, expect } from '@playwright/test';

const routes = ['/dashboard', '/coach', '/calendar', '/workout', '/settings'];

const viewports = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'Pixel 7', width: 412, height: 915 },
  { name: 'Desktop', width: 1280, height: 800 }
];

test.describe('Responsive Design Tests', () => {
  viewports.forEach(viewport => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        // Mock authentication
        await page.goto('/login');
        // Add login steps here if needed
      });

      routes.forEach(route => {
        test(`${route} renders correctly`, async ({ page }) => {
          await page.goto(route);
          
          // Check no horizontal scroll
          const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
          const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
          expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 1); // Allow 1px tolerance
          
          // Check navigation is visible
          if (viewport.width < 640) {
            // Mobile: check bottom nav
            await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
          } else {
            // Desktop: check sidebar
            await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
          }
          
          // Take screenshot
          await page.screenshot({ 
            path: `tests/screenshots/${viewport.name.toLowerCase().replace(' ', '-')}-${route.replace('/', '')}.png`,
            fullPage: true 
          });
        });
      });

      test('calendar view changes on mobile', async ({ page }) => {
        await page.goto('/calendar');
        
        if (viewport.width < 640) {
          // Mobile should use list view
          await expect(page.locator('.fc-listWeek-view')).toBeVisible();
        } else {
          // Desktop should use timeline view
          await expect(page.locator('.fc-timelineWeek-view')).toBeVisible();
        }
      });

      test('touch targets are adequate', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Check button sizes
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          const box = await button.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
          }
        }
      });
    });
  });
});
