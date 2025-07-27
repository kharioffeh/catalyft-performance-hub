import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface PendingSet {
  id: string;
  session_id: string;
  exercise: string;
  weight: number;
  reps: number;
  rpe?: number;
  tempo?: string;
  velocity?: number;
  created_at: string;
}

class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'catalyft.db';
  private readonly DB_VERSION = 1;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDB(): Promise<void> {
    try {
      // Only initialize on mobile platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('SQLite not available on web platform');
        return;
      }

      // Create connection
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(this.DB_NAME, false)).result;
      
      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          this.DB_VERSION,
          false
        );
      }

      await this.db.open();
      await this.createTables();
      
      console.log('SQLite database initialized');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS pending_sets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise TEXT NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        rpe INTEGER,
        tempo TEXT,
        velocity REAL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        athlete_id TEXT NOT NULL,
        name TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL,
        reps INTEGER,
        rpe INTEGER,
        tempo TEXT,
        velocity REAL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nutrition_logs (
        id TEXT PRIMARY KEY,
        athlete_id TEXT NOT NULL,
        meal_type TEXT,
        food_item TEXT NOT NULL,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        logged_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS feed_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT,
        media_url TEXT,
        session_id TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS club_memberships (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        club_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS challenge_participants (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        progress REAL DEFAULT 0,
        completed INTEGER DEFAULT 0,
        joined_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS meet_rsvps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        meet_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        rsvp_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS session_finishers (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        protocol_id TEXT NOT NULL,
        status TEXT DEFAULT 'assigned',
        completed_at TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `;

    await this.db.execute(createTablesSQL);
    console.log('All tables created successfully');
  }

  async addPendingSet(set: PendingSet): Promise<void> {
    if (!this.db) {
      console.warn('SQLite not available, skipping local storage');
      return;
    }

    try {
      const insertSQL = `
        INSERT INTO pending_sets (id, session_id, exercise, weight, reps, rpe, tempo, velocity, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      await this.db.run(insertSQL, [
        set.id,
        set.session_id,
        set.exercise,
        set.weight,
        set.reps,
        set.rpe || null,
        set.tempo || null,
        set.velocity || null,
        set.created_at
      ]);

      console.log('Added pending set to local database:', set.id);
    } catch (error) {
      console.error('Error adding pending set:', error);
      throw error;
    }
  }

  async getPendingSets(): Promise<PendingSet[]> {
    if (!this.db) return [];

    try {
      const selectSQL = 'SELECT * FROM pending_sets ORDER BY created_at ASC;';
      const result = await this.db.query(selectSQL);
      
      return result.values?.map((row: any) => ({
        id: row.id,
        session_id: row.session_id,
        exercise: row.exercise,
        weight: row.weight,
        reps: row.reps,
        rpe: row.rpe,
        tempo: row.tempo,
        velocity: row.velocity,
        created_at: row.created_at
      })) || [];
    } catch (error) {
      console.error('Error getting pending sets:', error);
      return [];
    }
  }

  async removePendingSet(id: string): Promise<void> {
    if (!this.db) return;

    try {
      const deleteSQL = 'DELETE FROM pending_sets WHERE id = ?;';
      await this.db.run(deleteSQL, [id]);
      console.log('Removed pending set from local database:', id);
    } catch (error) {
      console.error('Error removing pending set:', error);
      throw error;
    }
  }

  async clearAllPendingSets(): Promise<void> {
    if (!this.db) return;

    try {
      const deleteSQL = 'DELETE FROM pending_sets;';
      await this.db.run(deleteSQL);
      console.log('Cleared all pending sets from local database');
    } catch (error) {
      console.error('Error clearing pending sets:', error);
      throw error;
    }
  }

  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const sqliteService = new SQLiteService();