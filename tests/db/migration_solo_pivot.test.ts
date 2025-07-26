import { Pool } from 'pg';

describe('Solo Pivot Migration Test', () => {
  let db: Pool;

  beforeAll(async () => {
    // Connect to local PostgreSQL database
    // Use environment variables or default local values
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

  test('athletes table should not exist after migration', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'athletes'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('coach_billings table should not exist after migration', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'coach_billings'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('invite_tokens table should not exist after migration', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'invite_tokens'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('coach_id column should not exist on programs table', async () => {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'programs' 
      AND column_name = 'coach_id'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('coach_id column should not exist on sessions table', async () => {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sessions' 
      AND column_name = 'coach_id'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('coach_uuid column should not exist on sessions table', async () => {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sessions' 
      AND column_name = 'coach_uuid'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('coach-related functions should not exist', async () => {
    const functions = [
      'is_current_user_coach',
      'get_current_coach_id',
      'get_active_athletes_for_coach'
    ];

    for (const funcName of functions) {
      const result = await db.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = $1
      `, [funcName]);
      
      expect(result.rows.length).toBe(0);
    }
  });

  test('coach-related RLS policies should not exist', async () => {
    const coachPolicies = [
      'Allow coach insert own sessions',
      'Allow coach read sessions', 
      'Allow coach update sessions',
      'Allow coach delete sessions'
    ];

    for (const policyName of coachPolicies) {
      const result = await db.query(`
        SELECT policyname 
        FROM pg_policies 
        WHERE policyname = $1
      `, [policyName]);
      
      expect(result.rows.length).toBe(0);
    }
  });

  test('no policies should reference coach in their name', async () => {
    const result = await db.query(`
      SELECT policyname, tablename
      FROM pg_policies 
      WHERE policyname ILIKE '%coach%'
    `);
    
    expect(result.rows.length).toBe(0);
  });
});