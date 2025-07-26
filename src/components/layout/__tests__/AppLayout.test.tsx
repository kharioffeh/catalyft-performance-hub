
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../../AppLayout';
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
  role: 'solo' as const,
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

  it('renders solo sidebar when user is authenticated', () => {
    const { getByLabelText, queryByText } = renderWithRouter(<AppLayout />);

    // Should render solo sidebar
    expect(getByLabelText('solo-sidebar')).toBeInTheDocument();
    
    // Should NOT contain coach-specific items (ensuring cleanup)
    expect(queryByText('Athletes')).not.toBeInTheDocument();
    expect(queryByText('Risk Board')).not.toBeInTheDocument();
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      session: null,
      signOut: jest.fn()
    });

    const { getByText } = renderWithRouter(<AppLayout />);

    expect(getByText('Loading your account...')).toBeInTheDocument();
  });

  it('shows error state when profile is missing', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123' } as any,
      profile: null,
      loading: false,
      session: { user: { id: '123' } } as any,
      signOut: jest.fn()
    });

    const { getByText } = renderWithRouter(<AppLayout />);

    expect(getByText('Profile Not Found')).toBeInTheDocument();
    expect(getByText('Refresh Page')).toBeInTheDocument();
  });
});
