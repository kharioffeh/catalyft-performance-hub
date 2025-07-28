import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrainingPlanTabs } from '../TrainingPlanTabs';

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/training-plan/programs' })
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

describe('TrainingPlanTabs', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render the My Programs tab label correctly', () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    expect(screen.getByText('My Programs')).toBeInTheDocument();
  });

  it('should have correct data attributes for the Programs tab', () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    const programsTab = screen.getByText('My Programs').closest('button');
    
    expect(programsTab).toHaveAttribute('data-variant', 'programs');
  });

  it('should show My Programs tab as active by default', () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    const programsTab = screen.getByText('My Programs').closest('button');
    expect(programsTab).toHaveAttribute('data-state', 'active');
  });

  it('should navigate to programs route when tab is clicked', async () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    fireEvent.click(screen.getByText('My Programs'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/training-plan/programs');
    });
  });
});