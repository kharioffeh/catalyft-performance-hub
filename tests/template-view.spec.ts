
import { test, expect } from '@playwright/test';

test.describe('Template View Page', () => {
  test('should navigate to template view and display content', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');
    
    // Wait for templates to load and click on the first template card
    const firstCard = page.locator('[data-testid="template-card"]').first();
    if (await firstCard.count() > 0) {
      await firstCard.click();
      
      // Check that we're on the template view page
      await expect(page).toHaveURL(/\/template\/[a-f0-9-]+$/);
      
      // Check that the page has a heading
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for week navigation
      await expect(page.getByText(/Week \d+ \//)).toBeVisible();
    } else {
      // Skip test if no templates available
      test.skip(true, 'No templates available for testing');
    }
  });
});
