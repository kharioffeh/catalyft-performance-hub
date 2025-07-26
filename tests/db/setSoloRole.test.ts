import { Pool } from 'pg';
import { randomUUID } from 'crypto';

describe('Set Solo Role Trigger Test', () => {
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

  test('new user with NULL app_metadata gets role=solo', async () => {
    const userId = randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;

    // Insert a user row via SQL with NULL app_metadata
    await db.query(`
      INSERT INTO auth.users (id, email, app_metadata)
      VALUES ($1, $2, NULL)
    `, [userId, testEmail]);

    // Select it back, expect app_metadata->>'role' = 'solo'
    const result = await db.query(`
      SELECT app_metadata
      FROM auth.users
      WHERE id = $1
    `, [userId]);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].app_metadata).toBeDefined();
    expect(result.rows[0].app_metadata.role).toBe('solo');

    // Cleanup
    await db.query('DELETE FROM auth.users WHERE id = $1', [userId]);
  });

  test('new user with existing app_metadata but no role gets role=solo', async () => {
    const userId = randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;

    // Insert a user with existing app_metadata but no role
    await db.query(`
      INSERT INTO auth.users (id, email, app_metadata)
      VALUES ($1, $2, $3)
    `, [userId, testEmail, JSON.stringify({ some_other_field: 'value' })]);

    // Select it back, expect app_metadata->>'role' = 'solo'
    const result = await db.query(`
      SELECT app_metadata
      FROM auth.users
      WHERE id = $1
    `, [userId]);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].app_metadata).toBeDefined();
    expect(result.rows[0].app_metadata.role).toBe('solo');
    expect(result.rows[0].app_metadata.some_other_field).toBe('value');

    // Cleanup
    await db.query('DELETE FROM auth.users WHERE id = $1', [userId]);
  });

  test('new user with existing role in app_metadata keeps original role', async () => {
    const userId = randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;

    // Insert a user with existing role
    await db.query(`
      INSERT INTO auth.users (id, email, app_metadata)
      VALUES ($1, $2, $3)
    `, [userId, testEmail, JSON.stringify({ role: 'admin', other_field: 'value' })]);

    // Select it back, expect original role to be preserved
    const result = await db.query(`
      SELECT app_metadata
      FROM auth.users
      WHERE id = $1
    `, [userId]);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].app_metadata).toBeDefined();
    expect(result.rows[0].app_metadata.role).toBe('admin');
    expect(result.rows[0].app_metadata.other_field).toBe('value');

    // Cleanup
    await db.query('DELETE FROM auth.users WHERE id = $1', [userId]);
  });

  test('trigger function exists and is properly configured', async () => {
    // Check that the function exists
    const functionResult = await db.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'f_set_solo_role'
    `);
    
    expect(functionResult.rows.length).toBe(1);

    // Check that the trigger exists
    const triggerResult = await db.query(`
      SELECT trigger_name, event_manipulation, action_timing
      FROM information_schema.triggers
      WHERE trigger_name = 'trg_set_solo_role'
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
    `);
    
    expect(triggerResult.rows.length).toBe(1);
    expect(triggerResult.rows[0].event_manipulation).toBe('INSERT');
    expect(triggerResult.rows[0].action_timing).toBe('BEFORE');
  });
});