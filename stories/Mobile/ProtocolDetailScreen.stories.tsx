import type { Meta, StoryObj } from '@storybook/react';
import { ProtocolDetailScreen } from '../../src/pages/mobile/ProtocolDetailScreen';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockProtocols = [
  {
    id: 'protocol-1',
    name: 'Post-Workout Recovery Flow',
    description: 'A gentle mobility routine designed to help your body recover after intense training sessions. Focus on breathing deeply and moving slowly through each position.',
    duration_min: 8,
    muscle_targets: ['hips', 'shoulders', 'spine']
  },
  {
    id: 'protocol-2', 
    name: 'Morning Activation',
    description: 'Wake up your body with this energizing sequence.',
    duration_min: 5,
    muscle_targets: ['full_body']
  }
];

const createMockQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  
  // Pre-populate cache with mock data
  queryClient.setQueryData(['protocols', {}], mockProtocols);
  
  return queryClient;
};

const meta: Meta<typeof ProtocolDetailScreen> = {
  title: 'Mobile/ProtocolDetailScreen',
  component: ProtocolDetailScreen,
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
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithProtocol: Story = {
  decorators: [
    (Story) => {
      const queryClient = createMockQueryClient();
      
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/mobile/protocol-detail?protocolId=protocol-1&sessionId=session-123']}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};

export const WithoutSession: Story = {
  decorators: [
    (Story) => {
      const queryClient = createMockQueryClient();
      
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/mobile/protocol-detail?protocolId=protocol-1']}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};

export const ProtocolNotFound: Story = {
  decorators: [
    (Story) => {
      const queryClient = createMockQueryClient();
      
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/mobile/protocol-detail?protocolId=invalid-id']}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};

export const QuickActivation: Story = {
  decorators: [
    (Story) => {
      const queryClient = createMockQueryClient();
      
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/mobile/protocol-detail?protocolId=protocol-2']}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};