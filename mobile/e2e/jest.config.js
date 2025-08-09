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
  preset: 'ts-jest/presets/default',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          target: 'es2017',
          lib: ['es2017'],
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          skipLibCheck: true,
          isolatedModules: true
        }
      }
    }],
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|detox|@jest)/)',
  ],
  collectCoverageFrom: [
    'e2e/**/*.{ts,js}',
    '!e2e/**/*.d.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/.*\\.backup$',
  ],
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: false
    }
  }
};