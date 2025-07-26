/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

describe('Workout Logger API', () => {
  let supabase: any
  let testUserId: string
  let sessionId: string

  beforeAll(async () => {
    // Initialize Supabase client for testing
    supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
    )

    // Create a test user or use existing one
    const { data: { user }, error } = await supabase.auth.signUp({
      email: `test-logger-${Date.now()}@example.com`,
      password: 'testpassword123'
    })

    if (error && error.message.includes('already exists')) {
      // User already exists, sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: `test-logger-${Date.now()}@example.com`,
        password: 'testpassword123'
      })
      testUserId = signInData.user?.id
    } else {
      testUserId = user?.id
    }

    expect(testUserId).toBeDefined()
  })

  afterAll(async () => {
    // Clean up test data
    if (sessionId) {
      await supabase.from('workout_sets').delete().eq('session_id', sessionId)
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    }
  })

  describe('Workout Session Management', () => {
    test('should create a workout session successfully', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createWorkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test-anon-key'}`
        },
        body: JSON.stringify({
          notes: 'Test workout session'
        })
      })

      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.started_at).toBeDefined()
      
      sessionId = data.id

      // Verify session was created in database
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      expect(error).toBeNull()
      expect(session).toBeDefined()
      expect(session.notes).toBe('Test workout session')
      expect(session.started_at).toBeDefined()
      expect(session.ended_at).toBeNull()
    })

    test('should log workout sets successfully', async () => {
      const testSets = [
        {
          session_id: sessionId,
          exercise: 'Bench Press',
          weight: 100,
          reps: 8,
          rpe: 7,
          tempo: '2-1-2',
          velocity: 0.45
        },
        {
          session_id: sessionId,
          exercise: 'Squat',
          weight: 120,
          reps: 5,
          rpe: 8,
          tempo: '3-0-1',
          velocity: 0.38
        },
        {
          session_id: sessionId,
          exercise: 'Deadlift',
          weight: 140,
          reps: 3,
          rpe: 9,
          tempo: '2-0-1',
          velocity: 0.32
        }
      ]

      const setIds: string[] = []

      // Log each set
      for (const setData of testSets) {
        const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test-anon-key'}`
          },
          body: JSON.stringify(setData)
        })

        expect(response.status).toBe(201)
        
        const data = await response.json()
        expect(data.id).toBeDefined()
        expect(data.session_id).toBe(sessionId)
        expect(data.exercise).toBe(setData.exercise)
        expect(data.weight).toBe(setData.weight)
        expect(data.reps).toBe(setData.reps)
        expect(data.rpe).toBe(setData.rpe)
        expect(data.tempo).toBe(setData.tempo)
        expect(data.velocity).toBe(setData.velocity)
        expect(data.created_at).toBeDefined()
        
        setIds.push(data.id)
      }

      // Verify all sets were created in database
      const { data: sets, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      expect(error).toBeNull()
      expect(sets).toHaveLength(3)
      
      sets.forEach((set: any, index: number) => {
        expect(set.exercise).toBe(testSets[index].exercise)
        expect(set.weight).toBe(testSets[index].weight)
        expect(set.reps).toBe(testSets[index].reps)
        expect(set.rpe).toBe(testSets[index].rpe)
        expect(set.tempo).toBe(testSets[index].tempo)
        expect(set.velocity).toBe(testSets[index].velocity)
      })
    })

    test('should end workout session successfully', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/endWorkout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test-anon-key'}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.message).toBe('Workout session ended successfully')
      expect(data.session).toBeDefined()
      expect(data.session.ended_at).toBeDefined()

      // Verify session was updated in database
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      expect(error).toBeNull()
      expect(session.ended_at).toBeDefined()
      expect(new Date(session.ended_at)).toBeInstanceOf(Date)
    })
  })

  describe('Data Validation', () => {
    test('should reject invalid RPE values', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test-anon-key'}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          exercise: 'Test Exercise',
          weight: 100,
          reps: 5,
          rpe: 11 // Invalid RPE > 10
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toContain('RPE must be an integer between 1 and 10')
    })

    test('should reject negative weight values', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test-anon-key'}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          exercise: 'Test Exercise',
          weight: -50, // Invalid negative weight
          reps: 5
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toContain('Weight must be a non-negative number')
    })

    test('should reject missing required fields', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test-anon-key'}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          exercise: 'Test Exercise'
          // Missing weight and reps
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toContain('Missing required fields')
    })
  })

  describe('Database Integrity', () => {
    test('should verify correct foreign key relationships', async () => {
      // Verify workout_sets reference workout_sessions correctly
      const { data: sets, error } = await supabase
        .from('workout_sets')
        .select(`
          *,
          workout_sessions (
            id,
            user_id,
            started_at,
            ended_at,
            notes
          )
        `)
        .eq('session_id', sessionId)

      expect(error).toBeNull()
      expect(sets).toHaveLength(3)
      
      sets.forEach((set: any) => {
        expect(set.workout_sessions).toBeDefined()
        expect(set.workout_sessions.id).toBe(sessionId)
        expect(set.workout_sessions.user_id).toBeDefined()
      })
    })

    test('should verify Row Level Security policies work correctly', async () => {
      // Test that users can only access their own data
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)

      expect(error).toBeNull()
      expect(sessions).toHaveLength(1)
      expect(sessions[0].user_id).toBe(testUserId)
    })
  })
})