#!/usr/bin/env node

/**
 * API Connection Test Script
 * Tests all external API connections to ensure they're working properly
 */

// Load environment variables
require('dotenv').config();

console.log('🧪 Testing API Connections...\n');

// Test Supabase connection
async function testSupabase() {
  console.log('📊 Testing Supabase connection...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase credentials not found in environment');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Test OpenAI API
async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...');
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('⚠️  OpenAI API key not configured (using placeholder)');
      return false;
    }
    
    // Test with a simple completion
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ OpenAI API connection failed:', response.statusText);
      return false;
    }
    
    console.log('✅ OpenAI API connection successful');
    return true;
  } catch (error) {
    console.log('❌ OpenAI API connection failed:', error.message);
    return false;
  }
}

// Test Ably connection
async function testAbly() {
  console.log('🔄 Testing Ably connection...');
  try {
    const apiKey = process.env.ABLY_API_KEY;
    
    if (!apiKey || apiKey === 'your_ably_api_key_here') {
      console.log('⚠️  Ably API key not configured (using placeholder)');
      return false;
    }
    
    const Ably = require('ably');
    const ably = new Ably.Realtime({ key: apiKey });
    
    return new Promise((resolve) => {
      ably.connection.on('connected', () => {
        console.log('✅ Ably connection successful');
        ably.close();
        resolve(true);
      });
      
      ably.connection.on('failed', (error) => {
        console.log('❌ Ably connection failed:', error.message);
        ably.close();
        resolve(false);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.log('❌ Ably connection timeout');
        ably.close();
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    console.log('❌ Ably connection failed:', error.message);
    return false;
  }
}

// Test Nutritionix API
async function testNutritionix() {
  console.log('🍎 Testing Nutritionix API...');
  try {
    const appId = process.env.NUTRITIONIX_APP_ID;
    const apiKey = process.env.NUTRITIONIX_API_KEY;
    
    if (!appId || appId === 'your_nutritionix_app_id_here' || !apiKey || apiKey === 'your_nutritionix_api_key_here') {
      console.log('⚠️  Nutritionix API not configured (using placeholder)');
      return false;
    }
    
    const response = await fetch('https://trackapi.nutritionix.com/v2/search/instant', {
      method: 'POST',
      headers: {
        'x-app-id': appId,
        'x-app-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'apple'
      })
    });
    
    if (!response.ok) {
      console.log('❌ Nutritionix API connection failed:', response.statusText);
      return false;
    }
    
    console.log('✅ Nutritionix API connection successful');
    return true;
  } catch (error) {
    console.log('❌ Nutritionix API connection failed:', error.message);
    return false;
  }
}

// Test Stripe API
async function testStripe() {
  console.log('💳 Testing Stripe API...');
  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey || publishableKey === 'your_stripe_publishable_key_here') {
      console.log('⚠️  Stripe API not configured (using placeholder)');
      return false;
    }
    
    // Test with a simple API call
    const response = await fetch('https://api.stripe.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${publishableKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Stripe returns 400 for invalid requests, but that means the API is reachable
    if (response.status === 400 || response.status === 200) {
      console.log('✅ Stripe API connection successful');
      return true;
    }
    
    console.log('❌ Stripe API connection failed:', response.statusText);
    return false;
  } catch (error) {
    console.log('❌ Stripe API connection failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting API connection tests...\n');
  
  const results = {
    supabase: await testSupabase(),
    openai: await testOpenAI(),
    ably: await testAbly(),
    nutritionix: await testNutritionix(),
    stripe: await testStripe()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([service, success]) => {
    console.log(`${success ? '✅' : '❌'} ${service.toUpperCase()}: ${success ? 'Connected' : 'Failed'}`);
  });
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${successCount}/${totalCount} services connected`);
  
  if (successCount === totalCount) {
    console.log('🎉 All API connections successful!');
    process.exit(0);
  } else {
    console.log('⚠️  Some API connections failed. Check the configuration.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };