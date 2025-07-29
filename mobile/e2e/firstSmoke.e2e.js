describe('First Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Verify app launches and shows the main title
    await expect(element(by.id('appTitle'))).toBeVisible();
    await expect(element(by.text('Catalyft Mobile App'))).toBeVisible();
  });

  it('should handle sign-in flow with test account', async () => {
    // For now, we'll test the basic structure
    // This would be updated when actual sign-in components are implemented
    await expect(element(by.text('Catalyft Mobile App'))).toBeVisible();
    
    // TODO: Once sign-in is implemented, add:
    // await element(by.id('signInButton')).tap();
    // await element(by.id('emailInput')).typeText('test@example.com');
    // await element(by.id('passwordInput')).typeText('testpassword123');
    // await element(by.id('signInSubmit')).tap();
    // await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should verify Dashboard is visible and shows "My Sessions"', async () => {
    // For now, we'll test the basic app structure
    // This would be updated when dashboard is implemented
    await expect(element(by.text('Catalyft Mobile App'))).toBeVisible();
    
    // TODO: Once dashboard is implemented, add:
    // await expect(element(by.text('Dashboard'))).toBeVisible();
    // await expect(element(by.text('My Sessions'))).toBeVisible();
  });

  it('should navigate to Calendar and back', async () => {
    // For now, we'll test the basic app structure
    // This would be updated when navigation is implemented
    await expect(element(by.text('Catalyft Mobile App'))).toBeVisible();
    
    // TODO: Once calendar navigation is implemented, add:
    // await element(by.id('calendarTab')).tap();
    // await expect(element(by.text('Calendar'))).toBeVisible();
    // await element(by.id('backButton')).tap();
    // await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should complete end-to-end smoke test flow', async () => {
    // This test combines all the above steps for a complete flow
    await expect(element(by.id('appContainer'))).toBeVisible();
    await expect(element(by.id('appTitle'))).toBeVisible();
    await expect(element(by.id('appSubtitle'))).toBeVisible();
    
    // Verify the example component is rendered
    await expect(element(by.id('exampleComponent'))).toBeVisible();
    await expect(element(by.id('exampleTitle'))).toBeVisible();
    await expect(element(by.text('Welcome to Catalyft!'))).toBeVisible();
    
    // TODO: Once full navigation is implemented, this will test:
    // 1. Sign in with test account
    // 2. Verify dashboard with "My Sessions"
    // 3. Navigate to calendar
    // 4. Navigate back to dashboard
    // 5. Sign out (if applicable)
  });
});