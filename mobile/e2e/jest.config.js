/** Jest config for Detox E2E */
module.exports = {
  // rootDir is this folder (mobile/e2e)
  rootDir: __dirname,
  testMatch: ["**/*.e2e.ts", "smoke.e2e.ts"],
  testTimeout: 120000,
  maxWorkers: 1,
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/helpers.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: "<rootDir>/tsconfig.json",
      isolatedModules: true
    }]
  },
  reporters: ["detox/runners/jest/streamlineReporter"]
};
