import { device, element, by, expect } from 'detox';

describe('Smoke Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('should be able to navigate to dashboard', async () => {
    // Basic navigation smoke test
    await element(by.id('tab-Dashboard')).tap();
    await expect(element(by.id('dashboard-container'))).toBeVisible();
  });

  it('should be able to navigate to training', async () => {
    await element(by.id('tab-Training')).tap();
    await expect(element(by.id('training-container'))).toBeVisible();
  });

  it('should be able to navigate to analytics', async () => {
    await element(by.id('tab-Analytics')).tap();
    await expect(element(by.id('analytics-container'))).toBeVisible();
  });

  it('should be able to navigate to nutrition', async () => {
    await element(by.id('tab-Nutrition')).tap();
    await expect(element(by.id('nutrition-container'))).toBeVisible();
  });

  it('should be able to navigate to settings', async () => {
    await element(by.id('tab-Settings')).tap();
    await expect(element(by.id('settings-container'))).toBeVisible();
  });
});