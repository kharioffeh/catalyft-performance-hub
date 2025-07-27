/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

// Mock publishEvent function
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

describe('EndWorkout API', () => {
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
    const testEmail = `test-endworkout-${Date.now()}@example.com`
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
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    }
  })

  describe('endWorkout function', () => {
    test('should end workout session and publish sessionEnded event', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/endWorkout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.message).toBe('Workout session ended successfully')
      expect(result.session.ended_at).toBeDefined()

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "sessionEnded", 
        { session_id: sessionId }
      )

      // Verify session was ended in database
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .select('ended_at')
        .eq('id', sessionId)
        .single()

      expect(error).toBeNull()
      expect(session.ended_at).toBeDefined()
    })

    test('should return 400 for already ended session', async () => {
      // Try to end the session again
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/endWorkout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.error).toBe('Session already ended')

      // Verify publishEvent was not called for already ended session
      expect(mockPublishEvent).toHaveBeenCalledTimes(0)
    })

    test('should return 404 for non-existent session', async () => {
      const fakeSessionId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/endWorkout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: fakeSessionId
        })
      })

      expect(response.status).toBe(404)
      
      // Verify publishEvent was not called
      expect(mockPublishEvent).toHaveBeenCalledTimes(0)
    })
  })
})