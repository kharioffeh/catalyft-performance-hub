describe('Launch smoke', () => {
  it('launches the app', async () => {
    await device.launchApp({ newInstance: true });
    // If you have a testID on your first screen, uncomment the next line and set it accordingly:
    // await expect(element(by.id('home-screen'))).toBeVisible();
    await device.takeScreenshot('launched');
  });
});