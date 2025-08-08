import { device, element, by, expect } from 'detox';

describe('Basic App Launch', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Simple test to verify app launches
    await expect(element(by.text('Catalyft'))).toExist();
  });

  it('should show initial screen elements', async () => {
    // Test that basic UI elements are present
    // This is a fallback in case specific testIDs aren't working yet
    await expect(element(by.type('ScrollView')).atIndex(0)).toExist();
  });
});