import { device, element, by, expect, waitFor } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should launch the app successfully', async () => {
    // Wait for any main app element to appear
    // This is a very basic check to ensure the app launches
    await waitFor(element(by.text('CataLyft')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should show app content after launch', async () => {
    // Try to find any text that indicates the app loaded
    // Using a more flexible approach
    try {
      // Try to find dashboard text
      await waitFor(element(by.text('Dashboard')))
        .toBeVisible()
        .withTimeout(5000);
    } catch (e) {
      // If dashboard not found, try to find any other main screen indicator
      await waitFor(element(by.id('dashboard-container')))
        .toExist()
        .withTimeout(5000);
    }
  });
});