import { beforeAll, afterAll } from '@jest/globals';

beforeAll(async () => {
  // Additional setup can go here
  console.log('Setting up e2e tests...');
});

afterAll(async () => {
  // Additional cleanup can go here
  console.log('Cleaning up e2e tests...');
});