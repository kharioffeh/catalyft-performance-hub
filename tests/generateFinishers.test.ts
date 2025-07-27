/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

// Mock publishEvent function
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

describe('Generate Finishers API', () => {
  let supabase: any
  let testUserId: string
  let sessionId: string
  let targetingProtocolId: string
  let nonTargetingProtocolId: string

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

    // Create a test user or use existing one
    const testEmail = `test-finishers-${Date.now()}@example.com`
    const { data: { user }, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })

    if (error && error.message.includes('already exists')) {
      // User already exists, sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testpassword123'
      })
      testUserId = signInData.user?.id
    } else {
      testUserId = user?.id
    }

    expect(testUserId).toBeDefined()

    // Seed test protocols
    // Protocol targeting the muscle groups we'll test with
    const { data: targetingProtocol, error: protocolError1 } = await supabase
      .from('mobility_protocols')
      .insert({
        name: 'Test Hip Flexor Protocol',
        description: 'Test protocol for hip flexors',
        steps: JSON.stringify([{ step: "Test stretch", duration: 60 }]),
        muscle_targets: ['hip_flexors', 'quads'],
        duration_min: 5
      })
      .select()
      .single()

    expect(protocolError1).toBeNull()
    targetingProtocolId = targetingProtocol.id

    // Protocol NOT targeting the muscle groups we'll test with
    const { data: nonTargetingProtocol, error: protocolError2 } = await supabase
      .from('mobility_protocols')
      .insert({
        name: 'Test Shoulder Protocol',
        description: 'Test protocol for shoulders',
        steps: JSON.stringify([{ step: "Test shoulder stretch", duration: 90 }]),
        muscle_targets: ['shoulders', 'deltoids'],
        duration_min: 8
      })
      .select()
      .single()

    expect(protocolError2).toBeNull()
    nonTargetingProtocolId = nonTargetingProtocol.id

    // Create a test workout session
    const sessionDate = new Date().toISOString()
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: testUserId,
        started_at: sessionDate,
        notes: 'Test session for finishers'
      })
      .select()
      .single()

    expect(sessionError).toBeNull()
    sessionId = session.id

    // Seed muscle load data for the session date
    const sessionDateString = sessionDate.split('T')[0]
    const { error: muscleLoadError } = await supabase
      .from('muscle_load_daily')
      .upsert([
        {
          user_id: testUserId,
          date: sessionDateString,
          muscle: 'hip_flexors',
          load_score: 85.5
        },
        {
          user_id: testUserId,
          date: sessionDateString,
          muscle: 'quads',
          load_score: 72.3
        },
        {
          user_id: testUserId,
          date: sessionDateString,
          muscle: 'shoulders',
          load_score: 45.0
        }
      ])

    expect(muscleLoadError).toBeNull()
  })

  afterAll(async () => {
    // Clean up test data
    if (sessionId) {
      await supabase.from('session_finishers').delete().eq('session_id', sessionId)
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    }

    if (testUserId) {
      const sessionDate = new Date().toISOString().split('T')[0]
      await supabase.from('muscle_load_daily').delete()
        .eq('user_id', testUserId)
        .eq('date', sessionDate)
    }

    if (targetingProtocolId) {
      await supabase.from('mobility_protocols').delete().eq('id', targetingProtocolId)
    }

    if (nonTargetingProtocolId) {
      await supabase.from('mobility_protocols').delete().eq('id', nonTargetingProtocolId)
    }
  })

  describe('generateFinishers function', () => {
    test('should generate correct finisher protocol based on muscle load', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-finishers-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()
      expect(session?.access_token).toBeDefined()

      // Call the generateFinishers function
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/generateFinishers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.protocol_id).toBeDefined()
      
      // The function should select the protocol targeting hip_flexors/quads (highest load scores)
      // and not the shoulders protocol (lower load score)
      expect(result.protocol_id).toBe(targetingProtocolId)
      expect(result.protocol_id).not.toBe(nonTargetingProtocolId)

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "finisherAssigned", 
        { session_id: sessionId, protocol_id: targetingProtocolId }
      )

      // Verify the session_finisher was created correctly
      const { data: sessionFinisher, error: finisherError } = await supabase
        .from('session_finishers')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      expect(finisherError).toBeNull()
      expect(sessionFinisher.protocol_id).toBe(targetingProtocolId)
      expect(sessionFinisher.auto_assigned).toBe(true)
      expect(sessionFinisher.session_id).toBe(sessionId)
    })

    test('should return error for non-existent session', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-finishers-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      const fakeSessionId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/generateFinishers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: fakeSessionId
        })
      })

      expect(response.status).toBe(404)
      
      const result = await response.json()
      expect(result.error).toContain('Session not found')
    })

    test('should return error when no muscle load data exists', async () => {
      // Create a session with a date that has no muscle load data
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7) // 7 days in the future
      
      const { data: futureSession, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: testUserId,
          started_at: futureDate.toISOString(),
          notes: 'Future test session'
        })
        .select()
        .single()

      expect(sessionError).toBeNull()

      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-finishers-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/generateFinishers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: futureSession.id
        })
      })

      expect(response.status).toBe(404)
      
      const result = await response.json()
      expect(result.error).toContain('No muscle load data found')

      // Clean up
      await supabase.from('workout_sessions').delete().eq('id', futureSession.id)
    })

    test('should update existing session_finisher on conflict', async () => {
      // First, manually insert a session_finisher
      const { error: insertError } = await supabase
        .from('session_finishers')
        .insert({
          session_id: sessionId,
          protocol_id: nonTargetingProtocolId,
          auto_assigned: false
        })

      expect(insertError).toBeNull()

      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-finishers-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      // Call the generateFinishers function
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/generateFinishers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.protocol_id).toBe(targetingProtocolId)

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "finisherAssigned", 
        { session_id: sessionId, protocol_id: targetingProtocolId }
      )

      // Verify the session_finisher was updated (not duplicated)
      const { data: sessionFinishers, error: finishersError } = await supabase
        .from('session_finishers')
        .select('*')
        .eq('session_id', sessionId)

      expect(finishersError).toBeNull()
      expect(sessionFinishers).toHaveLength(1) // Should be only one record
      expect(sessionFinishers[0].protocol_id).toBe(targetingProtocolId)
      expect(sessionFinishers[0].auto_assigned).toBe(true) // Should be updated to true
    })
  })
})