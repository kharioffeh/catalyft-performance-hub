module.exports = {
  testTimeout: 120000,
  testRunner: "jest-circus/runner",
  reporters: ["detox/runners/jest/reporter"],
  setupFilesAfterEnv: ["./setup.js"],
};