#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Calculate z-score (standardization)
function calculateZScore(value, mean, std) {
  if (std === 0) return 0; // Avoid division by zero
  return (value - mean) / std;
}

// Calculate stress from readiness (inverse relationship)
function calculateStress(readinessScore) {
  // Convert readiness (0-100) to stress (0-100) with inverse relationship
  // Higher readiness = lower stress
  return Math.max(0, Math.min(100, 100 - readinessScore));
}

async function getUserMetrics() {
  console.log('Fetching user metrics for yesterday...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get aggregated load scores for each user
  const { data: loadData, error: loadError } = await supabase
    .from('muscle_load_daily')
    .select('user_id, load_score')
    .eq('date', yesterdayStr);

  if (loadError) {
    console.error('Error fetching load data:', loadError);
    throw loadError;
  }

  // Aggregate load scores by user (average across all muscles)
  const loadByUser = new Map();
  loadData.forEach(row => {
    const existing = loadByUser.get(row.user_id) || 0;
    const count = loadByUser.has(row.user_id) ? 
      (loadByUser.get(row.user_id + '_count') || 0) + 1 : 1;
    loadByUser.set(row.user_id, existing + row.load_score);
    loadByUser.set(row.user_id + '_count', count);
  });

  // Calculate averages
  for (const [userId, total] of loadByUser.entries()) {
    if (userId.includes('_count')) continue;
    const count = loadByUser.get(userId + '_count') || 1;
    loadByUser.set(userId, total / count);
  }

  // Get readiness and sleep data
  const { data: metricsData, error: metricsError } = await supabase
    .from('readiness')
    .select('user_uuid, readiness_score, sleep_hours, user_name')
    .eq('date', yesterdayStr);

  if (metricsError) {
    console.error('Error fetching metrics data:', metricsError);
    throw metricsError;
  }

  const users = [];
  metricsData.forEach(row => {
    const userId = row.user_uuid;
    const loadScore = loadByUser.get(userId) || 0;
    
    users.push({
      user_id: userId,
      user_name: row.user_name,
      readiness_score: row.readiness_score,
      sleep_hours: row.sleep_hours,
      load_score: loadScore
    });
  });

  return users;
}

async function getHistoricalStats(userId) {
  console.log(`Fetching historical stats for user ${userId}...`);
  
  // Get 30-day rolling averages for load
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: loadHistory, error: loadError } = await supabase
    .from('muscle_load_daily')
    .select('load_score')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

  if (loadError) {
    console.warn(`Warning: Could not fetch load history for user ${userId}`);
    return { load_mean: 0, load_std: 0 };
  }

  const { data: readinessHistory, error: readinessError } = await supabase
    .from('readiness')
    .select('readiness_score')
    .eq('user_uuid', userId);

  if (readinessError) {
    console.warn(`Warning: Could not fetch historical data for user ${userId}`);
  }

  // Calculate rolling stats
  const loadScores = loadHistory?.map(r => r.load_score) || [];
  const loadMean = loadScores.length ? loadScores.reduce((a, b) => a + b, 0) / loadScores.length : 0;
  const loadVariance = loadScores.length ? 
    loadScores.reduce((sum, val) => sum + Math.pow(val - loadMean, 2), 0) / loadScores.length : 0;
  const loadStd = Math.sqrt(loadVariance);

  return {
    load_mean: loadMean,
    load_std: loadStd
  };
}

async function calculateInjuryRisk(user) {
  console.log(`Calculating injury risk for ${user.user_name}...`);
  
  const stats = await getHistoricalStats(user.user_id);
  
  // Risk factors
  const stress = calculateStress(user.readiness_score);
  const sleepDeficit = Math.max(0, 8 - user.sleep_hours);
  const zLoad = calculateZScore(user.load_score, stats.load_mean, stats.load_std);
  
  // Weighted risk calculation (0-100 scale)
  const riskScore = Math.min(100, Math.max(0, 
    (stress * 0.4) + 
    (sleepDeficit * 10) + 
    (Math.abs(zLoad) * 15)
  ));
  
  let riskLevel;
  if (riskScore < 30) riskLevel = 'low';
  else if (riskScore < 60) riskLevel = 'moderate';
  else riskLevel = 'high';
  
  return {
    user_id: user.user_id,
    user_name: user.user_name,
    risk_score: Math.round(riskScore),
    risk_level: riskLevel,
    readiness_score: user.readiness_score,
    sleep_hours: user.sleep_hours,
    load_score: user.load_score,
    load_z_score: zLoad,
    calculated_at: new Date().toISOString()
  };
}

async function saveInjuryRisk(riskData) {
  console.log(`Saving injury risk data for ${riskData.user_name}...`);
  
  const { error } = await supabase
    .from('injury_risk')
    .upsert(riskData, { onConflict: 'user_id,calculated_at' });
    
  if (error) {
    console.error('Error saving injury risk data:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting injury risk calculation...');
    
    const users = await getUserMetrics();
    console.log(`Found ${users.length} users with metrics`);
    
    for (const user of users) {
      const riskData = await calculateInjuryRisk(user);
      await saveInjuryRisk(riskData);
      console.log(`✓ ${user.user_name}: ${riskData.risk_level} risk (${riskData.risk_score}%)`);
    }
    
    console.log('Injury risk calculation completed successfully!');
  } catch (error) {
    console.error('Error in injury risk calculation:', error);
    process.exit(1);
  }
}

main();