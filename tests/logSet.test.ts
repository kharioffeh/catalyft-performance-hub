/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

// Mock publishEvent function
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

describe('LogSet API', () => {
  let supabase: any
  let testUserId: string
  let authToken: string
  let sessionId: string

  beforeEach(() => {
    // Clear mock calls before each test
    mockPublishEvent.mockClear();
  });

  beforeAll(async () => {
    // Initialize Supabase client for testing
    supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
    )

    // Create a test user
    const testEmail = `test-logset-${Date.now()}@example.com`
    const { data: { user }, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })

    if (error && error.message.includes('already exists')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testpassword123'
      })
      testUserId = signInData.user?.id
      authToken = signInData.session?.access_token
    } else {
      testUserId = user?.id
      const { data: { session } } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testpassword123'
      })
      authToken = session?.access_token
    }

    expect(testUserId).toBeDefined()
    expect(authToken).toBeDefined()

    // Create a test workout session
    const { data: workoutSession, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: testUserId,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    expect(sessionError).toBeNull()
    sessionId = workoutSession.id
  })

  afterAll(async () => {
    // Clean up test data
    if (sessionId) {
      await supabase.from('workout_sets').delete().eq('session_id', sessionId)
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    }
  })

  describe('logSet function', () => {
    test('should log workout set and publish setLogged event', async () => {
      const setData = {
        session_id: sessionId,
        exercise: 'Bench Press',
        weight: 225,
        reps: 8,
        rpe: 7
      }

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(setData)
      })

      expect(response.status).toBe(201)
      
      const result = await response.json()
      expect(result.id).toBeDefined()
      expect(result.exercise).toBe('Bench Press')
      expect(result.weight).toBe(225)
      expect(result.reps).toBe(8)
      expect(result.rpe).toBe(7)

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "setLogged", 
        { session_id: sessionId, set_id: result.id }
      )
    })

    test('should return 400 for missing required fields', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          exercise: 'Bench Press'
          // Missing session_id, weight, reps
        })
      })

      expect(response.status).toBe(400)
      
      // Verify publishEvent was not called
      expect(mockPublishEvent).toHaveBeenCalledTimes(0)
    })

    test('should return 404 for non-existent session', async () => {
      const fakeSessionId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/logSet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: fakeSessionId,
          exercise: 'Bench Press',
          weight: 225,
          reps: 8
        })
      })

      expect(response.status).toBe(404)
      
      // Verify publishEvent was not called
      expect(mockPublishEvent).toHaveBeenCalledTimes(0)
    })
  })
})