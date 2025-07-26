# Workout Logger API Usage Demo

This document demonstrates how to use the workout logger API endpoints.

## 🏁 Prerequisites

1. Apply the migration:
   ```bash
   supabase db reset
   ```

2. Start the functions server:
   ```bash
   supabase functions serve
   ```

## 📋 API Endpoints

### 1. Create Workout Session

**POST** `/functions/v1/createWorkout`

```bash
curl -X POST 'http://localhost:54321/functions/v1/createWorkout' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "notes": "Upper body workout - focus on strength"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "started_at": "2025-02-08T10:30:00.000Z"
}
```

### 2. Log Workout Sets

**POST** `/functions/v1/logSet`

```bash
# Log first set - Bench Press
curl -X POST 'http://localhost:54321/functions/v1/logSet' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "exercise": "Bench Press",
    "weight": 100,
    "reps": 8,
    "rpe": 7,
    "tempo": "2-1-2",
    "velocity": 0.45
  }'

# Log second set - Squat
curl -X POST 'http://localhost:54321/functions/v1/logSet' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "exercise": "Squat",
    "weight": 120,
    "reps": 5,
    "rpe": 8,
    "tempo": "3-0-1",
    "velocity": 0.38
  }'

# Log third set - Deadlift
curl -X POST 'http://localhost:54321/functions/v1/logSet' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "exercise": "Deadlift",
    "weight": 140,
    "reps": 3,
    "rpe": 9,
    "tempo": "2-0-1",
    "velocity": 0.32
  }'
```

**Response (for each set):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "exercise": "Bench Press",
  "weight": 100,
  "reps": 8,
  "rpe": 7,
  "tempo": "2-1-2",
  "velocity": 0.45,
  "created_at": "2025-02-08T10:35:00.000Z"
}
```

### 3. End Workout Session

**PATCH** `/functions/v1/endWorkout`

```bash
curl -X PATCH 'http://localhost:54321/functions/v1/endWorkout' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response:**
```json
{
  "message": "Workout session ended successfully",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid-here",
    "started_at": "2025-02-08T10:30:00.000Z",
    "ended_at": "2025-02-08T11:15:00.000Z",
    "notes": "Upper body workout - focus on strength"
  }
}
```

## 🔍 Data Validation

The API includes comprehensive validation:

### Required Fields
- `session_id`, `exercise`, `weight`, `reps` are required for logging sets
- `session_id` is required for ending workouts

### Data Constraints
- **Weight**: Must be non-negative number
- **Reps**: Must be positive integer
- **RPE**: Must be integer between 1-10 (optional)
- **Velocity**: Must be non-negative number (optional)
- **Tempo**: Text field (optional)

### Security
- Row Level Security (RLS) ensures users can only access their own data
- JWT authentication required for all endpoints
- Session ownership validation before allowing set logging

## 🗄️ Database Schema

### workout_sessions
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- started_at (timestamptz, default now())
- ended_at (timestamptz, nullable)
- notes (text, nullable)
```

### workout_sets
```sql
- id (uuid, primary key)
- session_id (uuid, references workout_sessions)
- exercise (text, not null)
- weight (numeric, not null)
- reps (int, not null)
- rpe (int, 1-10, nullable)
- tempo (text, nullable)
- velocity (numeric, nullable)
- created_at (timestamptz, default now())
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test tests/logger.test.ts
```

The tests cover:
- Creating workout sessions
- Logging multiple sets with various data
- Ending workout sessions
- Data validation and error handling
- Database integrity and relationships
- Row Level Security policies

## 📊 Example Complete Workflow

1. **Start workout**: Create session → Get session ID
2. **Log exercises**: Add sets one by one with performance data
3. **End workout**: Mark session as complete
4. **Query data**: Use standard Supabase queries to retrieve workout history

This implementation provides a robust foundation for workout logging with proper security, validation, and comprehensive testing.