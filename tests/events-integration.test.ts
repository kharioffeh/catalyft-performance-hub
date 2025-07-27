/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

// Mock publishEvent function
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

describe('Events Integration Tests', () => {
  let supabase: any
  let testUserId: string
  let authToken: string
  let postId: string
  let clubId: string
  let challengeId: string
  let meetId: string

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
    const testEmail = `test-events-${Date.now()}@example.com`
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

    // Set up test data
    // Create a test post
    const { data: post, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: testUserId,
        caption: 'Test post for reactions'
      })
      .select()
      .single()
    
    expect(postError).toBeNull()
    postId = post.id

    // Create a test club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: 'Test Club',
        description: 'Test club for events'
      })
      .select()
      .single()
    
    expect(clubError).toBeNull()
    clubId = club.id

    // Create a test challenge
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        title: 'Test Challenge',
        description: 'Test challenge for events',
        start_date: new Date().toISOString(),
        end_date: futureDate.toISOString()
      })
      .select()
      .single()
    
    expect(challengeError).toBeNull()
    challengeId = challenge.id

    // Create a test meet
    const startTime = new Date()
    startTime.setHours(startTime.getHours() + 1)
    const endTime = new Date()
    endTime.setHours(endTime.getHours() + 2)

    const { data: meet, error: meetError } = await supabase
      .from('meets')
      .insert({
        title: 'Test Meet',
        description: 'Test meet for events',
        start_ts: startTime.toISOString(),
        end_ts: endTime.toISOString(),
        host_id: testUserId
      })
      .select()
      .single()
    
    expect(meetError).toBeNull()
    meetId = meet.id
  })

  afterAll(async () => {
    // Clean up test data
    if (postId) {
      await supabase.from('post_reactions').delete().eq('post_id', postId)
      await supabase.from('feed_posts').delete().eq('id', postId)
    }
    if (clubId) {
      await supabase.from('club_memberships').delete().eq('club_id', clubId)
      await supabase.from('clubs').delete().eq('id', clubId)
    }
    if (challengeId) {
      await supabase.from('challenge_participants').delete().eq('challenge_id', challengeId)
      await supabase.from('challenges').delete().eq('id', challengeId)
    }
    if (meetId) {
      await supabase.from('meet_rsvps').delete().eq('meet_id', meetId)
      await supabase.from('meets').delete().eq('id', meetId)
    }
  })

  describe('reactPost function', () => {
    test('should react to post and publish postReaction event', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/reactPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          post_id: postId,
          type: 'like'
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.action).toBe('added')

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "postReaction", 
        { post_id: postId, action: 'added', reaction_type: 'like' }
      )
    })
  })

  describe('joinClub function', () => {
    test('should join club and publish clubJoined event', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/joinClub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          club_id: clubId
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.message).toBe('Successfully joined club')

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "clubJoined", 
        { club_id: clubId }
      )
    })
  })

  describe('leaveClub function', () => {
    test('should leave club and publish clubLeft event', async () => {
      // First join the club (if not already joined from previous test)
      await supabase.from('club_memberships').upsert({
        club_id: clubId,
        user_id: testUserId
      })

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/leaveClub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          club_id: clubId
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.message).toBe('Successfully left club')

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "clubLeft", 
        { club_id: clubId }
      )
    })
  })

  describe('joinChallenge function', () => {
    test('should join challenge and publish challengeJoined event', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/joinChallenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          challenge_id: challengeId
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.participation).toBeDefined()
      expect(result.challenge.id).toBe(challengeId)

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "challengeJoined", 
        { challenge_id: challengeId }
      )
    })
  })

  describe('updateProgress function', () => {
    test('should update challenge progress and publish challengeProgressUpdated event', async () => {
      // Ensure user is participating in challenge
      await supabase.from('challenge_participants').upsert({
        challenge_id: challengeId,
        user_id: testUserId,
        progress: 0
      })

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/updateProgress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          progressDelta: 10
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.newProgress).toBe(10)
      expect(result.progressDelta).toBe(10)

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "challengeProgressUpdated", 
        { challenge_id: challengeId, progress: 10 }
      )
    })
  })

  describe('createMeet function', () => {
    test('should create meet and publish meetCreated event', async () => {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() + 3)
      const endTime = new Date()
      endTime.setHours(endTime.getHours() + 4)

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createMeet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'New Test Meet',
          description: 'Another test meet',
          start_ts: startTime.toISOString(),
          end_ts: endTime.toISOString()
        })
      })

      expect(response.status).toBe(201)
      
      const result = await response.json()
      expect(result.meet.id).toBeDefined()
      expect(result.meet.title).toBe('New Test Meet')

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "meetCreated", 
        { meet_id: result.meet.id }
      )

      // Clean up this test meet
      await supabase.from('meets').delete().eq('id', result.meet.id)
    })
  })

  describe('rsvpMeet function', () => {
    test('should RSVP to meet and publish meetRSVPUpdated event', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/rsvpMeet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          meet_id: meetId,
          status: 'yes'
        })
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.rsvp.id).toBeDefined()
      expect(result.rsvp.status).toBe('yes')

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "meetRSVPUpdated", 
        { meet_id: meetId, rsvp_id: result.rsvp.id, status: 'yes' }
      )
    })
  })
})