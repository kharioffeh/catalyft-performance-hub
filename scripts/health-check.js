
#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Check environment variables
function checkEnvVars() {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'OPENAI_KAI_KEY',
    'OPENAI_ARIA_KEY',
    'ABLY_API_KEY'
  ];
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All environment variables present');
  return true;
}

// Test edge functions
async function testEdgeFunctions() {
  console.log('🔍 Testing edge functions...');
  
  const functions = [
    'kai_generate_program',
    'kai_adjust_set', 
    'aria_generate_insights',
    'velocity_aggregate'
  ];
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing Supabase credentials for function testing');
    return false;
  }
  
  for (const functionName of functions) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      
      if (response.status === 404) {
        console.error(`❌ Function ${functionName} not found`);
        return false;
      }
      
      console.log(`✅ Function ${functionName} accessible`);
    } catch (error) {
      console.error(`❌ Function ${functionName} failed:`, error.message);
      return false;
    }
  }
  
  return true;
}

// Test realtime connectivity
async function testRealtimeConnectivity() {
  console.log('🔍 Testing realtime connectivity...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing Supabase credentials for realtime testing');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  return new Promise((resolve) => {
    const channel = supabase.channel('health_check');
    let resolved = false;
    
    // Set timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('❌ Realtime connectivity test timed out');
        resolve(false);
      }
    }, 10000);
    
    channel
      .on('broadcast', { event: 'ping' }, (payload) => {
        if (!resolved && payload.payload.message === 'pong') {
          resolved = true;
          console.log('✅ Realtime connectivity working');
          resolve(true);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Send ping
          channel.send({
            type: 'broadcast',
            event: 'ping',
            payload: { message: 'ping' }
          });
        }
      });
  });
}

// Main health check function
async function runHealthCheck() {
  console.log('🏥 Starting environment health check...\n');
  
  const envCheck = checkEnvVars();
  const functionsCheck = await testEdgeFunctions();
  const realtimeCheck = await testRealtimeConnectivity();
  
  console.log('\n📊 Health Check Results:');
  console.log(`Environment Variables: ${envCheck ? '✅' : '❌'}`);
  console.log(`Edge Functions: ${functionsCheck ? '✅' : '❌'}`);
  console.log(`Realtime Connectivity: ${realtimeCheck ? '✅' : '❌'}`);
  
  const allPassed = envCheck && functionsCheck && realtimeCheck;
  
  if (allPassed) {
    console.log('\n🎉 All health checks passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some health checks failed!');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthCheck().catch((error) => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

export { runHealthCheck };
