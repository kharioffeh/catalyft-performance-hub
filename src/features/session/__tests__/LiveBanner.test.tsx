import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveBanner } from '../LiveBanner';
import { useActiveSession } from '@/hooks/useActiveSession';
import { updateSessionStatus } from '@/lib/api/sessions';

// Mock dependencies
jest.mock('@/hooks/useActiveSession');
jest.mock('@/lib/api/sessions');
jest.mock('@/hooks/useGlassToast', () => ({
  useGlassToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockUseActiveSession = useActiveSession as jest.MockedFunction<typeof useActiveSession>;
const mockUpdateSessionStatus = updateSessionStatus as jest.MockedFunction<typeof updateSessionStatus>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('LiveBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not render when no active session', () => {
    mockUseActiveSession.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    const { toJSON } = render(<LiveBanner />, { wrapper });
    expect(toJSON()).toBeNull();
  });

  it('renders timer and updates every second', async () => {
    const mockSession = {
      id: 'session-1',
      type: 'strength',
      start_ts: new Date(Date.now() - 65000).toISOString(), // 1 minute 5 seconds ago
      status: 'active' as const,
    };

    mockUseActiveSession.mockReturnValue({
      data: mockSession,
      isLoading: false,
      error: null,
    } as any);

    const { getByText } = render(<LiveBanner />, { wrapper });

    // Check initial time display
    expect(getByText('01:05')).toBeTruthy();

    // Advance timer by 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(getByText('01:06')).toBeTruthy();
    });
  });

  it('calls updateSessionStatus when end button is pressed', async () => {
    const mockSession = {
      id: 'session-1',
      type: 'strength',
      start_ts: new Date().toISOString(),
      status: 'active' as const,
    };

    mockUseActiveSession.mockReturnValue({
      data: mockSession,
      isLoading: false,
      error: null,
    } as any);

    mockUpdateSessionStatus.mockResolvedValue(undefined);

    const { getByText } = render(<LiveBanner />, { wrapper });

    const endButton = getByText('End');
    fireEvent.press(endButton);

    await waitFor(() => {
      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'session-1',
        'completed',
        expect.any(String)
      );
    });
  });

  it('handles network error with optimistic update rollback', async () => {
    const mockSession = {
      id: 'session-1',
      type: 'strength',
      start_ts: new Date().toISOString(),
      status: 'active' as const,
    };

    mockUseActiveSession.mockReturnValue({
      data: mockSession,
      isLoading: false,
      error: null,
    } as any);

    mockUpdateSessionStatus.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<LiveBanner />, { wrapper });

    const endButton = getByText('End');
    fireEvent.press(endButton);

    await waitFor(() => {
      expect(mockUpdateSessionStatus).toHaveBeenCalled();
    });

    // Banner should still be visible after error (optimistic rollback)
    expect(getByText('Now')).toBeTruthy();
  });
});