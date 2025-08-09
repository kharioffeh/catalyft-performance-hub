import { device, element, by, expect, waitFor } from 'detox';

describe('Basic App Launch', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Simple test to verify app launches - use correct text
    await waitFor(element(by.text('CataLyft')))
      .toExist()
      .withTimeout(15000);
  });

  it('should show initial screen elements', async () => {
    // Test that basic UI elements are present
    // This is a fallback in case specific testIDs aren't working yet
    await waitFor(element(by.type('ScrollView')).atIndex(0))
      .toExist()
      .withTimeout(10000);
  });

  it('should have app container loaded', async () => {
    // Most basic test - check if the main app container exists
    await waitFor(element(by.id('appContainer')))
      .toExist()
      .withTimeout(15000);
  });

  it('should not crash during basic interactions', async () => {
    // Test that the app doesn't crash when we interact with it
    await device.pressBack();
    await device.shake();
    // Just verify the app is still running by checking for any element
    await waitFor(element(by.type('View')).atIndex(0))
      .toExist()
      .withTimeout(5000);
  });
});