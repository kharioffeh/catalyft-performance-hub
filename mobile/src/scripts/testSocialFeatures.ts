#!/usr/bin/env node

/**
 * Social Features Test Execution Script
 * Run this script to execute all testing phases for social features
 * 
 * Usage: npx ts-node src/scripts/testSocialFeatures.ts
 */

import { socialTestRunner } from '../utils/socialTestRunner';

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║         CATALYFT SOCIAL FEATURES TEST SUITE          ║');
console.log('║                                                       ║');
console.log('║  This will execute all 5 testing phases:             ║');
console.log('║  1. Core Functionality Testing                       ║');
console.log('║  2. Performance Testing                              ║');
console.log('║  3. Edge Cases & Error Handling                      ║');
console.log('║  4. Integration Testing                              ║');
console.log('║  5. Final Polish & Cleanup                           ║');
console.log('╚═══════════════════════════════════════════════════════╝');
console.log('');

async function runTests() {
  try {
    // Execute all test phases
    await socialTestRunner.runAllPhases();
    
    console.log('\n📊 Test execution completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test execution failed with error:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();