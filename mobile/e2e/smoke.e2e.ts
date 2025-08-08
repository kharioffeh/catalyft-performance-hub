import { device, element, by, expect } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Wait for the app to load
    await expect(element(by.text('CataLyft'))).toBeVisible();
  });

  it('should display the main navigation tabs', async () => {
    // Check if main tabs are present
    await expect(element(by.id('tab-Dashboard'))).toExist();
    await expect(element(by.id('tab-Training'))).toExist();
    await expect(element(by.id('tab-Analytics'))).toExist();
    await expect(element(by.id('tab-Nutrition'))).toExist();
    await expect(element(by.id('tab-Settings'))).toExist();
  });

  it('should be able to navigate to Dashboard', async () => {
    await element(by.id('tab-Dashboard')).tap();
    await expect(element(by.id('dashboard-container'))).toBeVisible();
  });
});