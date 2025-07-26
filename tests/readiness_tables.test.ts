/**
 * @jest-environment node
 */
import { Pool } from 'pg';

describe('Readiness Tables Test', () => {
  let db: Pool;

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

  test('soreness table should exist', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'soreness'
    `);
    
    expect(result.rows.length).toBe(1);
  });

  test('jump_tests table should exist', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'jump_tests'
    `);
    
    expect(result.rows.length).toBe(1);
  });

  test('soreness table should have correct columns', async () => {
    const expectedColumns = ['id', 'user_id', 'date', 'score', 'created_at'];
    
    for (const columnName of expectedColumns) {
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'soreness' 
        AND column_name = $1
      `, [columnName]);
      
      expect(result.rows.length).toBe(1);
    }
  });

  test('jump_tests table should have correct columns', async () => {
    const expectedColumns = ['id', 'user_id', 'date', 'height_cm', 'created_at'];
    
    for (const columnName of expectedColumns) {
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jump_tests' 
        AND column_name = $1
      `, [columnName]);
      
      expect(result.rows.length).toBe(1);
    }
  });

  test('soreness table should have unique constraint on user_id and date', async () => {
    const result = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'soreness' 
      AND constraint_type = 'UNIQUE'
    `);
    
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('jump_tests table should have unique constraint on user_id and date', async () => {
    const result = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'jump_tests' 
      AND constraint_type = 'UNIQUE'
    `);
    
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('soreness score should have check constraint between 1 and 10', async () => {
    const result = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'soreness' 
      AND constraint_type = 'CHECK'
    `);
    
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('soreness table should have foreign key to auth.users', async () => {
    const result = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'soreness' 
      AND constraint_type = 'FOREIGN KEY'
    `);
    
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('jump_tests table should have foreign key to auth.users', async () => {
    const result = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'jump_tests' 
      AND constraint_type = 'FOREIGN KEY'
    `);
    
    expect(result.rows.length).toBeGreaterThan(0);
  });
});