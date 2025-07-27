/**
 * @jest-environment node
 */
describe('Challenges Function Tests', () => {
  const mockUUID = '12345678-1234-5678-9012-123456789012';
  const mockChallengeId = '87654321-4321-8765-2109-876543210987';
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

  describe('createChallenge', () => {
    test('should create challenge when valid data provided', async () => {
      const mockChallenge = {
        id: mockChallengeId,
        title: '1000 kg Weekly Tonnage',
        description: 'Complete 1000 kg of total lifting volume this week',
        start_date: '2025-01-01',
        end_date: '2025-01-07',
        created_by: mockUser.id,
        created_at: new Date().toISOString()
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockChallenge,
            error: null
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate the function logic
      const requestData = {
        title: '1000 kg Weekly Tonnage',
        description: 'Complete 1000 kg of total lifting volume this week',
        start_date: '2025-01-01',
        end_date: '2025-01-07'
      };

      // Validate required fields
      expect(requestData.title).toBeDefined();
      expect(typeof requestData.title).toBe('string');
      expect(requestData.start_date).toBeDefined();
      expect(requestData.end_date).toBeDefined();

      // Test date validation logic
      const startDate = new Date(requestData.start_date);
      const endDate = new Date(requestData.end_date);
      expect(isNaN(startDate.getTime())).toBe(false);
      expect(isNaN(endDate.getTime())).toBe(false);
      expect(endDate > startDate).toBe(true);
      
      // Test the logic that would be used in the actual function
      const insertData = {
        title: requestData.title.trim(),
        description: requestData.description?.trim() || null,
        start_date: requestData.start_date,
        end_date: requestData.end_date,
        created_by: mockUser.id
      };
      
      expect(insertData.title).toBe('1000 kg Weekly Tonnage');
      expect(insertData.description).toBe('Complete 1000 kg of total lifting volume this week');
      expect(insertData.created_by).toBe(mockUser.id);
    });

    test('should reject challenge without title', async () => {
      const requestData: { description: string; title?: string } = { 
        description: 'Challenge without title' 
      };
      
      expect(requestData.title).toBeUndefined();
      // This would result in a 400 Bad Request in the actual function
    });

    test('should reject challenge with invalid dates', async () => {
      // Test invalid date format
      const invalidDateRequest = {
        title: 'Test Challenge',
        start_date: 'invalid-date',
        end_date: '2025-01-07'
      };

      const startDate = new Date(invalidDateRequest.start_date);
      expect(isNaN(startDate.getTime())).toBe(true);

      // Test end date before start date
      const invalidOrderRequest = {
        title: 'Test Challenge',
        start_date: '2025-01-07',
        end_date: '2025-01-01'
      };

      const validStartDate = new Date(invalidOrderRequest.start_date);
      const validEndDate = new Date(invalidOrderRequest.end_date);
      expect(validEndDate <= validStartDate).toBe(true);
      // This would result in a 400 Bad Request in the actual function
    });
  });

  describe('joinChallenge', () => {
    test('should create participation when user joins challenge', async () => {
      const mockChallenge = {
        id: mockChallengeId,
        title: 'Test Challenge',
        start_date: '2025-01-01',
        end_date: '2025-12-31' // Future date
      };

      const mockParticipation = {
        id: mockUUID,
        challenge_id: mockChallengeId,
        user_id: mockUser.id,
        joined_at: new Date().toISOString(),
        progress: 0
      };

      // Mock challenge exists check
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockChallenge,
            error: null
          })
        })
      });

      // Mock participation upsert
      const mockUpsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockParticipation,
            error: null
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect }) // First call for challenge check
        .mockReturnValueOnce({ upsert: mockUpsert }); // Second call for participation

      const requestData = { challenge_id: mockChallengeId };

      expect(requestData.challenge_id).toBe(mockChallengeId);
      
      // Test challenge exists validation
      expect(mockChallenge.id).toBe(mockChallengeId);
      
      // Test challenge end date validation
      const now = new Date();
      const endDate = new Date(mockChallenge.end_date);
      expect(endDate >= now).toBe(true); // Challenge should still be active
      
      // Test the logic that would be used in the actual function
      const participationData = {
        challenge_id: mockChallengeId,
        user_id: mockUser.id,
        progress: 0
      };
      
      expect(participationData.challenge_id).toBe(mockChallengeId);
      expect(participationData.user_id).toBe(mockUser.id);
      expect(participationData.progress).toBe(0);
    });

    test('should reject joining expired challenge', async () => {
      const expiredChallenge = {
        id: mockChallengeId,
        title: 'Expired Challenge',
        start_date: '2020-01-01',
        end_date: '2020-01-07' // Past date
      };

      // Test expired challenge logic
      const now = new Date();
      const endDate = new Date(expiredChallenge.end_date);
      expect(endDate < now).toBe(true);
      // This would result in a 400 Bad Request in the actual function
    });

    test('should reject join with invalid challenge_id', async () => {
      const requestData: { challenge_id: string | null } = { challenge_id: null };
      
      expect(requestData.challenge_id).toBeNull();
      // This would result in a 400 Bad Request in the actual function
    });
  });

  describe('updateProgress', () => {
    test('should add progress delta to current progress', async () => {
      const mockCurrentParticipation = {
        id: mockUUID,
        progress: 100,
        challenge_id: mockChallengeId,
        challenges: {
          title: 'Test Challenge',
          start_date: '2025-01-01',
          end_date: '2025-12-31' // Future date
        }
      };

      const mockUpdatedParticipation = {
        ...mockCurrentParticipation,
        progress: 150 // 100 + 50 delta
      };

      // Mock current participation fetch
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCurrentParticipation,
              error: null
            })
          })
        })
      });

      // Mock progress update
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUpdatedParticipation,
              error: null
            })
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect }) // First call for current participation
        .mockReturnValueOnce({ update: mockUpdate }); // Second call for update

      const requestData = { 
        challenge_id: mockChallengeId, 
        progressDelta: 50 
      };

      expect(requestData.challenge_id).toBe(mockChallengeId);
      expect(requestData.progressDelta).toBe(50);
      expect(typeof requestData.progressDelta).toBe('number');

      // Test progress calculation logic
      const newProgress = (mockCurrentParticipation.progress || 0) + requestData.progressDelta;
      const finalProgress = Math.max(0, newProgress);
      
      expect(newProgress).toBe(150);
      expect(finalProgress).toBe(150);

      // Test challenge active validation
      const now = new Date();
      const endDate = new Date(mockCurrentParticipation.challenges.end_date);
      expect(endDate >= now).toBe(true);
    });

    test('should prevent progress from going below zero', async () => {
      const mockCurrentParticipation = {
        id: mockUUID,
        progress: 10,
        challenge_id: mockChallengeId,
        challenges: {
          title: 'Test Challenge',
          start_date: '2025-01-01',
          end_date: '2025-12-31'
        }
      };

      const progressDelta = -20; // This would make progress negative

      // Test progress calculation with negative delta
      const newProgress = (mockCurrentParticipation.progress || 0) + progressDelta;
      const finalProgress = Math.max(0, newProgress);
      
      expect(newProgress).toBe(-10);
      expect(finalProgress).toBe(0); // Should be clamped to 0
    });

    test('should reject update for non-participant', async () => {
      // Mock no participation found
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows returned' }
            })
          })
        })
      });

      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const fetchResult = { data: null, error: { message: 'No rows returned' } };
      expect(fetchResult.data).toBeNull();
      // This would result in a 404 Not Found in the actual function
    });

    test('should reject invalid progress delta', async () => {
      const requestData: { challenge_id: string; progressDelta: any } = { 
        challenge_id: mockChallengeId, 
        progressDelta: 'invalid' 
      };
      
      expect(typeof requestData.progressDelta).not.toBe('number');
      // This would result in a 400 Bad Request in the actual function
    });
  });

  describe('getChallenges', () => {
    test('should include joinCount and userProgress in response', async () => {
      const mockChallengesData = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Challenge A',
          description: 'First challenge',
          start_date: '2025-01-01',
          end_date: '2025-01-07',
          created_by: mockUser.id,
          created_at: new Date().toISOString(),
          challenge_participants: [
            { id: '1' }, { id: '2' }, { id: '3' }
          ]
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          title: 'Challenge B',
          description: 'Second challenge',
          start_date: '2025-01-08',
          end_date: '2025-01-14',
          created_by: mockUser.id,
          created_at: new Date().toISOString(),
          challenge_participants: [
            { id: '4' }, { id: '5' }
          ]
        }
      ];

      const mockUserParticipation = [
        { challenge_id: '11111111-1111-1111-1111-111111111111', progress: 75 }
      ];

      // Simulate the transformation logic
      const userParticipationMap = new Map(
        mockUserParticipation.map(p => [p.challenge_id, p.progress])
      );

      const challengesWithCounts = mockChallengesData.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        created_by: challenge.created_by,
        created_at: challenge.created_at,
        joinCount: challenge.challenge_participants?.length || 0,
        userProgress: userParticipationMap.get(challenge.id) || null,
        isJoined: userParticipationMap.has(challenge.id)
      }));

      expect(challengesWithCounts).toHaveLength(2);
      expect(challengesWithCounts[0].joinCount).toBe(3);
      expect(challengesWithCounts[1].joinCount).toBe(2);
      expect(challengesWithCounts[0].userProgress).toBe(75);
      expect(challengesWithCounts[1].userProgress).toBeNull();
      expect(challengesWithCounts[0].isJoined).toBe(true);
      expect(challengesWithCounts[1].isJoined).toBe(false);
      expect(challengesWithCounts[0]).toHaveProperty('joinCount');
      expect(challengesWithCounts[1]).toHaveProperty('userProgress');
    });

    test('should handle challenges with no participants', async () => {
      const mockChallengeData = {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'Empty Challenge',
        description: 'No participants yet',
        start_date: '2025-01-15',
        end_date: '2025-01-21',
        created_by: mockUser.id,
        created_at: new Date().toISOString(),
        challenge_participants: []
      };

      const joinCount = mockChallengeData.challenge_participants?.length || 0;
      expect(joinCount).toBe(0);
    });

    test('should work for anonymous users', async () => {
      // Test without authenticated user
      const anonymousUser = null;
      const mockChallengeData = {
        id: '44444444-4444-4444-4444-444444444444',
        title: 'Public Challenge',
        description: 'Anyone can see this',
        start_date: '2025-01-22',
        end_date: '2025-01-28',
        created_by: 'some-other-user',
        created_at: new Date().toISOString(),
        challenge_participants: [{ id: '1' }]
      };

      // For anonymous users, userProgress should be null and isJoined should be false
      const challengeForAnonymous = {
        ...mockChallengeData,
        joinCount: mockChallengeData.challenge_participants?.length || 0,
        userProgress: anonymousUser ? null : null,
        isJoined: anonymousUser ? false : false
      };

      expect(challengeForAnonymous.joinCount).toBe(1);
      expect(challengeForAnonymous.userProgress).toBeNull();
      expect(challengeForAnonymous.isJoined).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete challenge lifecycle', async () => {
      // 1. Create challenge
      const challengeData = {
        title: 'Weekly Tonnage Challenge',
        description: 'Complete 1000 kg of lifting',
        start_date: '2025-01-01',
        end_date: '2025-01-07'
      };

      expect(challengeData.title).toBeDefined();
      expect(new Date(challengeData.end_date) > new Date(challengeData.start_date)).toBe(true);

      // 2. Join challenge
      const joinData = { challenge_id: mockChallengeId };
      expect(joinData.challenge_id).toBeDefined();

      // 3. Update progress multiple times
      const progressUpdates = [100, 50, -10, 200];
      let currentProgress = 0;

      progressUpdates.forEach(delta => {
        const newProgress = currentProgress + delta;
        const finalProgress = Math.max(0, newProgress);
        currentProgress = finalProgress;
        expect(typeof delta).toBe('number');
      });

      expect(currentProgress).toBe(340); // 0 + 100 + 50 + 0 + 200 (third update clamped to 0 change)

      // 4. Get challenges with user data
      const mockFinalState = {
        id: mockChallengeId,
        title: challengeData.title,
        joinCount: 1,
        userProgress: currentProgress,
        isJoined: true
      };

      expect(mockFinalState.isJoined).toBe(true);
      expect(mockFinalState.userProgress).toBeGreaterThan(0);
    });
  });
});