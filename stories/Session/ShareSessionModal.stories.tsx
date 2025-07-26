import type { Meta, StoryObj } from '@storybook/react';
import { ShareSessionModal } from '@/features/session/ShareSessionModal';
import { Session } from '@/types/training';

const meta: Meta<typeof ShareSessionModal> = {
  title: 'Session/ShareSessionModal',
  component: ShareSessionModal,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  argTypes: {
    visible: { control: 'boolean' },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockSession: Session = {
  id: 'session-123',
  user_uuid: 'user-123',
  start_ts: '2024-01-15T10:00:00Z',
  end_ts: '2024-01-15T11:30:00Z',
  type: 'strength',
  status: 'completed',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T11:30:00Z',
  exercises: [
    {
      exercise_id: 'squat',
      sets: 5,
      reps: 5,
      load_kg: 140,
      completed: true,
    },
    {
      exercise_id: 'bench-press',
      sets: 4,
      reps: 8,
      load_kg: 100,
      completed: true,
    },
    {
      exercise_id: 'deadlift',
      sets: 3,
      reps: 3,
      load_kg: 160,
      completed: true,
    },
  ],
};

const mockSessionWithPRs: Session = {
  ...mockSession,
  exercises: [
    {
      exercise_id: 'squat',
      sets: 5,
      reps: 5,
      load_kg: 150, // PR weight
      completed: true,
    },
    {
      exercise_id: 'bench-press',
      sets: 4,
      reps: 8,
      load_kg: 105, // PR weight
      completed: true,
    },
    {
      exercise_id: 'deadlift',
      sets: 3,
      reps: 3,
      load_kg: 160,
      completed: true,
    },
  ],
};

export const Default: Story = {
  args: {
    session: mockSession,
    visible: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const WithEmptyCaption: Story = {
  args: {
    session: mockSession,
    visible: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with no caption entered yet, showing the placeholder text.',
      },
    },
  },
};

export const WithPersonalRecords: Story = {
  args: {
    session: mockSessionWithPRs,
    visible: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal showing session with personal records achieved, displaying PR badges.',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    session: mockSession,
    visible: false,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state (not visible).',
      },
    },
  },
};