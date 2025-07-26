/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

describe('Reschedule Session API', () => {
  let supabase: any
  let testUserId: string
  let sessionId: string
  let authToken: string

  beforeAll(async () => {
    // Initialize Supabase client for testing
    supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
    )

    // Create a test user for authentication
    const testEmail = `test-reschedule-${Date.now()}@example.com`
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })

    if (signUpError && signUpError.message.includes('already exists')) {
      // User already exists, sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testpassword123'
      })
      testUserId = signInData.user?.id
      authToken = signInData.session?.access_token
    } else {
      testUserId = signUpData.user?.id
      authToken = signUpData.session?.access_token
    }

    expect(testUserId).toBeDefined()
    expect(authToken).toBeDefined()

    // Seed a workout session with initial date
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: testUserId,
        started_at: '2025-08-01T08:00:00Z',
        notes: 'Test session for rescheduling'
      })
      .select()
      .single()

    expect(sessionError).toBeNull()
    expect(sessionData).toBeDefined()
    sessionId = sessionData.id
  })

  afterAll(async () => {
    // Clean up test data
    if (sessionId) {
      await supabase.from('workout_sets').delete().eq('session_id', sessionId)
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    }
  })

  describe('POST /rescheduleSession', () => {
    test('should reschedule a session successfully', async () => {
      const newDate = '2025-08-03T09:00:00Z'
      
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          new_date: newDate
        })
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({
        status: 'ok',
        session_id: sessionId,
        new_date: newDate
      })

      // Verify the session was actually updated in the database
      const { data: updatedSession, error } = await supabase
        .from('workout_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single()

      expect(error).toBeNull()
      expect(updatedSession.started_at).toBe(newDate)
    })

    test('should return 400 when session_id is missing', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          new_date: '2025-08-03T09:00:00Z'
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('session_id is required')
    })

    test('should return 400 when new_date is missing', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('new_date is required')
    })

    test('should return 400 when new_date is invalid', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          new_date: 'invalid-date'
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('new_date must be a valid ISO timestamp')
    })

    test('should return 404 when session does not exist', async () => {
      const fakeSessionId = '00000000-0000-0000-0000-000000000000'
      
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: fakeSessionId,
          new_date: '2025-08-03T09:00:00Z'
        })
      })

      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.error).toBe('Session not found or unauthorized')
    })

    test('should return 401 when not authenticated', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          new_date: '2025-08-03T09:00:00Z'
        })
      })

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    test('should return 405 for non-POST methods', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rescheduleSession`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status).toBe(405)
      
      const data = await response.json()
      expect(data.error).toBe('Method not allowed')
    })
  })
})