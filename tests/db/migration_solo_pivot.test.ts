import { Client } from 'pg';

describe('Solo Pivot Migration Tests', () => {
  let client: Client;

  beforeAll(async () => {
    // Connect to local Supabase database
    client = new Client({
      host: 'localhost',
      port: 54322, // Default Supabase local port
      database: 'postgres',
      user: 'postgres',
      password: 'postgres', // Default Supabase local password
    });

    try {
      await client.connect();
    } catch (error) {
      console.warn('Could not connect to local database. Skipping tests.', error);
      // Skip tests if database is not available
      client = null;
    }
  });

  afterAll(async () => {
    if (client) {
      await client.end();
    }
  });

  test('athletes table should NOT exist', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'athletes'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('coach_billings table should NOT exist', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'coach_billings'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('invite_tokens table should NOT exist', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invite_tokens'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('programs table should NOT have coach_id column', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'programs' 
        AND column_name = 'coach_id'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('sessions table should NOT have coach_id column', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions' 
        AND column_name = 'coach_id'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('exercise_library table should NOT have coach_uuid column', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'exercise_library' 
        AND column_name = 'coach_uuid'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('workout_blocks table should NOT have coach_uuid column', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'workout_blocks' 
        AND column_name = 'coach_uuid'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('ai_insights table should NOT have coach_uuid column', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_insights' 
        AND column_name = 'coach_uuid'
      );
    `);

    expect(result.rows[0].exists).toBe(false);
  });

  test('coach-related functions should NOT exist', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    const coachFunctions = [
      'get_user_athlete_count',
      'is_current_user_coach',
      'get_current_coach_id',
      'user_owns_athlete',
      'get_active_athletes_for_coach',
      'expire_old_invites'
    ];

    for (const functionName of coachFunctions) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name = $1
        );
      `, [functionName]);

      expect(result.rows[0].exists).toBe(false);
    }
  });

  test('coach-related RLS policies should NOT exist', async () => {
    if (!client) {
      console.log('Skipping test - no database connection');
      return;
    }

    // Check that no policies exist with 'coach' in the name
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND policyname ILIKE '%coach%';
    `);

    expect(parseInt(result.rows[0].count)).toBe(0);
  });
});