
import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SoloDashboard from '../Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useLastSessionLoad } from '@/hooks/useLastSessionLoad';
import { useStress } from '@/hooks/useStress';
import { useAriaInsights } from '@/hooks/useAriaInsights';
import { useDashboardData } from '@/hooks/useDashboardData';

// Setup Jest DOM matchers
import '@testing-library/jest-dom';

// Mock the hooks
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useLastSessionLoad');
jest.mock('@/hooks/useStress');
jest.mock('@/hooks/useAriaInsights');
jest.mock('@/hooks/useDashboardData');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseLastSessionLoad = useLastSessionLoad as jest.MockedFunction<typeof useLastSessionLoad>;
const mockUseStress = useStress as jest.MockedFunction<typeof useStress>;
const mockUseAriaInsights = useAriaInsights as jest.MockedFunction<typeof useAriaInsights>;
const mockUseDashboardData = useDashboardData as jest.MockedFunction<typeof useDashboardData>;

const mockProfile = {
  id: 'test-athlete-id',
  email: 'athlete@test.com',
  full_name: 'Test Athlete',
  role: 'athlete' as const,
  created_at: '2023-01-01',
  updated_at: '2023-01-01'
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SoloDashboard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' } as any,
      profile: mockProfile,
      loading: false,
      session: { user: { id: 'test-user-id' } } as any,
      signOut: jest.fn()
    });

    mockUseDashboardData.mockReturnValue({
      currentReadiness: { score: 85, ts: '2023-01-01T00:00:00Z' },
      todaySessions: [],
      weeklyStats: { completed: 3, planned: 5 },
      injuryRisk: null
    });

    mockUseLastSessionLoad.mockReturnValue({
      data: 450,
      isLoading: false,
      error: null
    } as any);

    mockUseStress.mockReturnValue({
      data: { current: 45, average7d: 42, trend: 'stable', level: 'moderate', dailyReadings: [] },
      isLoading: false,
      error: null
    } as any);

    mockUseAriaInsights.mockReturnValue({
      data: 'Great recovery today! Consider increasing training intensity.',
      isLoading: false,
      error: null
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all five main cards', () => {
    const { getByText } = renderWithProviders(<SoloDashboard />);

    // Check for all five main cards
    expect(getByText('Recovery')).toBeInTheDocument();
    expect(getByText('Strain')).toBeInTheDocument();
    expect(getByText('Daily Stress')).toBeInTheDocument();
    expect(getByText('ARIA Insights')).toBeInTheDocument();
    expect(getByText('Muscle Load')).toBeInTheDocument();
  });

  it('displays metric values correctly', () => {
    const { getByText } = renderWithProviders(<SoloDashboard />);

    // Check readiness score
    expect(getByText('85%')).toBeInTheDocument();
    
    // Check last session load
    expect(getByText('450')).toBeInTheDocument();
    
    // Check ARIA insights
    expect(getByText('Great recovery today! Consider increasing training intensity.')).toBeInTheDocument();
  });

  it('shows loading states', () => {
    mockUseLastSessionLoad.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    } as any);

    mockUseAriaInsights.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    } as any);

    const { container } = renderWithProviders(<SoloDashboard />);

    // Check for loading animations
    const loadingElements = container.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('handles null values gracefully', () => {
    mockUseDashboardData.mockReturnValue({
      currentReadiness: null,
      todaySessions: [],
      weeklyStats: null,
      injuryRisk: null
    });

    mockUseLastSessionLoad.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    } as any);

    const { getAllByText } = renderWithProviders(<SoloDashboard />);

    // Should show dash for null values
    const dashElements = getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it('shows empty state for ARIA insights', () => {
    mockUseAriaInsights.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    } as any);

    const { getByText } = renderWithProviders(<SoloDashboard />);

    expect(getByText('No insights yet – log a session to see personalised advice.')).toBeInTheDocument();
  });
});
