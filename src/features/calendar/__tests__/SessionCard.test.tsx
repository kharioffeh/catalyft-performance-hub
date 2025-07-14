import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionCard } from '../SessionCard';
import { updateSessionStatus } from '@/lib/api/sessions';

// Mock dependencies
jest.mock('@/lib/api/sessions');
jest.mock('@/hooks/useGlassToast', () => ({
  useGlassToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

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

const mockPlannedSession = {
  id: 'session-1',
  athlete_uuid: 'athlete-1',
  coach_uuid: 'coach-1',
  type: 'strength',
  start_ts: '2024-01-15T09:00:00Z',
  end_ts: '2024-01-15T10:00:00Z',
  status: 'planned' as const,
  athletes: { name: 'John Doe' },
};

const mockActiveSession = {
  ...mockPlannedSession,
  status: 'active' as const,
};

const mockCompletedSession = {
  ...mockPlannedSession,
  status: 'completed' as const,
};

describe('SessionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders session information correctly', () => {
    const { getByText } = render(<SessionCard session={mockPlannedSession} />, { wrapper });

    expect(getByText('Strength Session')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('planned')).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
    expect(getByText('• 60m')).toBeTruthy();
  });

  it('shows start button only for planned sessions', () => {
    const { rerender, getByText, queryByText } = render(<SessionCard session={mockPlannedSession} />, { wrapper });
    expect(getByText('Start Session')).toBeTruthy();

    rerender(<SessionCard session={mockActiveSession} />);
    expect(queryByText('Start Session')).toBeNull();

    rerender(<SessionCard session={mockCompletedSession} />);
    expect(queryByText('Start Session')).toBeNull();
  });

  it('calls updateSessionStatus when start button is pressed', async () => {
    mockUpdateSessionStatus.mockResolvedValue(undefined);

    const { getByText } = render(<SessionCard session={mockPlannedSession} />, { wrapper });

    const startButton = getByText('Start Session');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        'session-1',
        'active',
        expect.any(String)
      );
    });
  });

  it('shows correct status colors', () => {
    const { rerender, getByText } = render(<SessionCard session={mockPlannedSession} />, { wrapper });
    const plannedBadge = getByText('planned');
    expect(plannedBadge.parent).toHaveStyle({ backgroundColor: '#3b82f6' });

    rerender(<SessionCard session={mockActiveSession} />);
    const activeBadge = getByText('active');
    expect(activeBadge.parent).toHaveStyle({ backgroundColor: '#22c55e' });

    rerender(<SessionCard session={mockCompletedSession} />);
    const completedBadge = getByText('completed');
    expect(completedBadge.parent).toHaveStyle({ backgroundColor: '#64748b' });
  });

  it('handles start session error with optimistic rollback', async () => {
    mockUpdateSessionStatus.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<SessionCard session={mockPlannedSession} />, { wrapper });

    const startButton = getByText('Start Session');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(mockUpdateSessionStatus).toHaveBeenCalled();
    });

    // Session should still show as planned after error
    expect(getByText('planned')).toBeTruthy();
  });
});