import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Calendar from '@/pages/Calendar';
import { Session } from '@/types/training';

// Mock the hooks
jest.mock('@/hooks/useSessions', () => ({
  useSessions: jest.fn(() => ({
    data: [
      {
        id: '1',
        athlete_uuid: 'athlete1',
        coach_uuid: 'coach1',
        start_ts: '2024-01-15T10:00:00Z',
        end_ts: '2024-01-15T11:00:00Z',
        type: 'strength',
        status: 'planned',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:00:00Z',
        program_id: 'prog1',
        planned_at: '2024-01-15',
        title: 'Upper Body Strength',
        exercises: []
      } as Session,
      {
        id: '2', 
        athlete_uuid: 'athlete1',
        coach_uuid: 'coach1',
        start_ts: '2024-01-16T10:00:00Z',
        end_ts: '2024-01-16T11:00:00Z',
        type: 'power',
        status: 'active',
        created_at: '2024-01-16T09:00:00Z',
        updated_at: '2024-01-16T09:00:00Z',
        program_id: 'prog1',
        planned_at: '2024-01-16',
        title: 'Lower Body Power',
        exercises: []
      } as Session
    ],
    isLoading: false
  }))
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useIsMobile: jest.fn(() => false)
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    profile: { id: 'user1', role: 'athlete' }
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar({ events, eventClick }: any) {
    return (
      <div data-testid="fullcalendar">
        {events.map((event: any) => (
          <div
            key={event.id}
            data-testid={`event-${event.id}`}
            onClick={() => eventClick({ event })}
            style={{ backgroundColor: event.backgroundColor }}
          >
            {event.title}
          </div>
        ))}
      </div>
    );
  };
});

// Mock SessionDrawer
jest.mock('@/components/SessionDrawer', () => ({
  SessionDrawer: ({ session, open }: any) => (
    open && session ? (
      <div data-testid="session-drawer">
        <h2>{session.title}</h2>
        <p>{session.status}</p>
      </div>
    ) : null
  )
}));

describe('Calendar Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const renderCalendar = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Calendar />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders FullCalendar with sessions', () => {
    renderCalendar();
    
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-2')).toBeInTheDocument();
    expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
    expect(screen.getByText('Lower Body Power')).toBeInTheDocument();
  });

  it('opens SessionDrawer when event is clicked', async () => {
    renderCalendar();
    
    const event = screen.getByTestId('event-1');
    fireEvent.click(event);
    
    await waitFor(() => {
      expect(screen.getByTestId('session-drawer')).toBeInTheDocument();
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
      expect(screen.getByText('planned')).toBeInTheDocument();
    });
  });

  it('applies correct colors based on session status', () => {
    renderCalendar();
    
    const scheduledEvent = screen.getByTestId('event-1');
    const inProgressEvent = screen.getByTestId('event-2');
    
    expect(scheduledEvent).toHaveStyle('background-color: #6B7280'); // gray
    expect(inProgressEvent).toHaveStyle('background-color: #3B82F6'); // blue
  });
});