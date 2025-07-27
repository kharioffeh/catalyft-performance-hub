import React from 'react';

// Mock types for Storybook (simplified version)
type Meta<T> = {
  title: string;
  component: T;
  parameters?: any;
  decorators?: Array<(Story: any) => React.JSX.Element>;
};

type StoryObj<T> = {
  name?: string;
  decorators?: Array<(Story: any) => React.JSX.Element>;
};
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClubsScreen from './ClubsScreen';

// Create a mock query client with pre-populated data
const createMockQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  // Mock data for all clubs
  const mockAllClubs = [
    {
      id: '1',
      name: 'Morning Runners',
      description: 'Early morning running group for all fitness levels. We meet at 6 AM every weekday.',
      memberCount: 42,
      created_by: 'coach1',
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Strength Warriors',
      description: 'Powerlifting and strength training community focused on progressive overload.',
      memberCount: 28,
      created_by: 'coach2',
      created_at: '2024-01-20T00:00:00Z',
    },
    {
      id: '3',
      name: 'Yoga Flow',
      description: 'Relaxing yoga sessions for flexibility and mindfulness.',
      memberCount: 15,
      created_by: 'coach3',
      created_at: '2024-02-01T00:00:00Z',
    },
  ];

  // Mock data for my clubs (subset of all clubs)
  const mockMyClubs = [
    {
      ...mockAllClubs[0],
      joined_at: '2024-01-16T00:00:00Z',
    },
    {
      ...mockAllClubs[2],
      joined_at: '2024-02-02T00:00:00Z',
    },
  ];

  // Pre-populate cache
  queryClient.setQueryData(['clubs', 'all'], { clubs: mockAllClubs });
  queryClient.setQueryData(['clubs', 'my'], { clubs: mockMyClubs });

  return queryClient;
};

const meta: Meta<typeof ClubsScreen> = {
  title: 'Mobile/ClubsScreen',
  component: ClubsScreen,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (Story) => {
      const queryClient = createMockQueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <div style={{ height: '100vh', overflow: 'auto' }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default View',
};

export const EmptyAllClubs: Story = {
  name: 'Empty All Clubs',
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      });
      
      // Empty clubs data
      queryClient.setQueryData(['clubs', 'all'], { clubs: [] });
      queryClient.setQueryData(['clubs', 'my'], { clubs: [] });
      
      return (
        <QueryClientProvider client={queryClient}>
          <div style={{ height: '100vh', overflow: 'auto' }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export const LoadingState: Story = {
  name: 'Loading State',
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            enabled: false, // Disable queries to show loading state
          },
        },
      });
      
      return (
        <QueryClientProvider client={queryClient}>
          <div style={{ height: '100vh', overflow: 'auto' }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export const ManyClubs: Story = {
  name: 'Many Clubs',
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      });
      
      // Generate many clubs
      const manyClubs = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Club ${i + 1}`,
        description: `This is the description for club ${i + 1}. It has various activities and programs for members.`,
        memberCount: Math.floor(Math.random() * 100) + 10,
        created_by: `coach${i + 1}`,
        created_at: '2024-01-15T00:00:00Z',
      }));
      
      queryClient.setQueryData(['clubs', 'all'], { clubs: manyClubs });
      queryClient.setQueryData(['clubs', 'my'], { clubs: manyClubs.slice(0, 3).map(club => ({ ...club, joined_at: '2024-01-16T00:00:00Z' })) });
      
      return (
        <QueryClientProvider client={queryClient}>
          <div style={{ height: '100vh', overflow: 'auto' }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};