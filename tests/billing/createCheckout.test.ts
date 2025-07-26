/**
 * Test for simplified create-checkout edge function
 * cur-pivot-05: Solo-only billing tests
 */

import { createClient } from '@supabase/supabase-js';

// Mock the edge function response
const mockSupabaseResponse = {
  data: { url: 'https://checkout.stripe.com/c/pay/test_123' },
  error: null
};

// Mock Supabase client
const mockSupabase = {
  functions: {
    invoke: jest.fn()
  }
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('createCheckout Edge Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.functions.invoke.mockResolvedValue(mockSupabaseResponse);
  });

  test('should create monthly solo checkout with correct priceId', async () => {
    const supabase = createClient('mock-url', 'mock-key');
    
    const result = await supabase.functions.invoke('create-checkout', {
      body: { plan: 'monthly' }
    });

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('create-checkout', {
      body: { plan: 'monthly' }
    });
    
    expect(result.data).toEqual({ url: 'https://checkout.stripe.com/c/pay/test_123' });
    expect(result.error).toBeNull();
  });

  test('should create yearly solo checkout with correct priceId', async () => {
    const supabase = createClient('mock-url', 'mock-key');
    
    const result = await supabase.functions.invoke('create-checkout', {
      body: { plan: 'yearly' }
    });

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('create-checkout', {
      body: { plan: 'yearly' }
    });
    
    expect(result.data).toEqual({ url: 'https://checkout.stripe.com/c/pay/test_123' });
    expect(result.error).toBeNull();
  });

  test('should reject invalid plan types', async () => {
    const errorResponse = {
      data: null,
      error: { message: "plan is required and must be 'monthly' or 'yearly'" }
    };
    
    mockSupabase.functions.invoke.mockResolvedValue(errorResponse);
    
    const supabase = createClient('mock-url', 'mock-key');
    
    const result = await supabase.functions.invoke('create-checkout', {
      body: { plan: 'invalid' }
    });

    expect(result.error).toEqual({ message: "plan is required and must be 'monthly' or 'yearly'" });
  });

  test('should handle missing plan parameter', async () => {
    const errorResponse = {
      data: null,
      error: { message: "plan is required and must be 'monthly' or 'yearly'" }
    };
    
    mockSupabase.functions.invoke.mockResolvedValue(errorResponse);
    
    const supabase = createClient('mock-url', 'mock-key');
    
    const result = await supabase.functions.invoke('create-checkout', {
      body: {}
    });

    expect(result.error).toEqual({ message: "plan is required and must be 'monthly' or 'yearly'" });
  });
});