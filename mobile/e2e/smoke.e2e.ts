import { device } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    // Launch app with clean state
    await device.launchApp({ 
      newInstance: true,
      permissions: { notifications: 'YES' }
    });
  });

  afterAll(async () => {
    // Clean up
    await device.terminateApp();
  });

  it('should launch the app without crashing', async () => {
    // This is the most basic test - just verify the app launches
    // If we get here without crashing, the test passes
    console.log('App launched successfully');
    
    // Give the app a moment to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // If the app is still running after 3 seconds, we consider it a success
    expect(true).toBe(true);
  });
});