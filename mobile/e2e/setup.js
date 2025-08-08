// Use Jest globals directly without importing
global.beforeAll(async () => {
  // Additional setup can go here
  console.log('Setting up e2e tests...');
});

global.afterAll(async () => {
  // Additional cleanup can go here
  console.log('Cleaning up e2e tests...');
});