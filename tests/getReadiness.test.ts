/**
 * @jest-environment node
 */
import { Pool } from 'pg';

describe('getReadiness Function Test', () => {
  let db: Pool;
  const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
  const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';
  const testDate = '2025-08-03';

  beforeAll(async () => {
    // Connect to local PostgreSQL database
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '54322'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  });

  afterAll(async () => {
    await db.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await db.query('DELETE FROM metrics WHERE user_id = $1 AND date = $2', [testUserId, testDate]);
    await db.query('DELETE FROM soreness WHERE user_id = $1 AND date = $2', [testUserId, testDate]);
    await db.query('DELETE FROM jump_tests WHERE user_id = $1 AND date = $2', [testUserId, testDate]);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await db.query('DELETE FROM metrics WHERE user_id = $1 AND date = $2', [testUserId, testDate]);
    await db.query('DELETE FROM soreness WHERE user_id = $1 AND date = $2', [testUserId, testDate]);
    await db.query('DELETE FROM jump_tests WHERE user_id = $1 AND date = $2', [testUserId, testDate]);
  });

  test('should calculate readiness score correctly with all data present', async () => {
    // Seed test data
    const hrvRmssd = 80;  // 80/100 = 0.8
    const sleepMin = 400; // 400/480 = 0.833...
    const sorenessScore = 3; // (10-3)/9 = 0.777...
    const jumpHeightCm = 40; // 40/50 = 0.8

    // Insert metrics data
    await db.query(
      `INSERT INTO metrics (user_id, date, hrv_rmssd, sleep_min) 
       VALUES ($1, $2, $3, $4)`,
      [testUserId, testDate, hrvRmssd, sleepMin]
    );

    // Insert soreness data
    await db.query(
      `INSERT INTO soreness (user_id, date, score) 
       VALUES ($1, $2, $3)`,
      [testUserId, testDate, sorenessScore]
    );

    // Insert jump test data
    await db.query(
      `INSERT INTO jump_tests (user_id, date, height_cm) 
       VALUES ($1, $2, $3)`,
      [testUserId, testDate, jumpHeightCm]
    );

    // Calculate expected readiness score
    const normHRV = Math.min(Math.max((hrvRmssd / 100), 0), 1); // 0.8
    const normSleep = Math.min(Math.max((sleepMin / 480), 0), 1); // 0.833...
    const normSoreness = Math.min(Math.max((10 - sorenessScore) / 9, 0), 1); // 0.777...
    const normJump = Math.min(Math.max((jumpHeightCm / 50), 0), 1); // 0.8
    
    const expectedReadiness = Math.round((normHRV * 0.25 + normSleep * 0.25 + normSoreness * 0.25 + normJump * 0.25) * 100);

    // Call the function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    
    expect(result).toEqual({
      readiness_score: expectedReadiness,
      hrv_rmssd: hrvRmssd,
      sleep_min: sleepMin,
      soreness_score: sorenessScore,
      jump_cm: jumpHeightCm
    });

    // Verify the calculation manually
    expect(result.readiness_score).toBe(80); // Should be around 80 based on the values
  });

  test('should handle missing data with default values', async () => {
    // Don't insert any data - all should default
    
    // Expected defaults:
    const expectedHrv = 0;
    const expectedSleep = 0;
    const expectedSoreness = 10; // Worst case default
    const expectedJump = 0;
    
    // Calculate expected readiness with defaults
    const normHRV = Math.min(Math.max((expectedHrv / 100), 0), 1); // 0
    const normSleep = Math.min(Math.max((expectedSleep / 480), 0), 1); // 0
    const normSoreness = Math.min(Math.max((10 - expectedSoreness) / 9, 0), 1); // 0
    const normJump = Math.min(Math.max((expectedJump / 50), 0), 1); // 0
    
    const expectedReadiness = Math.round((normHRV * 0.25 + normSleep * 0.25 + normSoreness * 0.25 + normJump * 0.25) * 100);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    
    expect(result).toEqual({
      readiness_score: expectedReadiness, // Should be 0
      hrv_rmssd: expectedHrv,
      sleep_min: expectedSleep,
      soreness_score: expectedSoreness,
      jump_cm: expectedJump
    });

    expect(result.readiness_score).toBe(0);
  });

  test('should handle partial data correctly', async () => {
    // Insert only metrics and soreness, no jump data
    const hrvRmssd = 60;
    const sleepMin = 480; // Perfect sleep
    const sorenessScore = 1; // Best soreness

    await db.query(
      `INSERT INTO metrics (user_id, date, hrv_rmssd, sleep_min) 
       VALUES ($1, $2, $3, $4)`,
      [testUserId, testDate, hrvRmssd, sleepMin]
    );

    await db.query(
      `INSERT INTO soreness (user_id, date, score) 
       VALUES ($1, $2, $3)`,
      [testUserId, testDate, sorenessScore]
    );

    // Jump data will default to 0

    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    
    expect(result.hrv_rmssd).toBe(hrvRmssd);
    expect(result.sleep_min).toBe(sleepMin);
    expect(result.soreness_score).toBe(sorenessScore);
    expect(result.jump_cm).toBe(0); // Default

    // Verify readiness calculation
    const normHRV = Math.min(Math.max((hrvRmssd / 100), 0), 1); // 0.6
    const normSleep = Math.min(Math.max((sleepMin / 480), 0), 1); // 1.0
    const normSoreness = Math.min(Math.max((10 - sorenessScore) / 9, 0), 1); // 1.0
    const normJump = Math.min(Math.max((0 / 50), 0), 1); // 0
    
    const expectedReadiness = Math.round((normHRV * 0.25 + normSleep * 0.25 + normSoreness * 0.25 + normJump * 0.25) * 100);
    expect(result.readiness_score).toBe(expectedReadiness); // Should be 65
  });

  test('should clamp extreme values correctly', async () => {
    // Insert extreme values to test clamping
    const hrvRmssd = 200; // Will be clamped to 1.0 when normalized
    const sleepMin = 1000; // Will be clamped to 1.0 when normalized
    const sorenessScore = 1; // Best soreness (9/9 = 1.0 when normalized)
    const jumpHeightCm = 100; // Will be clamped to 1.0 when normalized

    await db.query(
      `INSERT INTO metrics (user_id, date, hrv_rmssd, sleep_min) 
       VALUES ($1, $2, $3, $4)`,
      [testUserId, testDate, hrvRmssd, sleepMin]
    );

    await db.query(
      `INSERT INTO soreness (user_id, date, score) 
       VALUES ($1, $2, $3)`,
      [testUserId, testDate, sorenessScore]
    );

    await db.query(
      `INSERT INTO jump_tests (user_id, date, height_cm) 
       VALUES ($1, $2, $3)`,
      [testUserId, testDate, jumpHeightCm]
    );

    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    
    // All normalized values should be clamped to 1.0, so readiness should be 100
    expect(result.readiness_score).toBe(100);
    expect(result.hrv_rmssd).toBe(hrvRmssd);
    expect(result.sleep_min).toBe(sleepMin);
    expect(result.soreness_score).toBe(sorenessScore);
    expect(result.jump_cm).toBe(jumpHeightCm);
  });

  test('should require authorization', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    expect(response.status).toBe(401);
    const result = await response.json();
    expect(result.error).toBe('Unauthorized');
  });

  test('should only allow GET method', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    expect(response.status).toBe(405);
    const result = await response.json();
    expect(result.error).toBe('Method not allowed');
  });

  test('should handle CORS OPTIONS request', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'OPTIONS'
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });

  test('should use today\'s date for queries', async () => {
    // Insert data for different dates
    const yesterday = '2025-08-02';
    const today = new Date().toISOString().split('T')[0];
    
    // Insert data for yesterday
    await db.query(
      `INSERT INTO metrics (user_id, date, hrv_rmssd, sleep_min) 
       VALUES ($1, $2, $3, $4)`,
      [testUserId, yesterday, 100, 480]
    );

    // Insert data for today
    await db.query(
      `INSERT INTO metrics (user_id, date, hrv_rmssd, sleep_min) 
       VALUES ($1, $2, $3, $4)`,
      [testUserId, today, 50, 240]
    );

    const response = await fetch(`${SUPABASE_URL}/functions/v1/getReadiness`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    
    // Should use today's data, not yesterday's
    expect(result.hrv_rmssd).toBe(50);
    expect(result.sleep_min).toBe(240);

    // Clean up
    await db.query('DELETE FROM metrics WHERE user_id = $1 AND date = $2', [testUserId, yesterday]);
    await db.query('DELETE FROM metrics WHERE user_id = $1 AND date = $2', [testUserId, today]);
  });
});