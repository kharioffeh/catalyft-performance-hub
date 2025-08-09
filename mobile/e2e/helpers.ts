import adapter from 'detox/runners/jest/adapter';

jest.setTimeout(120000);

beforeAll(async () => {
  await adapter.beforeAll();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
});
