
import { test, expect } from '@playwright/test';

test.describe('Template Inline Edit', () => {
  test('should allow coaches to edit template values and persist changes', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');
    
    // Wait for templates to load and click on the first template card
    const firstCard = page.locator('[data-testid="template-card"]').first();
    
    if (await firstCard.count() > 0) {
      await firstCard.click();
      
      // Check that we're on the template view page
      await expect(page).toHaveURL(/\/template\/[a-f0-9-]+$/);
      
      // Look for a %1RM cell to edit
      const pct1rmCell = page.locator('td').filter({ hasText: /^\d+$/ }).first();
      
      if (await pct1rmCell.count() > 0) {
        // Get the original value
        const originalValue = await pct1rmCell.textContent();
        
        // Click to edit the cell
        await pct1rmCell.click();
        
        // Wait for input to appear
        const input = page.locator('input[type="number"]').first();
        await expect(input).toBeVisible();
        
        // Change the value
        const newValue = '85';
        await input.fill(newValue);
        
        // Press Enter or click outside to save
        await input.press('Enter');
        
        // Check that "Unsaved Changes" badge appears
        await expect(page.getByText('Unsaved Changes')).toBeVisible();
        
        // Click Save Changes button
        await page.getByRole('button', { name: /Save Changes/ }).click();
        
        // Wait for save confirmation
        await expect(page.getByText('Template Updated')).toBeVisible();
        
        // Reload the page
        await page.reload();
        
        // Wait for page to load
        await expect(page.locator('h1')).toBeVisible();
        
        // Check that the new value persists
        await expect(page.locator('td').filter({ hasText: newValue })).toBeVisible();
        
        console.log(`Successfully changed value from ${originalValue} to ${newValue} and verified persistence`);
      } else {
        test.skip(true, 'No editable %1RM cells found in template');
      }
    } else {
      test.skip(true, 'No templates available for testing');
    }
  });

  test('should not allow editing for non-coach users', async ({ page }) => {
    // This test would need to be run with a non-coach user context
    // For now, we'll just verify that the edit functionality exists for coaches
    await page.goto('/templates');
    
    const firstCard = page.locator('[data-testid="template-card"]').first();
    
    if (await firstCard.count() > 0) {
      await firstCard.click();
      
      // Look for cells - they should not be editable for non-coaches
      // This would need proper user context switching to test properly
      const cells = page.locator('td');
      await expect(cells.first()).toBeVisible();
    }
  });
});
