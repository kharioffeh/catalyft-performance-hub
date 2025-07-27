/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

// Mock publishEvent function
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

describe('CreateWorkout API', () => {
  let supabase: any
  let testUserId: string
  let authToken: string

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
    const testEmail = `test-createworkout-${Date.now()}@example.com`
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
  })

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await supabase.from('workout_sessions').delete().eq('user_id', testUserId)
    }
  })

  describe('createWorkout function', () => {
    test('should create workout session and publish sessionCreated event', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createWorkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          notes: 'Test workout session'
        })
      })

      expect(response.status).toBe(201)
      
      const result = await response.json()
      expect(result.id).toBeDefined()
      expect(result.started_at).toBeDefined()

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "sessionCreated", 
        { session_id: result.id }
      )

      // Verify session was created in database
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', result.id)
        .single()

      expect(error).toBeNull()
      expect(session.user_id).toBe(testUserId)
      expect(session.notes).toBe('Test workout session')
    })

    test('should create workout session without notes', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createWorkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(201)
      
      const result = await response.json()
      expect(result.id).toBeDefined()

      // Verify publishEvent was called
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "sessionCreated", 
        { session_id: result.id }
      )
    })

    test('should return 401 for unauthorized requests', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createWorkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(401)
      
      // Verify publishEvent was not called
      expect(mockPublishEvent).toHaveBeenCalledTimes(0)
    })
  })
})