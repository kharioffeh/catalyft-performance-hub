#!/usr/bin/env tsx

/**
 * Test script for WHOOP integration
 * Run this to verify the WHOOP calorie tracking is working correctly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWhoopIntegration() {
  console.log('🧪 Testing WHOOP Integration...\n');

  try {
    // 1. Check if WHOOP tables exist
    console.log('1. Checking WHOOP tables...');
    
    const { data: cycles, error: cyclesError } = await supabase
      .from('whoop_cycles')
      .select('count')
      .limit(1);
    
    const { data: workouts, error: workoutsError } = await supabase
      .from('whoop_workouts')
      .select('count')
      .limit(1);

    if (cyclesError || workoutsError) {
      console.error('❌ WHOOP tables not found. Run the migration first:');
      console.error('   supabase db reset');
      return;
    }
    
    console.log('✅ WHOOP tables exist');

    // 2. Check for WHOOP tokens
    console.log('\n2. Checking WHOOP connections...');
    
    const { data: tokens, error: tokensError } = await supabase
      .from('whoop_tokens')
      .select('user_id, expires_at')
      .gt('expires_at', new Date().toISOString());

    if (tokensError) {
      console.error('❌ Error checking WHOOP tokens:', tokensError.message);
      return;
    }

    if (!tokens || tokens.length === 0) {
      console.log('⚠️  No active WHOOP connections found');
      console.log('   Users need to connect their WHOOP devices first');
    } else {
      console.log(`✅ Found ${tokens.length} active WHOOP connection(s)`);
    }

    // 3. Test WHOOP sync function
    console.log('\n3. Testing WHOOP sync function...');
    
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/pull-whoop-activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ WHOOP sync function works');
        console.log(`   Cycles synced: ${result.cycles_synced || 0}`);
        console.log(`   Workouts synced: ${result.workouts_synced || 0}`);
      } else {
        console.log('⚠️  WHOOP sync function deployed but returned error');
        console.log(`   Status: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️  WHOOP sync function not deployed or accessible');
      console.log('   Deploy with: supabase functions deploy pull-whoop-activity');
    }

    // 4. Check for sample data
    console.log('\n4. Checking for WHOOP activity data...');
    
    const { data: sampleCycles } = await supabase
      .from('whoop_cycles')
      .select('cycle_date, calories, strain')
      .limit(5)
      .order('cycle_date', { ascending: false });

    const { data: sampleWorkouts } = await supabase
      .from('whoop_workouts')
      .select('workout_date, calories, sport_name')
      .limit(5)
      .order('workout_date', { ascending: false });

    if (sampleCycles && sampleCycles.length > 0) {
      console.log('✅ Found WHOOP cycle data:');
      sampleCycles.forEach(cycle => {
        console.log(`   ${cycle.cycle_date}: ${cycle.calories} cal (strain: ${cycle.strain})`);
      });
    } else {
      console.log('ℹ️  No WHOOP cycle data found (sync may need to run)');
    }

    if (sampleWorkouts && sampleWorkouts.length > 0) {
      console.log('✅ Found WHOOP workout data:');
      sampleWorkouts.forEach(workout => {
        console.log(`   ${workout.workout_date}: ${workout.calories} cal (${workout.sport_name})`);
      });
    } else {
      console.log('ℹ️  No WHOOP workout data found (sync may need to run)');
    }

    console.log('\n🎉 WHOOP Integration Test Complete!');
    
    // Summary and next steps
    console.log('\n📋 Summary:');
    console.log('- Database tables: ✅ Ready');
    console.log(`- Active connections: ${tokens?.length || 0}`);
    console.log(`- Sync function: ${response?.ok ? '✅' : '⚠️'} ${response?.ok ? 'Working' : 'Needs deployment'}`);
    console.log(`- Data available: ${(sampleCycles?.length || 0) + (sampleWorkouts?.length || 0)} records`);

    if (!tokens || tokens.length === 0) {
      console.log('\n🚀 Next Steps:');
      console.log('1. Have users connect their WHOOP devices via the app');
      console.log('2. Run sync manually: POST /functions/v1/pull-whoop-activity');
      console.log('3. Set up daily cron job for automatic syncing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testWhoopIntegration();
}

export { testWhoopIntegration };