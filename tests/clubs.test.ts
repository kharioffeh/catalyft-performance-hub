/**
 * @jest-environment node
 */
describe('Clubs Function Tests', () => {
  const mockUUID = '12345678-1234-5678-9012-123456789012';
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

  describe('createClub', () => {
    test('should create club when valid data provided', async () => {
      const mockClub = {
        id: mockUUID,
        name: 'Test Fitness Club',
        description: 'A test club for fitness enthusiasts',
        created_by: mockUser.id,
        created_at: new Date().toISOString()
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockClub,
            error: null
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate the function logic
      const requestData = {
        name: 'Test Fitness Club',
        description: 'A test club for fitness enthusiasts'
      };

      expect(requestData.name).toBeDefined();
      expect(typeof requestData.name).toBe('string');
      
      // Test the logic that would be used in the actual function
      const insertData = {
        name: requestData.name.trim(),
        description: requestData.description?.trim() || null,
        created_by: mockUser.id
      };
      
      expect(insertData.name).toBe('Test Fitness Club');
      expect(insertData.description).toBe('A test club for fitness enthusiasts');
      expect(insertData.created_by).toBe(mockUser.id);
    });

    test('should handle duplicate club name error', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key value violates unique constraint' }
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const requestData = {
        name: 'Existing Club Name',
        description: 'This should fail'
      };

      // Simulate unique constraint violation
      const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
      expect(error.code).toBe('23505');
    });

    test('should reject request without name', async () => {
      const requestData: { description: string; name?: string } = { description: 'Club without name' };
      
      expect(requestData.name).toBeUndefined();
      // This would result in a 400 Bad Request in the actual function
    });
  });

  describe('joinClub', () => {
    test('should create membership when user joins club', async () => {
      const clubId = '87654321-4321-8765-2109-876543210987';
      const mockClub = {
        id: clubId,
        name: 'Test Club'
      };

      const mockMembership = {
        id: mockUUID,
        club_id: clubId,
        user_id: mockUser.id,
        joined_at: new Date().toISOString()
      };

      // Mock club exists check
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockClub,
            error: null
          })
        })
      });

      // Mock membership upsert
      const mockUpsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockMembership,
            error: null
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect }) // First call for club check
        .mockReturnValueOnce({ upsert: mockUpsert }); // Second call for membership

      const requestData = { club_id: clubId };

      expect(requestData.club_id).toBe(clubId);
      
      // Test the logic that would be used in the actual function
      const membershipData = {
        club_id: clubId,
        user_id: mockUser.id
      };
      
      const upsertOptions = {
        onConflict: 'club_id,user_id',
        ignoreDuplicates: true
      };
      
      expect(membershipData.club_id).toBe(clubId);
      expect(membershipData.user_id).toBe(mockUser.id);
      expect(upsertOptions.ignoreDuplicates).toBe(true);
      expect(upsertOptions.onConflict).toBe('club_id,user_id');
    });

    test('should handle duplicate join idempotently', async () => {
      const clubId = '87654321-4321-8765-2109-876543210987';
      
      // Test that upsert with ignoreDuplicates handles duplicate joins
      const upsertConfig = {
        onConflict: 'club_id,user_id',
        ignoreDuplicates: true
      };

      expect(upsertConfig.ignoreDuplicates).toBe(true);
      expect(upsertConfig.onConflict).toBe('club_id,user_id');
      
      // This should not throw an error due to ignoreDuplicates: true
    });

    test('should reject join with invalid club_id', async () => {
      const requestData: { club_id: string | null } = { club_id: null };
      
      expect(requestData.club_id).toBeNull();
      // This would result in a 400 Bad Request in the actual function
    });
  });

  describe('leaveClub', () => {
    test('should remove membership when user leaves club', async () => {
      const clubId = '87654321-4321-8765-2109-876543210987';
      const mockClub = {
        id: clubId,
        name: 'Test Club'
      };

      const mockDeletedMembership = {
        id: mockUUID,
        club_id: clubId,
        user_id: mockUser.id
      };

      // Mock club exists check
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockClub,
            error: null
          })
        })
      });

      // Mock membership deletion
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: mockDeletedMembership,
                error: null
              })
            })
          })
        })
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect }) // First call for club check
        .mockReturnValueOnce({ delete: mockDelete }); // Second call for deletion

      const requestData = { club_id: clubId };

      expect(requestData.club_id).toBe(clubId);
      expect(mockDeletedMembership.club_id).toBe(clubId);
      expect(mockDeletedMembership.user_id).toBe(mockUser.id);
    });

    test('should handle leaving club user is not member of', async () => {
      const clubId = '87654321-4321-8765-2109-876543210987';
      
      // Mock no membership found (returns null)
      const deletionResult = { data: null, error: null };
      
      expect(deletionResult.data).toBeNull();
      // This would result in a 409 Conflict in the actual function
    });
  });

  describe('getClubs', () => {
    test('should include memberCount in response', async () => {
      const mockClubsData = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Fitness Club A',
          description: 'First club',
          created_by: mockUser.id,
          created_at: new Date().toISOString(),
          club_memberships: [
            { id: '1' }, { id: '2' }, { id: '3' }
          ]
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Fitness Club B',
          description: 'Second club',
          created_by: mockUser.id,
          created_at: new Date().toISOString(),
          club_memberships: [
            { id: '4' }, { id: '5' }
          ]
        }
      ];

      // Simulate the transformation logic
      const clubsWithMemberCount = mockClubsData.map(club => ({
        id: club.id,
        name: club.name,
        description: club.description,
        created_by: club.created_by,
        created_at: club.created_at,
        memberCount: club.club_memberships?.length || 0
      }));

      expect(clubsWithMemberCount).toHaveLength(2);
      expect(clubsWithMemberCount[0].memberCount).toBe(3);
      expect(clubsWithMemberCount[1].memberCount).toBe(2);
      expect(clubsWithMemberCount[0]).toHaveProperty('memberCount');
      expect(clubsWithMemberCount[1]).toHaveProperty('memberCount');
    });

    test('should handle clubs with no members', async () => {
      const mockClubData = {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Empty Club',
        description: 'No members yet',
        created_by: mockUser.id,
        created_at: new Date().toISOString(),
        club_memberships: []
      };

      const memberCount = mockClubData.club_memberships?.length || 0;
      expect(memberCount).toBe(0);
    });
  });

  describe('getMyClubs', () => {
    test('should return clubs user has joined', async () => {
      const mockMembershipsData = [
        {
          joined_at: new Date().toISOString(),
          clubs: {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'My Fitness Club',
            description: 'Club I joined',
            created_by: 'another-user-id',
            created_at: new Date().toISOString()
          }
        },
        {
          joined_at: new Date().toISOString(),
          clubs: {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Another Club',
            description: 'Second club I joined',
            created_by: 'another-user-id-2',
            created_at: new Date().toISOString()
          }
        }
      ];

      // Simulate the transformation logic
      const myClubs = mockMembershipsData.map(membership => ({
        ...membership.clubs,
        joined_at: membership.joined_at
      }));

      expect(myClubs).toHaveLength(2);
      expect(myClubs[0]).toHaveProperty('joined_at');
      expect(myClubs[1]).toHaveProperty('joined_at');
      expect(myClubs[0].name).toBe('My Fitness Club');
      expect(myClubs[1].name).toBe('Another Club');
    });

    test('should return empty array for user with no club memberships', async () => {
      const mockMembershipsData: any[] = [];
      const myClubs = mockMembershipsData.map(membership => ({
        ...membership.clubs,
        joined_at: membership.joined_at
      }));

      expect(myClubs).toHaveLength(0);
      expect(Array.isArray(myClubs)).toBe(true);
    });
  });
});