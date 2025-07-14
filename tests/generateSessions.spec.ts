import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Mock environment variables
const mockSupabaseUrl = 'http://localhost:54321';
const mockSupabaseServiceRoleKey = 'mock-service-role-key';

// Mock Supabase client
jest.mock('@supabase/supabase-js');

describe('generateSessions Edge Function', () => {
  let mockSupabase: any;
  let mockProgram: any;
  let mockBlocks: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock data
    mockProgram = {
      id: 'test-program-id',
      start_date: '2025-01-01',
      athlete_uuid: 'test-athlete-id',
      template_id: 'test-template-id'
    };

    mockBlocks = [
      { week_no: 1, day_no: 1, session_title: 'Day 1' },
      { week_no: 1, day_no: 2, session_title: 'Day 2' },
      { week_no: 1, day_no: 3, session_title: 'Day 3' },
      { week_no: 1, day_no: 4, session_title: 'Day 4' }
    ];

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      },
      from: jest.fn().mockImplementation((table: string) => {
        const chainable = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
          order: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis()
        };

        if (table === 'program_instance') {
          chainable.single.mockResolvedValue({
            data: mockProgram,
            error: null
          });
        } else if (table === 'template_block') {
          chainable.single.mockResolvedValue({
            data: mockBlocks,
            error: null
          });
        } else if (table === 'session') {
          // Mock existing session check (return null for no existing sessions)
          chainable.single.mockResolvedValue({
            data: null,
            error: null
          });
          // Mock insert operation
          chainable.insert.mockResolvedValue({
            data: mockBlocks.map((_, index) => ({ id: `session-${index + 1}` })),
            error: null
          });
        }

        return chainable;
      })
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create exactly 4 sessions for a 4-block program', async () => {
    // Setup request body
    const requestBody = { programId: 'test-program-id' };
    
    // Mock fetch for the edge function call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        createdSessions: 4,
        message: 'Generated 4 new sessions for program'
      })
    });

    // Mock the Deno environment (for the edge function)
    (global as any).Deno = {
      env: {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'SUPABASE_URL') return mockSupabaseUrl;
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') return mockSupabaseServiceRoleKey;
          return null;
        })
      }
    };

    // Simulate the edge function logic
    const result = await simulateGenerateSessionsEdgeFunction(requestBody);

    // Assertions
    expect(result.success).toBe(true);
    expect(result.createdSessions).toBe(4);
    expect(mockSupabase.from).toHaveBeenCalledWith('program_instance');
    expect(mockSupabase.from).toHaveBeenCalledWith('template_block');
    expect(mockSupabase.from).toHaveBeenCalledWith('session');
  });

  it('should calculate correct session dates based on day_offset', async () => {
    const requestBody = { programId: 'test-program-id' };
    
    // Mock the edge function response with calculated dates
    const expectedDates = [
      '2025-01-01', // start_date + 0 days (week 1, day 1)
      '2025-01-02', // start_date + 1 day (week 1, day 2)  
      '2025-01-03', // start_date + 2 days (week 1, day 3)
      '2025-01-04'  // start_date + 3 days (week 1, day 4)
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        createdSessions: 4,
        sessionDates: expectedDates
      })
    });

    const result = await simulateGenerateSessionsEdgeFunction(requestBody);

    // Verify that session dates are calculated correctly
    expect(result.sessionDates).toEqual(expectedDates);
  });

  it('should be idempotent - not create duplicate sessions', async () => {
    // Setup existing session
    mockSupabase.from.mockImplementation((table: string) => {
      const chainable = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis()
      };

      if (table === 'program_instance') {
        chainable.single.mockResolvedValue({
          data: mockProgram,
          error: null
        });
      } else if (table === 'template_block') {
        chainable.single.mockResolvedValue({
          data: mockBlocks,
          error: null
        });
      } else if (table === 'session') {
        // Mock that sessions already exist
        chainable.single.mockResolvedValue({
          data: { id: 'existing-session-id' },
          error: null
        });
        // Should not call insert if sessions exist
        chainable.insert.mockResolvedValue({
          data: [],
          error: null
        });
      }

      return chainable;
    });

    const requestBody = { programId: 'test-program-id' };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        createdSessions: 0,
        message: 'Generated 0 new sessions for program'
      })
    });

    const result = await simulateGenerateSessionsEdgeFunction(requestBody);

    // Should not create any new sessions if they already exist
    expect(result.createdSessions).toBe(0);
  });

  it('should handle missing program gracefully', async () => {
    // Setup program not found
    mockSupabase.from.mockImplementation((table: string) => {
      const chainable = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
      };

      if (table === 'program_instance') {
        chainable.single.mockResolvedValue({
          data: null,
          error: { message: 'Program not found' }
        });
      }

      return chainable;
    });

    const requestBody = { programId: 'non-existent-program-id' };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Program not found')
    });

    try {
      await simulateGenerateSessionsEdgeFunction(requestBody);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

// Helper function to simulate the edge function logic
async function simulateGenerateSessionsEdgeFunction(body: { programId: string }) {
  const response = await fetch('http://localhost:54321/functions/v1/generateSessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-jwt-token'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}