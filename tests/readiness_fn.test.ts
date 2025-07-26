/**
 * @jest-environment node
 */
import { Pool } from 'pg';

describe('Readiness Functions Test', () => {
  let db: Pool;
  const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
  const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

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
    await db.query('DELETE FROM soreness WHERE date = $1', ['2025-08-03']);
    await db.query('DELETE FROM jump_tests WHERE date = $1', ['2025-08-03']);
  });

  describe('upsertSoreness function', () => {
    test('should create new soreness row', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03',
          score: 7
        })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result).toEqual({
        status: 'ok',
        date: '2025-08-03',
        score: 7
      });

      // Verify data was inserted into database
      const dbResult = await db.query(
        'SELECT * FROM soreness WHERE date = $1',
        ['2025-08-03']
      );
      
      expect(dbResult.rows.length).toBe(1);
      expect(dbResult.rows[0].score).toBe(7);
      expect(dbResult.rows[0].date.toISOString().split('T')[0]).toBe('2025-08-03');
    });

    test('should update existing soreness row', async () => {
      // First, insert a soreness record
      await db.query(
        `INSERT INTO soreness (user_id, date, score) 
         VALUES ('123e4567-e89b-12d3-a456-426614174000', '2025-08-03', 5)`,
      );

      const response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03',
          score: 8
        })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result).toEqual({
        status: 'ok',
        date: '2025-08-03',
        score: 8
      });

      // Verify data was updated in database
      const dbResult = await db.query(
        'SELECT * FROM soreness WHERE date = $1',
        ['2025-08-03']
      );
      
      expect(dbResult.rows.length).toBe(1);
      expect(dbResult.rows[0].score).toBe(8);
    });

    test('should validate score is between 1 and 10', async () => {
      // Test score too low
      let response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03',
          score: 0
        })
      });

      expect(response.status).toBe(400);
      let result = await response.json();
      expect(result.error).toBe('Validation error');

      // Test score too high
      response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03',
          score: 11
        })
      });

      expect(response.status).toBe(400);
      result = await response.json();
      expect(result.error).toBe('Validation error');
    });

    test('should validate date format', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025/08/03', // Wrong format
          score: 7
        })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Validation error');
    });

    test('should require authorization', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03',
          score: 7
        })
      });

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toBe('Unauthorized');
    });

    test('should only allow POST method', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/upsertSoreness`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
        }
      });

      expect(response.status).toBe(405);
      const result = await response.json();
      expect(result.error).toBe('Method not allowed');
    });
  });

  describe('analyzeJump function', () => {
    test('should return height_cm numeric and stores nothing (stub)', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyzeJump`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: 'https://example.com/jump-video.mp4',
          date: '2025-08-03'
        })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result).toEqual({
        status: 'ok',
        date: '2025-08-03',
        height_cm: 0
      });

      expect(typeof result.height_cm).toBe('number');

      // Verify nothing was stored in database (stub behavior)
      const dbResult = await db.query(
        'SELECT * FROM jump_tests WHERE date = $1',
        ['2025-08-03']
      );
      
      expect(dbResult.rows.length).toBe(0);
    });

    test('should handle JSON request format', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyzeJump`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03'
        })
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      
      expect(result.status).toBe('ok');
      expect(result.date).toBe('2025-08-03');
      expect(typeof result.height_cm).toBe('number');
    });

    test('should validate date format', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyzeJump`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: 'https://example.com/video.mp4',
          date: '2025/08/03' // Wrong format
        })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Validation error');
    });

    test('should require authorization', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyzeJump`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: '2025-08-03'
        })
      });

      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toBe('Unauthorized');
    });

    test('should validate videoUrl if provided', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyzeJump`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: 'invalid-url',
          date: '2025-08-03'
        })
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Validation error');
    });

    test('should only allow POST method', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyzeJump`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
        }
      });

      expect(response.status).toBe(405);
      const result = await response.json();
      expect(result.error).toBe('Method not allowed');
    });
  });
});