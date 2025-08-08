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
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      isolatedModules: true
    }],
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|detox)/)',
  ],
  collectCoverageFrom: [
    'e2e/**/*.{ts,js}',
    '!e2e/**/*.d.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/.*\\.backup$',
  ]
};