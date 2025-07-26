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

  it('should render all tab labels correctly', () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    expect(screen.getByText('Programs')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('should have correct data attributes for tabs', () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    const programsTab = screen.getByText('Programs').closest('button');
    const historyTab = screen.getByText('History').closest('button');
    
    expect(programsTab).toHaveAttribute('data-variant', 'programs');
    expect(historyTab).toHaveAttribute('data-variant', 'history');
  });

  it('should navigate to correct routes when tabs are clicked', async () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    fireEvent.click(screen.getByText('History'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/training-plan/instances');
    });

    fireEvent.click(screen.getByText('Library'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/training-plan/library');
    });
  });

  it('should show Programs tab as active by default', () => {
    renderWithProviders(<TrainingPlanTabs />);
    
    const programsTab = screen.getByText('Programs').closest('button');
    expect(programsTab).toHaveAttribute('data-state', 'active');
  });
});