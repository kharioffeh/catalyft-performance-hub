import { Pool } from 'pg';

describe('Remove Seats Migration Test', () => {
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

  test('athlete_purchases table should not exist after migration', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'athlete_purchases'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('seat-related columns should not exist in billing_customers', async () => {
    const seatColumns = [
      'current_athlete_count',
      'additional_athletes_purchased', 
      'monthly_addon_cost'
    ];

    for (const columnName of seatColumns) {
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'billing_customers' 
        AND column_name = $1
      `, [columnName]);
      
      expect(result.rows.length).toBe(0);
    }
  });

  test('plan_id column should not exist in billing_customers', async () => {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'billing_customers' 
      AND column_name = 'plan_id'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('current_period_end column should exist in billing_customers', async () => {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'billing_customers' 
      AND column_name = 'current_period_end'
    `);
    
    expect(result.rows.length).toBe(1);
  });

  test('currency-related tables should not exist', async () => {
    const currencyTables = [
      'user_currency_preferences',
      'currencies'
    ];

    for (const tableName of currencyTables) {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      `, [tableName]);
      
      expect(result.rows.length).toBe(0);
    }
  });

  test('plans table should not exist', async () => {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'plans'
    `);
    
    expect(result.rows.length).toBe(0);
  });

  test('preferred_currency column should not exist in billing_customers', async () => {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'billing_customers' 
      AND column_name = 'preferred_currency'
    `);
    
    expect(result.rows.length).toBe(0);
  });
});