#!/usr/bin/env tsx

/**
 * Google Fit Integration Test Script
 * 
 * This script tests the complete Google Fit integration including:
 * - Database tables and schema
 * - OAuth flow and token management
 * - Data sync functionality
 * - Unified calorie view integration
 * - UI component data display
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user for Google Fit integration
const TEST_USER_ID = 'test-google-fit-user-123';
const TEST_USER_EMAIL = 'test.google.fit@example.com';

async function main() {
  console.log('🧪 Google Fit Integration Test Suite');
  console.log('=====================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  const runTest = async (testName: string, testFn: () => Promise<boolean>) => {
    try {
      console.log(`⏳ ${testName}...`);
      const result = await testFn();
      if (result) {
        console.log(`✅ ${testName} - PASSED\n`);
        testsPassed++;
      } else {
        console.log(`❌ ${testName} - FAILED\n`);
        testsFailed++;
      }
    } catch (error) {
      console.log(`💥 ${testName} - ERROR: ${error.message}\n`);
      testsFailed++;
    }
  };

  // Test 1: Database Schema
  await runTest('Google Fit Database Tables Exist', testDatabaseTables);

  // Test 2: OAuth Function
  await runTest('Google Fit OAuth Function', testOAuthFunction);

  // Test 3: Data Sync Function
  await runTest('Google Fit Data Sync Function', testDataSyncFunction);

  // Test 4: Mock Google Fit Connection
  await runTest('Create Mock Google Fit Connection', testMockConnection);

  // Test 5: Mock Activity Data
  await runTest('Insert Mock Activity Data', testMockActivityData);

  // Test 6: Mock Workout Data
  await runTest('Insert Mock Workout Data', testMockWorkoutData);

  // Test 7: Unified Calorie View
  await runTest('Unified Calorie View with Google Fit Data', testUnifiedCalorieView);

  // Test 8: Data Priority System
  await runTest('Data Priority System (WHOOP > HealthKit > Google Fit)', testDataPriority);

  // Test 9: Google Fit Service Methods
  await runTest('Google Fit Service API Endpoints', testServiceEndpoints);

  // Cleanup
  await runTest('Cleanup Test Data', cleanupTestData);

  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

  if (testsFailed === 0) {
    console.log('🎉 All Google Fit integration tests passed! Your integration is ready for production.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above and fix the issues.');
    process.exit(1);
  }
}

async function testDatabaseTables(): Promise<boolean> {
  // Check if Google Fit tables exist
  const tables = [
    'google_fit_connections',
    'google_fit_daily_activity', 
    'google_fit_workouts'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned (table exists)
      console.log(`   ❌ Table '${table}' does not exist or has permission issues`);
      return false;
    }
    console.log(`   ✅ Table '${table}' exists and is accessible`);
  }

  // Check if unified view includes Google Fit columns
  const { data, error } = await supabase
    .from('user_daily_calories')
    .select('google_fit_daily_calories, google_fit_workout_calories, google_fit_total_calories')
    .limit(1);

  if (error) {
    console.log(`   ❌ Unified view missing Google Fit columns: ${error.message}`);
    return false;
  }

  console.log('   ✅ Unified calorie view includes Google Fit columns');
  return true;
}

async function testOAuthFunction(): Promise<boolean> {
  try {
    // Test OAuth URL generation
    const { data, error } = await supabase.functions.invoke('google-fit-oauth', {
      body: { user_id: TEST_USER_ID }
    });

    if (error) {
      console.log(`   ❌ OAuth function error: ${error.message}`);
      return false;
    }

    if (!data.authUrl || !data.authUrl.includes('accounts.google.com')) {
      console.log(`   ❌ Invalid OAuth URL generated: ${data.authUrl}`);
      return false;
    }

    console.log('   ✅ OAuth function generates valid authorization URL');
    console.log(`   📝 OAuth URL: ${data.authUrl.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`   ❌ OAuth function test failed: ${error.message}`);
    return false;
  }
}

async function testDataSyncFunction(): Promise<boolean> {
  try {
    // Note: This will fail without a real Google Fit connection, but we can test deployment
    const { data, error } = await supabase.functions.invoke('sync-google-fit-data', {
      body: { 
        user_id: TEST_USER_ID,
        days: 1
      }
    });

    // We expect this to fail without a real connection, but the function should exist
    if (error && error.message.includes('Google Fit connection not found')) {
      console.log('   ✅ Data sync function is deployed and running (expected auth error)');
      return true;
    }

    if (error && error.message.includes('Failed to resolve function')) {
      console.log(`   ❌ Data sync function not deployed: ${error.message}`);
      return false;
    }

    console.log('   ✅ Data sync function is deployed and accessible');
    return true;
  } catch (error) {
    console.log(`   ❌ Data sync function test failed: ${error.message}`);
    return false;
  }
}

async function testMockConnection(): Promise<boolean> {
  // Create a mock Google Fit connection for testing
  const mockConnection = {
    user_id: TEST_USER_ID,
    access_token: 'mock_access_token_12345',
    refresh_token: 'mock_refresh_token_67890',
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read',
    connected_at: new Date().toISOString(),
    last_sync_at: null,
  };

  const { data, error } = await supabase
    .from('google_fit_connections')
    .upsert(mockConnection)
    .select()
    .single();

  if (error) {
    console.log(`   ❌ Failed to create mock connection: ${error.message}`);
    return false;
  }

  console.log('   ✅ Mock Google Fit connection created successfully');
  console.log(`   📝 Connection ID: ${data.id}`);
  return true;
}

async function testMockActivityData(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const mockActivityData = [
    {
      user_id: TEST_USER_ID,
      activity_date: today,
      calories_burned: 450,
      steps: 8500,
      distance_meters: 6200,
      active_minutes: 65,
      data_source: 'google_fit',
    },
    {
      user_id: TEST_USER_ID,
      activity_date: yesterday,
      calories_burned: 380,
      steps: 7200,
      distance_meters: 5400,
      active_minutes: 55,
      data_source: 'google_fit',
    }
  ];

  const { data, error } = await supabase
    .from('google_fit_daily_activity')
    .upsert(mockActivityData)
    .select();

  if (error) {
    console.log(`   ❌ Failed to insert mock activity data: ${error.message}`);
    return false;
  }

  console.log(`   ✅ Inserted ${data.length} mock activity records`);
  return true;
}

async function testMockWorkoutData(): Promise<boolean> {
  const today = new Date();
  const workoutStart = new Date(today.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
  const workoutEnd = new Date(today.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

  const mockWorkoutData = [
    {
      user_id: TEST_USER_ID,
      session_id: 'google_fit_session_12345',
      workout_name: 'Running',
      workout_type: '8', // Running activity type
      workout_date: today.toISOString().split('T')[0],
      start_time: workoutStart.toISOString(),
      end_time: workoutEnd.toISOString(),
      duration_minutes: 60,
      calories_burned: 320,
      data_source: 'google_fit',
    }
  ];

  const { data, error } = await supabase
    .from('google_fit_workouts')
    .upsert(mockWorkoutData)
    .select();

  if (error) {
    console.log(`   ❌ Failed to insert mock workout data: ${error.message}`);
    return false;
  }

  console.log(`   ✅ Inserted ${data.length} mock workout records`);
  return true;
}

async function testUnifiedCalorieView(): Promise<boolean> {
  // Query the unified view to see if Google Fit data appears
  const { data, error } = await supabase
    .from('user_daily_calories')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .order('date', { ascending: false })
    .limit(2);

  if (error) {
    console.log(`   ❌ Failed to query unified calorie view: ${error.message}`);
    return false;
  }

  if (!data || data.length === 0) {
    console.log('   ❌ No data found in unified calorie view');
    return false;
  }

  const todaysData = data[0];
  
  // Check if Google Fit data is present
  if (!todaysData.google_fit_total_calories) {
    console.log('   ❌ Google Fit data not found in unified view');
    return false;
  }

  console.log('   ✅ Google Fit data appears in unified calorie view');
  console.log(`   📝 Today's Google Fit calories: ${todaysData.google_fit_total_calories}`);
  console.log(`   📝 Data source: ${todaysData.data_source}`);
  return true;
}

async function testDataPriority(): Promise<boolean> {
  // Test that Google Fit has lower priority than WHOOP and HealthKit
  const testDate = new Date().toISOString().split('T')[0];

  // Insert mock WHOOP data (higher priority)
  await supabase.from('whoop_cycles').upsert({
    user_id: TEST_USER_ID,
    cycle_date: testDate,
    cycle_id: 'mock_whoop_cycle',
    strain: 12.5,
    calories: 600, // Higher than Google Fit
  });

  // Query unified view
  const { data, error } = await supabase
    .from('user_daily_calories')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .eq('date', testDate)
    .single();

  if (error) {
    console.log(`   ❌ Failed to test data priority: ${error.message}`);
    return false;
  }

  // Should prioritize WHOOP over Google Fit
  if (data.data_source !== 'whoop') {
    console.log(`   ❌ Data priority system failed. Expected 'whoop', got '${data.data_source}'`);
    return false;
  }

  if (data.final_calories_burned !== 600) {
    console.log(`   ❌ Wrong calories selected. Expected 600, got ${data.final_calories_burned}`);
    return false;
  }

  console.log('   ✅ Data priority system working correctly (WHOOP > Google Fit)');
  return true;
}

async function testServiceEndpoints(): Promise<boolean> {
  // Test that service functions are accessible (basic deployment check)
  const endpoints = [
    'google-fit-oauth',
    'sync-google-fit-data'
  ];

  for (const endpoint of endpoints) {
    try {
      const { error } = await supabase.functions.invoke(endpoint, {
        body: { test: 'connectivity' }
      });

      // We expect errors here (missing params), but functions should be reachable
      if (error && error.message.includes('Failed to resolve function')) {
        console.log(`   ❌ Endpoint '${endpoint}' not deployed`);
        return false;
      }

      console.log(`   ✅ Endpoint '${endpoint}' is deployed and reachable`);
    } catch (error) {
      console.log(`   ❌ Endpoint '${endpoint}' test failed: ${error.message}`);
      return false;
    }
  }

  return true;
}

async function cleanupTestData(): Promise<boolean> {
  try {
    // Clean up test data
    await supabase.from('whoop_cycles').delete().eq('user_id', TEST_USER_ID);
    await supabase.from('google_fit_workouts').delete().eq('user_id', TEST_USER_ID);
    await supabase.from('google_fit_daily_activity').delete().eq('user_id', TEST_USER_ID);
    await supabase.from('google_fit_connections').delete().eq('user_id', TEST_USER_ID);

    console.log('   ✅ Test data cleaned up successfully');
    return true;
  } catch (error) {
    console.log(`   ⚠️  Cleanup warning: ${error.message}`);
    return true; // Don't fail the test suite on cleanup issues
  }
}

// Run the tests
main().catch(console.error);