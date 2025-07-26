import type { Meta, StoryObj } from '@storybook/react';
import { AriaChatScreen } from '../../src/pages/mobile/AriaChatScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks and dependencies
const mockInsights = [
  {
    id: 'readiness-1',
    title: 'Readiness',
    message: 'High readiness detected',
    type: 'readiness' as const,
    severity: 'green' as const,
    value: 85,
    trend: 'up' as const
  },
  {
    id: 'sleep-1',
    title: 'Sleep Quality',
    message: 'Good sleep quality',
    type: 'sleep' as const,
    severity: 'green' as const,
    value: 82,
    trend: 'stable' as const
  }
];

// Mock the useInsights hook
jest.mock('../../src/hooks/useInsights', () => ({
  useInsights: () => mockInsights
}));

// Mock the ARIA streaming
jest.mock('../../src/lib/aria/streaming', () => ({
  ariaStream: async (messages: any[], threadId?: string, onToken?: (token: string) => void) => {
    // Simulate streaming response
    const response = "Based on your current metrics, I recommend focusing on maintaining your current training intensity while ensuring adequate recovery. Your readiness score of 85% indicates you're well-prepared for challenging workouts.";
    
    // Simulate token-by-token streaming
    const tokens = response.split(' ');
    for (let i = 0; i < tokens.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onToken?.(i === 0 ? tokens[i] : ' ' + tokens[i]);
    }
    
    return {
      thread_id: threadId || 'mock-thread-id',
      content: response
    };
  }
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

const meta: Meta<typeof AriaChatScreen> = {
  title: 'Mobile/AriaChatScreen',
  component: AriaChatScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ARIA Chat Screen for mobile coaching conversations with streaming responses and suggested prompts'
      }
    }
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="min-h-screen bg-brand-charcoal">
          <Story />
        </div>
      </BrowserRouter>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof AriaChatScreen>;

export const Default: Story = {
  name: 'ARIA Chat Interface',
  parameters: {
    docs: {
      description: {
        story: 'Default ARIA chat screen with welcome message and suggested prompts'
      }
    }
  }
};

export const WithConversation: Story = {
  name: 'Active Conversation',
  parameters: {
    docs: {
      description: {
        story: 'Chat screen showing an active conversation with ARIA'
      }
    }
  },
  decorators: [
    (Story) => {
      // Pre-populate with some conversation
      React.useEffect(() => {
        // This would simulate an ongoing conversation
        // In a real implementation, this would come from the chat state
      }, []);
      
      return <Story />;
    }
  ]
};

export const LoadingState: Story = {
  name: 'Streaming Response',
  parameters: {
    docs: {
      description: {
        story: 'Chat screen showing ARIA streaming a response'
      }
    }
  }
};