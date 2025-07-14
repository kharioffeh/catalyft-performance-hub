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

async function getAthleteMetrics() {
  console.log('Fetching athlete metrics for yesterday...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get aggregated load scores for each athlete
  const { data: loadData, error: loadError } = await supabase
    .from('muscle_load_daily')
    .select('user_id, load_score')
    .eq('date', yesterdayStr);

  if (loadError) {
    console.error('Error fetching load data:', loadError);
    throw loadError;
  }

  // Aggregate load scores by athlete (average across all muscles)
  const loadByAthlete = new Map();
  loadData?.forEach(row => {
    const existing = loadByAthlete.get(row.user_id) || 0;
    const count = loadByAthlete.has(row.user_id) ? 
      (loadByAthlete.get(row.user_id + '_count') || 0) + 1 : 1;
    loadByAthlete.set(row.user_id, existing + row.load_score);
    loadByAthlete.set(row.user_id + '_count', count);
  });

  // Calculate averages
  for (const [userId, total] of loadByAthlete.entries()) {
    if (userId.endsWith('_count')) continue;
    const count = loadByAthlete.get(userId + '_count') || 1;
    loadByAthlete.set(userId, total / count);
  }

  // Get sleep and readiness data
  const { data: metricsData, error: metricsError } = await supabase
    .from('aria_digest_metrics_v')
    .select('*');

  if (metricsError) {
    console.error('Error fetching metrics data:', metricsError);
    throw metricsError;
  }

  const athletes = [];
  
  metricsData?.forEach(row => {
    const metrics = row.metrics;
    const athleteId = row.athlete_uuid;
    const loadScore = loadByAthlete.get(athleteId) || 0;
    
    athletes.push({
      athlete_id: athleteId,
      athlete_name: metrics.athlete_name,
      load_score: loadScore,
      sleep_hours: metrics.sleep_hours || 0,
      readiness_score: metrics.readiness || 0
    });
  });

  return athletes;
}

async function getHistoricalStats(athleteId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Get historical load data
  const { data: loadHistory, error: loadError } = await supabase
    .from('muscle_load_daily')
    .select('load_score, date')
    .eq('user_id', athleteId)
    .gte('date', thirtyDaysAgoStr);

  // Get historical sleep and readiness data
  const { data: metricsHistory, error: metricsError } = await supabase
    .from('aria_digest_metrics_v')
    .select('*')
    .eq('athlete_uuid', athleteId);

  if (loadError || metricsError) {
    console.warn(`Warning: Could not fetch historical data for athlete ${athleteId}`);
    // Return default stats if historical data is unavailable
    return {
      load_mean: 50,
      load_std: 15,
      sleep_mean: 8,
      sleep_std: 1.5,
      stress_mean: 30,
      stress_std: 15
    };
  }

  // Calculate load statistics
  const loadScores = loadHistory?.map(row => row.load_score) || [];
  const loadMean = loadScores.length > 0 ? 
    loadScores.reduce((sum, val) => sum + val, 0) / loadScores.length : 50;
  const loadVariance = loadScores.length > 1 ? 
    loadScores.reduce((sum, val) => sum + Math.pow(val - loadMean, 2), 0) / (loadScores.length - 1) : 225;
  const loadStd = Math.sqrt(loadVariance);

  // For sleep and stress, we'll use simplified historical calculation
  // In a real implementation, you'd want proper historical sleep/readiness data
  const sleepMean = 8; // Default assumption
  const sleepStd = 1.5;
  const stressMean = 30;
  const stressStd = 15;

  return {
    load_mean: loadMean,
    load_std: Math.max(1, loadStd), // Ensure std is at least 1
    sleep_mean: sleepMean,
    sleep_std: sleepStd,
    stress_mean: stressMean,
    stress_std: stressStd
  };
}

async function calculateInjuryRisk(athlete) {
  console.log(`Calculating injury risk for ${athlete.athlete_name}...`);
  
  // Get historical statistics for z-score calculation
  const stats = await getHistoricalStats(athlete.athlete_id);
  
  // Calculate stress from readiness
  const stress = calculateStress(athlete.readiness_score);
  
  // Calculate sleep deficit (assuming 8 hours is optimal)
  const sleepDeficit = Math.max(0, 8 - athlete.sleep_hours);
  
  // Calculate z-scores
  const zLoad = calculateZScore(athlete.load_score, stats.load_mean, stats.load_std);
  const zSleepDeficit = calculateZScore(sleepDeficit, 1, stats.sleep_std); // 1 hour average deficit
  const zStress = calculateZScore(stress, stats.stress_mean, stats.stress_std);
  
  console.log(`  Load: ${athlete.load_score} (z: ${zLoad.toFixed(2)})`);
  console.log(`  Sleep deficit: ${sleepDeficit} hours (z: ${zSleepDeficit.toFixed(2)})`);
  console.log(`  Stress: ${stress} (z: ${zStress.toFixed(2)})`);
  
  // Calculate composite risk score
  const risk = zLoad + zSleepDeficit + zStress;
  
  console.log(`  Final risk score: ${risk.toFixed(2)}`);
  
  return risk;
}

async function insertAlert(athleteId, athleteName, riskScore) {
  console.log(`Inserting high injury risk alert for ${athleteName} (risk: ${riskScore.toFixed(2)})`);
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: athleteId,
      type: 'system',
      title: 'High Injury Risk Alert',
      body: `Athlete ${athleteName} has an elevated injury risk score of ${riskScore.toFixed(2)}. Consider adjusting training load, ensuring adequate rest, or implementing recovery protocols.`,
      read: false
    });

  if (error) {
    console.error('Error inserting alert:', error);
    throw error;
  }
  
  console.log(`Alert successfully inserted for ${athleteName}`);
}

async function main() {
  try {
    console.log('Starting injury risk assessment...');
    console.log('='.repeat(50));
    
    const athletes = await getAthleteMetrics();
    console.log(`Found ${athletes.length} athletes to assess`);
    
    let alertsGenerated = 0;
    
    for (const athlete of athletes) {
      const riskScore = await calculateInjuryRisk(athlete);
      
      // Insert alert if risk score >= 75
      if (riskScore >= 75) {
        await insertAlert(athlete.athlete_id, athlete.athlete_name, riskScore);
        alertsGenerated++;
      }
    }
    
    console.log('='.repeat(50));
    console.log(`Assessment complete. Generated ${alertsGenerated} alerts.`);
    
  } catch (error) {
    console.error('Error in injury risk assessment:', error);
    process.exit(1);
  }
}

// Run the assessment
main();