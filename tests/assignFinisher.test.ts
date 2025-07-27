/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

describe('Assign Finisher API', () => {
  let supabase: any
  let testUserId: string
  let sessionId: string
  let protocol1Id: string
  let protocol2Id: string

  beforeAll(async () => {
    // Initialize Supabase client for testing
    supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
    )

    // Create a test user or use existing one
    const testEmail = `test-assign-finisher-${Date.now()}@example.com`
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
    const { data: protocol1, error: protocol1Error } = await supabase
      .from('mobility_protocols')
      .insert({
        name: 'Test Hip Protocol',
        description: 'Test protocol for hip mobility',
        steps: JSON.stringify([{ step: "Hip stretch", duration: 60 }]),
        muscle_targets: ['hip_flexors'],
        duration_min: 5
      })
      .select()
      .single()

    expect(protocol1Error).toBeNull()
    protocol1Id = protocol1.id

    const { data: protocol2, error: protocol2Error } = await supabase
      .from('mobility_protocols')
      .insert({
        name: 'Test Shoulder Protocol',
        description: 'Test protocol for shoulder mobility',
        steps: JSON.stringify([{ step: "Shoulder stretch", duration: 90 }]),
        muscle_targets: ['shoulders'],
        duration_min: 8
      })
      .select()
      .single()

    expect(protocol2Error).toBeNull()
    protocol2Id = protocol2.id

    // Create a test workout session
    const sessionDate = new Date().toISOString()
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: testUserId,
        started_at: sessionDate,
        notes: 'Test session for manual finisher assignment'
      })
      .select()
      .single()

    expect(sessionError).toBeNull()
    sessionId = session.id
  })

  afterAll(async () => {
    // Clean up test data
    if (sessionId) {
      await supabase.from('session_finishers').delete().eq('session_id', sessionId)
      await supabase.from('workout_sessions').delete().eq('id', sessionId)
    }

    if (protocol1Id) {
      await supabase.from('mobility_protocols').delete().eq('id', protocol1Id)
    }

    if (protocol2Id) {
      await supabase.from('mobility_protocols').delete().eq('id', protocol2Id)
    }
  })

  describe('assignFinisher function', () => {
    test('should manually assign finisher protocol with auto_assigned=false', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-assign-finisher-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()
      expect(session?.access_token).toBeDefined()

      // Call the assignFinisher function
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/assignFinisher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          protocol_id: protocol1Id
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.session_id).toBe(sessionId)
      expect(result.protocol_id).toBe(protocol1Id)

      // Verify the session_finisher was created correctly with auto_assigned=false
      const { data: sessionFinisher, error: finisherError } = await supabase
        .from('session_finishers')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      expect(finisherError).toBeNull()
      expect(sessionFinisher.protocol_id).toBe(protocol1Id)
      expect(sessionFinisher.auto_assigned).toBe(false)
      expect(sessionFinisher.session_id).toBe(sessionId)
    })

    test('should update existing assignment and maintain auto_assigned=false', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-assign-finisher-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      // Call the assignFinisher function with a different protocol
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/assignFinisher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          protocol_id: protocol2Id
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.session_id).toBe(sessionId)
      expect(result.protocol_id).toBe(protocol2Id)

      // Verify the session_finisher was updated (not duplicated)
      const { data: sessionFinishers, error: finishersError } = await supabase
        .from('session_finishers')
        .select('*')
        .eq('session_id', sessionId)

      expect(finishersError).toBeNull()
      expect(sessionFinishers).toHaveLength(1) // Should be only one record
      expect(sessionFinishers[0].protocol_id).toBe(protocol2Id)
      expect(sessionFinishers[0].auto_assigned).toBe(false) // Should remain false for manual assignment
    })

    test('should return error for missing session_id', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-assign-finisher-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/assignFinisher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          protocol_id: protocol1Id
        })
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.error).toContain('Missing required fields')
    })

    test('should return error for missing protocol_id', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-assign-finisher-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/assignFinisher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.error).toContain('Missing required fields')
    })

    test('should return error for non-existent session', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-assign-finisher-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      const fakeSessionId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/assignFinisher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: fakeSessionId,
          protocol_id: protocol1Id
        })
      })

      expect(response.status).toBe(404)
      
      const result = await response.json()
      expect(result.error).toContain('Session not found')
    })

    test('should return error for non-existent protocol', async () => {
      // Get auth token for the test user
      const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `test-assign-finisher-${testUserId.slice(-13)}@example.com`,
        password: 'testpassword123'
      })

      expect(authError).toBeNull()

      const fakeProtocolId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/assignFinisher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          protocol_id: fakeProtocolId
        })
      })

      expect(response.status).toBe(404)
      
      const result = await response.json()
      expect(result.error).toContain('Protocol not found')
    })
  })
})