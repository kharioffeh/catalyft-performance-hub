import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SoloWizard } from '../SoloWizard';
import { AuthProvider } from '@/contexts/AuthContext';
import * as ariaProgram from '../../../../packages/core/dist/api/aria-program';

// Mock the API
jest.mock('../../../../packages/core/dist/api/aria-program');
const mockGenerateProgram = jest.fn();
(ariaProgram.generateProgramWithAria as jest.Mock) = mockGenerateProgram;

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth context
const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'solo' as const,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  has_completed_onboarding: false,
};

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    profile: mockProfile,
    session: { user: { id: 'test-user-id' } },
    loading: false,
  }),
}));

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('SoloWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateProgram.mockResolvedValue({
      template_id: 'test-template-id',
      program_instance_id: 'test-program-id',
    });
  });

  it('renders the first step correctly', () => {
    render(
      <TestWrapper>
        <SoloWizard />
      </TestWrapper>
    );

    expect(screen.getByText("What's your training goal?")).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Hypertrophy')).toBeInTheDocument();
    expect(screen.getByText('Power')).toBeInTheDocument();
    expect(screen.getByText('Conditioning')).toBeInTheDocument();
  });

  it('progresses through all steps and calls API with correct payload', async () => {
    render(
      <TestWrapper>
        <SoloWizard />
      </TestWrapper>
    );

    // Step 1: Select goal
    fireEvent.click(screen.getByLabelText('Strength'));
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Select experience
    await waitFor(() => {
      expect(screen.getByText("What's your experience level?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Intermediate'));
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Select equipment
    await waitFor(() => {
      expect(screen.getByText('Available equipment')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Barbell'));
    fireEvent.click(screen.getByLabelText('Dumbbells'));
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Summary and completion
    await waitFor(() => {
      expect(screen.getByText('Ready to start training!')).toBeInTheDocument();
    });
    
    // Verify summary shows correct selections
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Barbell')).toBeInTheDocument();
    expect(screen.getByText('Dumbbells')).toBeInTheDocument();

    // Complete the wizard
    fireEvent.click(screen.getByText('Create My Program'));

    // Verify API was called with correct payload
    await waitFor(() => {
      expect(mockGenerateProgram).toHaveBeenCalledWith({
        goal: 'strength',
        weeks: 8,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        equipment: ['barbell', 'dumbbells'],
        prompt: 'Create a intermediate level strength training program with available equipment: barbell, dumbbells'
      });
    });

    // Verify navigation to training plan
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/training-plan');
    });
  });

  it('disables next button when no selection is made', () => {
    render(
      <TestWrapper>
        <SoloWizard />
      </TestWrapper>
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables next button when selection is made', () => {
    render(
      <TestWrapper>
        <SoloWizard />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText('Strength'));
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('allows going back to previous steps', async () => {
    render(
      <TestWrapper>
        <SoloWizard />
      </TestWrapper>
    );

    // Go to step 2
    fireEvent.click(screen.getByLabelText('Strength'));
    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText("What's your experience level?")).toBeInTheDocument();
    });

    // Go back to step 1
    fireEvent.click(screen.getByText('Back'));

    await waitFor(() => {
      expect(screen.getByText("What's your training goal?")).toBeInTheDocument();
    });
  });
});