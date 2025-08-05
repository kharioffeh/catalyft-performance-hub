#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating E2E Test Setup...\n');

const checks = [
  {
    name: 'Detox configuration file exists',
    check: () => fs.existsSync('.detoxrc.js'),
    fix: 'Detox configuration file is missing. Expected .detoxrc.js in mobile directory.'
  },
  {
    name: 'E2E test files exist',
    check: () => fs.existsSync('e2e/flows.e2e.ts'),
    fix: 'Main test file is missing. Expected e2e/flows.e2e.ts'
  },
  {
    name: 'Test helpers exist',
    check: () => fs.existsSync('e2e/helpers.ts'),
    fix: 'Test helpers file is missing. Expected e2e/helpers.ts'
  },
  {
    name: 'Jest configuration exists',
    check: () => fs.existsSync('e2e/jest.config.js'),
    fix: 'Jest configuration is missing. Expected e2e/jest.config.js'
  },
  {
    name: 'Package.json has Detox scripts',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts['detox:test:ios'];
    },
    fix: 'Detox scripts are missing from package.json'
  },
  {
    name: 'Detox dependency installed',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.devDependencies && pkg.devDependencies.detox;
    },
    fix: 'Detox is not installed. Run: npm install --save-dev detox'
  },
  {
    name: 'TypeScript support configured',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.devDependencies && pkg.devDependencies['ts-jest'];
    },
    fix: 'TypeScript support is missing. Run: npm install --save-dev ts-jest'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   💡 Fix: ${check.fix}\n`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n🎉 All checks passed! E2E setup is ready.\n');
  console.log('Next steps:');
  console.log('1. Make sure iOS Simulator or Android Emulator is available');
  console.log('2. Run: npm install (if you haven\'t already)');
  console.log('3. Build the app: npm run detox:build:ios');
  console.log('4. Run tests: npm run detox:test:ios');
} else {
  console.log('\n⚠️  Some issues found. Please fix the above issues before running tests.');
  process.exit(1);
}