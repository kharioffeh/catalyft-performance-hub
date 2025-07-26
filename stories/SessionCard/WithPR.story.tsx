import type { Meta, StoryObj } from '@storybook/react';
import { SessionCard } from '@/features/dashboard/SessionCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof SessionCard> = {
  title: 'Dashboard/SessionCard',
  component: SessionCard,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="bg-brand-charcoal p-8 min-h-screen">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SessionCard>;

const mockSession = {
  id: '1',
  athlete_uuid: 'athlete-1',
  coach_uuid: 'coach-1',
  type: 'strength',
  start_ts: '2024-01-20T10:00:00Z',
  end_ts: '2024-01-20T11:30:00Z',
  status: 'completed' as const,
  notes: 'Great session with new personal record!',
  exercises: [
    {
      name: 'Bench Press',
      sets: 3,
      reps: 5,
      load: 100,
    },
  ],
};

// Mock the usePRs hook for Storybook
jest.mock('@/hooks/usePRs', () => ({
  usePRs: (exercise: string) => {
    if (exercise === 'Bench Press') {
      return {
        data: {
          '1rm': {
            id: 'pr-1',
            athlete_uuid: 'athlete-1',
            exercise: 'Bench Press',
            pr_type: '1rm',
            value: 120,
            unit: 'kg',
            achieved_at: '2024-01-20',
            created_at: '2024-01-20T10:00:00Z',
            updated_at: '2024-01-20T10:00:00Z',
          },
        },
        isLoading: false,
        error: null,
      };
    }
    return {
      data: null,
      isLoading: false,
      error: null,
    };
  },
}));

export const WithNew1RM: Story = {
  args: {
    session: mockSession,
  },
};

export const WithNew3RM: Story = {
  args: {
    session: {
      ...mockSession,
      id: '2',
    },
  },
  decorators: [
    (Story) => {
      // Mock different PR type for this story
      const originalUsePRs = require('@/hooks/usePRs').usePRs;
      jest.doMock('@/hooks/usePRs', () => ({
        usePRs: () => ({
          data: {
            '3rm': {
              id: 'pr-2',
              athlete_uuid: 'athlete-1',
              exercise: 'Bench Press',
              pr_type: '3rm',
              value: 110,
              unit: 'kg',
              achieved_at: '2024-01-20',
              created_at: '2024-01-20T10:00:00Z',
              updated_at: '2024-01-20T10:00:00Z',
            },
          },
          isLoading: false,
          error: null,
        }),
      }));
      return <Story />;
    },
  ],
};

export const WithNewVelocity: Story = {
  args: {
    session: {
      ...mockSession,
      id: '3',
      exercises: [
        {
          name: 'Jump Squat',
          sets: 3,
          reps: 5,
          load: 60,
        },
      ],
    },
  },
  decorators: [
    (Story) => {
      jest.doMock('@/hooks/usePRs', () => ({
        usePRs: () => ({
          data: {
            'velocity': {
              id: 'pr-3',
              athlete_uuid: 'athlete-1',
              exercise: 'Jump Squat',
              pr_type: 'velocity',
              value: 2.1,
              unit: 'm/s',
              achieved_at: '2024-01-20',
              created_at: '2024-01-20T10:00:00Z',
              updated_at: '2024-01-20T10:00:00Z',
            },
          },
          isLoading: false,
          error: null,
        }),
      }));
      return <Story />;
    },
  ],
};

export const WithoutPR: Story = {
  args: {
    session: {
      ...mockSession,
      id: '4',
      notes: 'Good session, steady progress',
    },
  },
  decorators: [
    (Story) => {
      jest.doMock('@/hooks/usePRs', () => ({
        usePRs: () => ({
          data: null,
          isLoading: false,
          error: null,
        }),
      }));
      return <Story />;
    },
  ],
};