import type { Meta, StoryObj } from '@storybook/react';
import { InsightStack } from '@/features/dashboard/InsightStack';
import { useInsights } from '@/hooks/useInsights';

// Mock the hooks and APIs
jest.mock('@/hooks/useInsights');
jest.mock('@catalyft/core');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUseInsights = useInsights as jest.MockedFunction<typeof useInsights>;

const mockInsights = [
  {
    id: 'readiness-1',
    title: 'Readiness',
    message: 'High readiness detected. Green light for intense training today.',
    type: 'readiness' as const,
    severity: 'green' as const,
    route: '/analytics/readiness',
    value: 85,
    trend: 'up' as const,
  },
  {
    id: 'sleep-1',
    title: 'Sleep Quality',
    message: 'Moderate sleep quality (75%). Room for improvement tonight.',
    type: 'sleep' as const,
    severity: 'amber' as const,
    route: '/sleep',
    value: 75,
    trend: 'stable' as const,
  },
  {
    id: 'load-1',
    title: 'Training Load',
    message: 'High training load (1.6). Elevated injury risk detected.',
    type: 'load' as const,
    severity: 'red' as const,
    route: '/analytics/load',
    value: 1.6,
    trend: 'up' as const,
  },
  {
    id: 'stress-1',
    title: 'Stress Level',
    message: 'Low stress levels (25). Optimal state for training.',
    type: 'stress' as const,
    severity: 'green' as const,
    route: '/analytics/stress',
    value: 25,
    trend: 'down' as const,
  },
  {
    id: 'performance-1',
    title: 'Performance State',
    message: 'Peak performance window detected. Perfect time for challenging workouts.',
    type: 'general' as const,
    severity: 'green' as const,
    route: '/analytics',
    value: 92,
    trend: 'up' as const,
  },
];

const meta: Meta<typeof InsightStack> = {
  title: 'Dashboard/InsightStack',
  component: InsightStack,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A Tinder-style swipeable stack of insight cards. Swipe left to dismiss, swipe right to save.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Multiple Insights',
  parameters: {
    docs: {
      description: {
        story: 'Stack with multiple insights of different types and severities.',
      },
    },
  },
  beforeEach: () => {
    mockUseInsights.mockReturnValue(mockInsights);
  },
};

export const SingleInsight: Story = {
  name: 'Single Insight',
  parameters: {
    docs: {
      description: {
        story: 'Stack with only one insight card.',
      },
    },
  },
  beforeEach: () => {
    mockUseInsights.mockReturnValue([mockInsights[0]]);
  },
};

export const EmptyState: Story = {
  name: 'No Insights',
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no insights are available.',
      },
    },
  },
  beforeEach: () => {
    mockUseInsights.mockReturnValue([]);
  },
};

export const RedAlert: Story = {
  name: 'Red Alert Insight',
  parameters: {
    docs: {
      description: {
        story: 'High severity (red) insight requiring immediate attention.',
      },
    },
  },
  beforeEach: () => {
    mockUseInsights.mockReturnValue([
      {
        id: 'critical-1',
        title: 'Critical Alert',
        message: 'Extremely high training load detected. Immediate rest recommended to prevent injury.',
        type: 'load',
        severity: 'red',
        route: '/analytics/load',
        value: 2.1,
        trend: 'up',
      },
    ]);
  },
};

export const AmberWarning: Story = {
  name: 'Amber Warning Insight',
  parameters: {
    docs: {
      description: {
        story: 'Medium severity (amber) insight suggesting caution.',
      },
    },
  },
  beforeEach: () => {
    mockUseInsights.mockReturnValue([
      {
        id: 'warning-1',
        title: 'Recovery Warning',
        message: 'Moderate readiness levels. Consider light training or active recovery.',
        type: 'readiness',
        severity: 'amber',
        route: '/analytics/readiness',
        value: 65,
        trend: 'down',
      },
    ]);
  },
};

export const PositiveInsight: Story = {
  name: 'Positive Insight',
  parameters: {
    docs: {
      description: {
        story: 'Good news (green) insight indicating optimal performance state.',
      },
    },
  },
  beforeEach: () => {
    mockUseInsights.mockReturnValue([
      {
        id: 'positive-1',
        title: 'Optimal State',
        message: 'All systems go! Perfect time for your most challenging workout.',
        type: 'general',
        severity: 'green',
        route: '/analytics',
        value: 95,
        trend: 'up',
      },
    ]);
  },
};