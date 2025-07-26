import type { Meta, StoryObj } from '@storybook/react';
import { ReadinessCard } from '@/features/dashboard/ReadinessCard';
import { rest } from 'msw';

const meta: Meta<typeof ReadinessCard> = {
  title: 'Dashboard/ReadinessCard',
  component: ReadinessCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composite readiness card showing overall score and component breakdowns'
      }
    }
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] bg-gradient-to-br from-brand-charcoal to-brand-charcoal-light p-4">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock readiness data
const mockReadinessData = {
  readiness_score: 78,
  hrv_rmssd: 45,
  sleep_min: 450, // 7.5 hours
  soreness_score: 3,
  jump_cm: 42
};

export const WithReadiness: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.post('*/functions/v1/getReadiness', (req, res, ctx) => {
          return res(ctx.json(mockReadinessData));
        }),
      ],
    },
  },
};

export const HighReadiness: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.post('*/functions/v1/getReadiness', (req, res, ctx) => {
          return res(ctx.json({
            readiness_score: 92,
            hrv_rmssd: 65,
            sleep_min: 480, // 8 hours
            soreness_score: 2,
            jump_cm: 48
          }));
        }),
      ],
    },
  },
};

export const LowReadiness: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.post('*/functions/v1/getReadiness', (req, res, ctx) => {
          return res(ctx.json({
            readiness_score: 34,
            hrv_rmssd: 25,
            sleep_min: 360, // 6 hours
            soreness_score: 7,
            jump_cm: 28
          }));
        }),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.post('*/functions/v1/getReadiness', (req, res, ctx) => {
          return res(ctx.delay('infinite'));
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.post('*/functions/v1/getReadiness', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        }),
      ],
    },
  },
};