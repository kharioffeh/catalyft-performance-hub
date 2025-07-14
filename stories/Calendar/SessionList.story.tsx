import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SessionList from '@/features/calendar/SessionList';
import { AuthProvider } from '@/contexts/AuthContext';
import { GlassToastProvider } from '@/contexts/GlassToastContext';

// Mock the hooks and API
const mockSessions = [
  {
    id: '1',
    athlete_uuid: 'athlete-1',
    coach_uuid: 'coach-1',
    type: 'strength',
    start_ts: '2024-01-15T09:00:00Z',
    end_ts: '2024-01-15T10:30:00Z',
    athletes: { name: 'John Doe' },
  },
  {
    id: '2',
    athlete_uuid: 'athlete-2',
    coach_uuid: 'coach-1',
    type: 'conditioning',
    start_ts: '2024-01-15T14:00:00Z',
    end_ts: '2024-01-15T15:00:00Z',
    athletes: { name: 'Jane Smith' },
  },
  {
    id: '3',
    athlete_uuid: 'athlete-3',
    coach_uuid: 'coach-1',
    type: 'recovery',
    start_ts: '2024-01-15T16:00:00Z',
    end_ts: '2024-01-15T16:45:00Z',
    athletes: { name: 'Mike Johnson' },
  },
];

// Mock the useCalendar hook
jest.mock('@/hooks/useCalendar', () => ({
  useCalendar: () => ({
    sessions: mockSessions,
    isLoading: false,
    queryClient: new QueryClient(),
  }),
}));

// Mock the rescheduleSession API
jest.mock('@/lib/api/sessions', () => ({
  rescheduleSession: jest.fn().mockResolvedValue(undefined),
}));

const meta: Meta<typeof SessionList> = {
  title: 'Calendar/SessionList',
  component: SessionList,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GlassToastProvider>
              <div style={{ 
                height: '100vh', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
              }}>
                <Story />
              </div>
            </GlassToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SessionList>;

export const Default: Story = {};

export const Loading: Story = {
  beforeEach: () => {
    jest.mocked(require('@/hooks/useCalendar').useCalendar).mockReturnValue({
      sessions: [],
      isLoading: true,
      queryClient: new QueryClient(),
    });
  },
};

export const Empty: Story = {
  beforeEach: () => {
    jest.mocked(require('@/hooks/useCalendar').useCalendar).mockReturnValue({
      sessions: [],
      isLoading: false,
      queryClient: new QueryClient(),
    });
  },
};

export const SingleSession: Story = {
  beforeEach: () => {
    jest.mocked(require('@/hooks/useCalendar').useCalendar).mockReturnValue({
      sessions: [mockSessions[0]],
      isLoading: false,
      queryClient: new QueryClient(),
    });
  },
};