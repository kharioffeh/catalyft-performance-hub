module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.{js,ts}'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['default'],
  testEnvironment: './e2e/init.js',
  testRunner: 'jest-circus/runner',
  verbose: true,
  setupFilesAfterEnv: ['./e2e/setup.js'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};