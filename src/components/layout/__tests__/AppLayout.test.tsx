
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../AppLayout';
import { useAuth } from '@/contexts/AuthContext';

// Setup Jest DOM matchers
import '@testing-library/jest-dom';

// Mock the auth context
jest.mock('@/contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock other hooks and components
jest.mock('@/hooks/useBreakpoint', () => ({
  useIsMobile: () => false
}));

jest.mock('@/hooks/useSupabaseHash', () => ({
  useSupabaseHash: () => {}
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div>Mock Outlet</div>
}));

const mockProfile = {
  id: '123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'coach' as const,
  created_at: '2023-01-01',
  updated_at: '2023-01-01'
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AppLayout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '123' } as any,
      profile: mockProfile,
      loading: false,
      session: { user: { id: '123' } } as any,
      signOut: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders coach sidebar when user is a coach', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123' } as any,
      profile: { ...mockProfile, role: 'coach' },
      loading: false,
      session: { user: { id: '123' } } as any,
      signOut: jest.fn()
    });

    renderWithRouter(<AppLayout />);

    // Should contain coach-specific navigation items
    expect(screen.getByText('Athletes')).toBeInTheDocument();
    expect(screen.getByText('Risk Board')).toBeInTheDocument();
    expect(screen.getByLabelText('coach-sidebar')).toBeInTheDocument();
  });

  it('renders solo sidebar when user is an athlete', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123' } as any,
      profile: { ...mockProfile, role: 'athlete' },
      loading: false,
      session: { user: { id: '123' } } as any,
      signOut: jest.fn()
    });

    renderWithRouter(<AppLayout />);

    // Should NOT contain coach-specific items
    expect(screen.queryByText('Athletes')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk Board')).not.toBeInTheDocument();
    expect(screen.getByLabelText('solo-sidebar')).toBeInTheDocument();
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      session: null,
      signOut: jest.fn()
    });

    renderWithRouter(<AppLayout />);

    expect(screen.getByText('Loading your account...')).toBeInTheDocument();
  });

  it('shows error state when profile is missing', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123' } as any,
      profile: null,
      loading: false,
      session: { user: { id: '123' } } as any,
      signOut: jest.fn()
    });

    renderWithRouter(<AppLayout />);

    expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });
});
