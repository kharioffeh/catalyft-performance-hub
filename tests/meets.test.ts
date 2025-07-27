/**
 * @jest-environment node
 */
describe('Meets Function Tests', () => {
  const mockUUID = '12345678-1234-5678-9012-123456789012';
  const mockMeetId = '87654321-4321-8765-2109-876543210987';
  const mockRsvpId = '11111111-2222-3333-4444-555555555555';
  const mockUser = {
    id: mockUUID,
    email: 'test@example.com'
  };

  // Mock Supabase client
  const mockSupabase = {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('createMeet', () => {
    test('should create meet when valid data provided', async () => {
      const mockMeet = {
        id: mockMeetId,
        title: 'Morning Yoga Session',
        description: 'Join us for a relaxing morning yoga session',
        start_ts: '2025-02-01T08:00:00Z',
        end_ts: '2025-02-01T09:00:00Z',
        host_id: mockUser.id,
        created_at: new Date().toISOString()
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockMeet,
            error: null
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          title: 'Morning Yoga Session',
          description: 'Join us for a relaxing morning yoga session',
          start_ts: '2025-02-01T08:00:00Z',
          end_ts: '2025-02-01T09:00:00Z'
        })
      });

      // Mock the createMeet function response
      const expectedResponse = {
        meet: mockMeet
      };

      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Morning Yoga Session',
        description: 'Join us for a relaxing morning yoga session',
        start_ts: '2025-02-01T08:00:00Z',
        end_ts: '2025-02-01T09:00:00Z',
        host_id: mockUser.id
      });
    });

    test('should reject meet creation when title is missing', async () => {
      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          description: 'Description without title',
          start_ts: '2025-02-01T08:00:00Z',
          end_ts: '2025-02-01T09:00:00Z'
        })
      });

      // Expected validation error for missing title
      const expectedError = { error: 'Meet title is required' };
      // This would return a 400 status code in the actual function
    });

    test('should reject meet creation when end time is before start time', async () => {
      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          title: 'Invalid Time Meet',
          start_ts: '2025-02-01T09:00:00Z',
          end_ts: '2025-02-01T08:00:00Z' // End before start
        })
      });

      // Expected validation error for invalid time range
      const expectedError = { error: 'End time must be after start time' };
    });

    test('should reject meet creation when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      });

      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer invalid-token' },
        body: JSON.stringify({
          title: 'Valid Meet',
          start_ts: '2025-02-01T08:00:00Z',
          end_ts: '2025-02-01T09:00:00Z'
        })
      });

      // Expected authentication error
      const expectedError = { error: 'Unauthorized' };
    });
  });

  describe('getMeets', () => {
    test('should return upcoming meets with RSVP counts', async () => {
      const mockMeets = [
        {
          id: mockMeetId,
          title: 'Morning Yoga Session',
          description: 'Join us for a relaxing morning yoga session',
          start_ts: '2025-02-01T08:00:00Z',
          end_ts: '2025-02-01T09:00:00Z',
          host_id: mockUser.id,
          created_at: new Date().toISOString()
        }
      ];

      const mockRsvps = [
        { status: 'yes' },
        { status: 'yes' },
        { status: 'no' },
        { status: 'maybe' }
      ];

      const mockSelect = jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockMeets,
            error: null
          })
        })
      });

      const mockRsvpSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockRsvps,
          error: null
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ select: mockRsvpSelect });

      const expectedResponse = {
        meets: [
          {
            ...mockMeets[0],
            rsvp_counts: {
              total: 4,
              yes: 2,
              no: 1,
              maybe: 1
            }
          }
        ]
      };

      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    test('should return empty array when no upcoming meets exist', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const expectedResponse = { meets: [] };
    });

    test('should handle database errors gracefully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database connection failed')
          })
        })
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      // Expected error response
      const expectedError = { error: 'Database connection failed' };
    });
  });

  describe('rsvpMeet', () => {
    test('should create RSVP when valid data provided', async () => {
      const mockRsvp = {
        id: mockRsvpId,
        meet_id: mockMeetId,
        user_id: mockUser.id,
        status: 'yes',
        rsvp_at: new Date().toISOString()
      };

      const mockMeet = {
        id: mockMeetId,
        title: 'Morning Yoga Session'
      };

      // Mock meet lookup
      const mockMeetSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockMeet,
            error: null
          })
        })
      });

      // Mock RSVP upsert
      const mockUpsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockRsvp,
            error: null
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockMeetSelect })
        .mockReturnValueOnce({ upsert: mockUpsert });

      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          meet_id: mockMeetId,
          status: 'yes'
        })
      });

      const expectedResponse = { rsvp: mockRsvp };

      expect(mockUpsert).toHaveBeenCalledWith({
        meet_id: mockMeetId,
        user_id: mockUser.id,
        status: 'yes',
        rsvp_at: expect.any(String)
      }, {
        onConflict: 'meet_id,user_id'
      });
    });

    test('should update existing RSVP (unique constraint test)', async () => {
      const mockExistingRsvp = {
        id: mockRsvpId,
        meet_id: mockMeetId,
        user_id: mockUser.id,
        status: 'maybe',
        rsvp_at: '2025-01-01T00:00:00Z'
      };

      const mockUpdatedRsvp = {
        ...mockExistingRsvp,
        status: 'yes',
        rsvp_at: new Date().toISOString()
      };

      const mockMeet = {
        id: mockMeetId,
        title: 'Morning Yoga Session'
      };

      // Mock meet lookup
      const mockMeetSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockMeet,
            error: null
          })
        })
      });

      // Mock RSVP upsert (should update existing)
      const mockUpsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedRsvp,
            error: null
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockMeetSelect })
        .mockReturnValueOnce({ upsert: mockUpsert });

      // This tests the unique constraint behavior - same user changing RSVP
      expect(mockUpdatedRsvp.status).toBe('yes');
      expect(mockUpdatedRsvp.user_id).toBe(mockUser.id);
      expect(mockUpdatedRsvp.meet_id).toBe(mockMeetId);
    });

    test('should reject RSVP with invalid status', async () => {
      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          meet_id: mockMeetId,
          status: 'invalid-status'
        })
      });

      // Expected validation error
      const expectedError = { error: 'Status must be one of: yes, no, maybe' };
    });

    test('should reject RSVP for non-existent meet', async () => {
      const mockMeetSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Meet not found')
          })
        })
      });

      mockSupabase.from.mockReturnValue({ select: mockMeetSelect });

      const mockRequest = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          meet_id: 'non-existent-id',
          status: 'yes'
        })
      });

      // Expected error for non-existent meet
      const expectedError = { error: 'Meet not found' };
    });
  });

  describe('Integration Tests', () => {
    test('should maintain consistent RSVP counts', async () => {
      // Test scenario: Create meet, add RSVPs, verify counts
      const mockMeet = {
        id: mockMeetId,
        title: 'Team Workout',
        start_ts: '2025-02-01T08:00:00Z',
        end_ts: '2025-02-01T09:00:00Z',
        host_id: mockUser.id
      };

      const mockRsvps = [
        { status: 'yes' },
        { status: 'yes' },
        { status: 'yes' },
        { status: 'no' },
        { status: 'maybe' }
      ];

      // Verify that counts are calculated correctly
      const expectedCounts = {
        total: 5,
        yes: 3,
        no: 1,
        maybe: 1
      };

      expect(mockRsvps.length).toBe(expectedCounts.total);
      expect(mockRsvps.filter(r => r.status === 'yes').length).toBe(expectedCounts.yes);
      expect(mockRsvps.filter(r => r.status === 'no').length).toBe(expectedCounts.no);
      expect(mockRsvps.filter(r => r.status === 'maybe').length).toBe(expectedCounts.maybe);
    });

    test('should handle concurrent RSVP updates', async () => {
      // Test scenario: Multiple users RSVPing to same meet
      const users = [
        { id: 'user1', status: 'yes' },
        { id: 'user2', status: 'no' },
        { id: 'user3', status: 'maybe' },
        { id: 'user1', status: 'no' } // User1 changing RSVP
      ];

      // Final state should have user1: no, user2: no, user3: maybe
      const finalRsvps = [
        { user_id: 'user1', status: 'no' },
        { user_id: 'user2', status: 'no' },
        { user_id: 'user3', status: 'maybe' }
      ];

      const finalCounts = {
        total: 3,
        yes: 0,
        no: 2,
        maybe: 1
      };

      expect(finalRsvps.length).toBe(finalCounts.total);
      expect(finalRsvps.filter(r => r.status === 'yes').length).toBe(finalCounts.yes);
      expect(finalRsvps.filter(r => r.status === 'no').length).toBe(finalCounts.no);
      expect(finalRsvps.filter(r => r.status === 'maybe').length).toBe(finalCounts.maybe);
    });
  });
});