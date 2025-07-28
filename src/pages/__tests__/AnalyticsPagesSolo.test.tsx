import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReadinessDetailPage from '../ReadinessDetailPage';
import LoadDetailPage from '../LoadDetailPage';
import Sleep from '../Sleep';

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { id: 'test-user', role: 'solo' }
  })
}));

// Mock hooks
jest.mock('@/hooks/useMetricData', () => ({
  useMetricData: () => ({ data: [], isLoading: false, error: null })
}));

jest.mock('@/hooks/useEnhancedMetrics', () => ({
  useEnhancedMetrics: () => ({
    readinessRolling: [{ readiness_score: 85 }],
    sleepDaily: [{ total_sleep_hours: 8 }],
    loadACWR: [{ acwr_7_28: 1.2 }],
    latestStrain: { value: 12 }
  })
}));

jest.mock('@/hooks/useSleep', () => ({
  useSleep: () => ({
    getLastNightSleep: () => null,
    getSleepScore: () => 85,
    getAverageSleepHours: () => 8,
    isLoading: false
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Analytics Pages - Solo User Copy', () => {
  it('should show "Your Readiness Analysis" title', () => {
    renderWithProviders(<ReadinessDetailPage />);
    expect(screen.getByText('Your Readiness Analysis')).toBeInTheDocument();
    expect(screen.getByText('Your detailed readiness trends and contributing factors')).toBeInTheDocument();
  });

  it('should show "Your Training Load Analysis" title', () => {
    renderWithProviders(<LoadDetailPage />);
    expect(screen.getByText('Your Training Load Analysis')).toBeInTheDocument();
    expect(screen.getByText('Your detailed training load trends and ACWR monitoring')).toBeInTheDocument();
  });

  it('should show "Your Sleep Analysis" title', () => {
    renderWithProviders(<Sleep />);
    expect(screen.getByText('Your Sleep Analysis')).toBeInTheDocument();
  });

  it('should not contain "Athlete" references in user-facing text', () => {
    renderWithProviders(<ReadinessDetailPage />);
    
    // Should not find "Athlete Readiness" anywhere
    expect(screen.queryByText(/Athlete Readiness/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Athletes/i)).not.toBeInTheDocument();
  });
});