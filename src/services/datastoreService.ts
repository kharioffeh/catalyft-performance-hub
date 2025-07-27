// @ts-ignore
const { Datastore } = window.Median;

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

class DatastoreService {
  private db: any = null;
  private readonly DB_NAME = 'catalyft';

  constructor() {
    // Median Datastore doesn't need connection setup
  }

  async initializeDB(): Promise<void> {
    try {
      // Open database with Median bridge
      this.db = await Datastore.open(this.DB_NAME);
      await this.createTables();
      
      console.log('Median Datastore database initialized');
    } catch (error) {
      console.error('Error initializing Median Datastore database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Create all tables using execute for DDL statements
      await this.db.execute(`
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
        )
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id TEXT PRIMARY KEY,
          athlete_id TEXT NOT NULL,
          name TEXT,
          start_time TEXT NOT NULL,
          end_time TEXT,
          status TEXT DEFAULT 'active',
          created_at TEXT NOT NULL
        )
      `);

      await this.db.execute(`
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
        )
      `);

      await this.db.execute(`
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
        )
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS feed_posts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT,
          media_url TEXT,
          session_id TEXT,
          synced INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS club_memberships (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          club_id TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          joined_at TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS challenge_participants (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          challenge_id TEXT NOT NULL,
          progress REAL DEFAULT 0,
          completed INTEGER DEFAULT 0,
          joined_at TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS meet_rsvps (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          meet_id TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          rsvp_at TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS session_finishers (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          protocol_id TEXT NOT NULL,
          status TEXT DEFAULT 'assigned',
          completed_at TEXT,
          synced INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `);

      console.log('All tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async addPendingSet(set: PendingSet): Promise<void> {
    if (!this.db) {
      console.warn('Median Datastore not available, skipping local storage');
      return;
    }

    try {
      await this.db.execute(
        `INSERT INTO pending_sets (id, session_id, exercise, weight, reps, rpe, tempo, velocity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          set.id,
          set.session_id,
          set.exercise,
          set.weight,
          set.reps,
          set.rpe || null,
          set.tempo || null,
          set.velocity || null,
          set.created_at
        ]
      );

      console.log('Added pending set to local database:', set.id);
    } catch (error) {
      console.error('Error adding pending set:', error);
      throw error;
    }
  }

  async getPendingSets(): Promise<PendingSet[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.query('SELECT * FROM pending_sets ORDER BY created_at ASC');
      
      return result.map((row: any) => ({
        id: row.id,
        session_id: row.session_id,
        exercise: row.exercise,
        weight: row.weight,
        reps: row.reps,
        rpe: row.rpe,
        tempo: row.tempo,
        velocity: row.velocity,
        created_at: row.created_at
      }));
    } catch (error) {
      console.error('Error getting pending sets:', error);
      return [];
    }
  }

  async removePendingSet(id: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.execute('DELETE FROM pending_sets WHERE id = ?', [id]);
      console.log('Removed pending set from local database:', id);
    } catch (error) {
      console.error('Error removing pending set:', error);
      throw error;
    }
  }

  async clearAllPendingSets(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.execute('DELETE FROM pending_sets');
      console.log('Cleared all pending sets from local database');
    } catch (error) {
      console.error('Error clearing pending sets:', error);
      throw error;
    }
  }

  async closeConnection(): Promise<void> {
    // Median Datastore handles connection management automatically
    this.db = null;
  }
}

export const datastoreService = new DatastoreService();