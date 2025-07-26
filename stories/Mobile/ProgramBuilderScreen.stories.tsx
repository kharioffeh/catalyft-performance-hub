import type { Meta, StoryObj } from '@storybook/react';
import { ProgramBuilderScreen } from '../../src/pages/mobile/ProgramBuilderScreen';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof ProgramBuilderScreen> = {
  title: 'Mobile/ProgramBuilder',
  component: ProgramBuilderScreen,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Wizard: Story = {
  args: {
    onBack: () => console.log('Back pressed'),
    onComplete: (programId: string) => console.log('Program generated:', programId),
  },
};