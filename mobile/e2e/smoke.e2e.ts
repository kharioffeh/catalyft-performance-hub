import { device, element, by, expect, waitFor } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Wait for the app to load - look for the main title
    await waitFor(element(by.text('CataLyft')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should display the main navigation tabs', async () => {
    // Check if main tabs are present with longer timeout
    await waitFor(element(by.id('tab-Dashboard')))
      .toExist()
      .withTimeout(10000);
    await expect(element(by.id('tab-Training'))).toExist();
    await expect(element(by.id('tab-Analytics'))).toExist();
    await expect(element(by.id('tab-Nutrition'))).toExist();
    await expect(element(by.id('tab-Settings'))).toExist();
  });

  it('should be able to navigate to Dashboard', async () => {
    await element(by.id('tab-Dashboard')).tap();
    await waitFor(element(by.id('dashboard-container')))
      .toBeVisible()
      .withTimeout(10000);
  });
});