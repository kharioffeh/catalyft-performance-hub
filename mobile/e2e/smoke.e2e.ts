import { device, element, by, expect } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Just verify the app launches without crashing
    await expect(element(by.text('Dashboard').or(by.text('Training').or(by.text('Analytics'))))).toBeVisible();
  });

  it('should display the main navigation', async () => {
    // Check if navigation tabs are present
    const dashboardTab = element(by.id('tab-Dashboard'));
    const trainingTab = element(by.id('tab-Training'));
    
    // At least one tab should be visible
    await expect(dashboardTab.or(trainingTab)).toBeVisible();
  });
});