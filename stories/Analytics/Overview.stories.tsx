import type { Meta, StoryObj } from '@storybook/react';
import { TonnageCard, E1RMCard, VelocityFatigueCard, MuscleLoadCard } from '@/components/Analytics/ChartCards';

const meta: Meta = {
  title: 'Analytics/Overview Charts',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const mockTonnageData = [
  { date: '2024-01-15', tonnage: 1140 },
  { date: '2024-01-16', tonnage: 950 },
  { date: '2024-01-17', tonnage: 1230 },
  { date: '2024-01-18', tonnage: 890 },
  { date: '2024-01-19', tonnage: 1050 },
];

const mockE1RMData = [
  { exercise: 'Squat', date: '2024-01-15', e1rm: 150.5 },
  { exercise: 'Bench Press', date: '2024-01-15', e1rm: 120.0 },
  { exercise: 'Deadlift', date: '2024-01-15', e1rm: 180.0 },
  { exercise: 'Squat', date: '2024-01-16', e1rm: 155.0 },
  { exercise: 'Bench Press', date: '2024-01-16', e1rm: 122.5 },
  { exercise: 'Deadlift', date: '2024-01-16', e1rm: 185.0 },
];

const mockVelocityData = [
  { date: '2024-01-15', avg_velocity: 0.85, max_load: 100 },
  { date: '2024-01-16', avg_velocity: 0.75, max_load: 110 },
  { date: '2024-01-17', avg_velocity: 0.9, max_load: 95 },
  { date: '2024-01-18', avg_velocity: 0.65, max_load: 115 },
  { date: '2024-01-19', avg_velocity: 0.8, max_load: 105 },
];

const mockMuscleLoadData = [
  { user_id: 'user1', date: '2024-01-15', muscle: 'quadriceps', load_score: 75.5 },
  { user_id: 'user1', date: '2024-01-15', muscle: 'chest', load_score: 65.0 },
  { user_id: 'user1', date: '2024-01-16', muscle: 'quadriceps', load_score: 80.0 },
  { user_id: 'user1', date: '2024-01-16', muscle: 'hamstrings', load_score: 70.0 },
  { user_id: 'user1', date: '2024-01-17', muscle: 'chest', load_score: 85.0 },
];

export const AllChartCards: StoryObj = {
  render: () => (
    <div className="bg-brand-charcoal min-h-screen p-8">
      <div className="flex overflow-x-auto space-x-6 pb-4">
        <TonnageCard data={mockTonnageData} />
        <E1RMCard data={mockE1RMData} />
        <VelocityFatigueCard data={mockVelocityData} />
        <MuscleLoadCard data={mockMuscleLoadData} />
      </div>
    </div>
  ),
};

export const TonnageOnly: StoryObj = {
  render: () => (
    <div className="bg-brand-charcoal p-8">
      <TonnageCard data={mockTonnageData} />
    </div>
  ),
};

export const E1RMOnly: StoryObj = {
  render: () => (
    <div className="bg-brand-charcoal p-8">
      <E1RMCard data={mockE1RMData} />
    </div>
  ),
};

export const VelocityFatigueOnly: StoryObj = {
  render: () => (
    <div className="bg-brand-charcoal p-8">
      <VelocityFatigueCard data={mockVelocityData} />
    </div>
  ),
};

export const MuscleLoadOnly: StoryObj = {
  render: () => (
    <div className="p-6 bg-slate-900">
      <MuscleLoadCard data={mockMuscleLoadData} />
    </div>
  )
};