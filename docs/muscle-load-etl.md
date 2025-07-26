# Muscle Load ETL System

## Overview
The muscle load ETL system calculates daily muscle load scores (0-100) from session exercise data to power the mobile muscle heatmap visual and training balance insights.

## Database Schema

### Table: `muscle_load_daily`
- **user_id** (uuid): References auth.users
- **date** (date): The date for the load calculation
- **muscle** (text): Muscle name (e.g., "biceps", "chest")
- **load_score** (numeric): Normalized score 0-100
- **created_at** (timestamptz): Record creation timestamp

Primary key: `(user_id, date, muscle)`

## Functions

### `etl_compute_muscle_load(_start_date, _end_date)`
Main ETL function that:
- Aggregates volume (sets × reps × weight) from `set_log` and `session.exercises`
- Normalizes scores 0-100 within each user's historical data
- Handles both detailed tracking (`set_log`) and JSONB exercise data fallback
- Processes all users for the specified date range

**Parameters:**
- `_start_date`: Start date (default: 30 days ago)
- `_end_date`: End date (default: today)

**Usage:**
```sql
-- Process last 30 days
SELECT etl_compute_muscle_load();

-- Process specific date range
SELECT etl_compute_muscle_load('2025-01-01', '2025-01-15');
```

### `refresh_muscle_load_for_date(target_date)`
Convenience function to refresh data for a specific date.

**Usage:**
```sql
-- Refresh today's data
SELECT refresh_muscle_load_for_date();

-- Refresh specific date
SELECT refresh_muscle_load_for_date('2025-01-15');
```

## Cron Job
Automatically runs daily at 02:00 UTC:
- **Job name:** `etl-muscle-load-daily`
- **Schedule:** `0 2 * * *`
- **Command:** `SELECT public.etl_compute_muscle_load();`

### Managing the Cron Job
```sql
-- View active jobs
SELECT * FROM cron.job;

-- Unschedule if needed
SELECT cron.unschedule('etl-muscle-load-daily');

-- Reschedule
SELECT cron.schedule(
    'etl-muscle-load-daily',
    '0 2 * * *',
    $$SELECT public.etl_compute_muscle_load();$$
);
```

## Data Flow
1. **Source Data:** 
   - Primary: `set_log` table (detailed set tracking)
   - Fallback: `session.exercises` JSONB (when set_log data unavailable)

2. **Processing:**
   - Joins with `exercise_library` and `exercises` tables for muscle mappings
   - Calculates total volume per muscle per user per date
   - Normalizes within user's historical data (min-max scaling)

3. **Output:** 
   - Normalized scores (0-100) in `muscle_load_daily` table
   - Powers mobile heatmap visualization

## Security
- **RLS enabled:** Users can only access their own muscle load data
- **Function security:** `SECURITY DEFINER` with proper permissions
- **Authentication:** Requires `authenticated` role

## Performance
- **Indexes:** Optimized for user, date, and muscle queries
- **Incremental processing:** Only processes specified date ranges
- **Efficient joins:** Uses appropriate indexes on source tables

## Monitoring
The ETL function includes logging via `RAISE NOTICE` statements:
- Process start/completion timestamps
- Date range being processed
- Any errors or warnings

## Migration
Run the migration file:
```bash
supabase db reset  # If needed for clean slate
# or
supabase db push   # Apply new migration
```

## Integration
The `muscle_load_daily` table is designed to be consumed by:
- Mobile app muscle heatmap component
- Training balance analytics
- User insights dashboard
- API endpoints for muscle load data