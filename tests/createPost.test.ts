/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js'

// Mock publishEvent function
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

describe('CreatePost API', () => {
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
    const testEmail = `test-createpost-${Date.now()}@example.com`
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
      await supabase.from('feed_posts').delete().eq('user_id', testUserId)
    }
  })

  describe('createPost function', () => {
    test('should create post and publish postCreated event', async () => {
      const postData = {
        caption: 'Test workout post!',
        media_url: 'https://example.com/image.jpg'
      }

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(postData)
      })

      expect(response.status).toBe(201)
      
      const result = await response.json()
      expect(result.post.id).toBeDefined()
      expect(result.post.caption).toBe('Test workout post!')
      expect(result.post.media_url).toBe('https://example.com/image.jpg')

      // Verify publishEvent was called with correct parameters
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
      expect(mockPublishEvent).toHaveBeenCalledWith(
        testUserId, 
        "postCreated", 
        { post_id: result.post.id }
      )
    })

    test('should create post with caption only', async () => {
      const postData = {
        caption: 'Text only post'
      }

      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(postData)
      })

      expect(response.status).toBe(201)
      
      const result = await response.json()
      expect(result.post.caption).toBe('Text only post')

      // Verify publishEvent was called
      expect(mockPublishEvent).toHaveBeenCalledTimes(1)
    })

    test('should return 400 when no caption or media provided', async () => {
      const response = await fetch(`${process.env.SUPABASE_URL || 'http://localhost:54321'}/functions/v1/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.error).toBe('Caption or media is required')

      // Verify publishEvent was not called
      expect(mockPublishEvent).toHaveBeenCalledTimes(0)
    })
  })
})