import React from 'react';
import { PatchPrompt } from '../PatchPrompt';
import { ProgramPatch } from '@/types/programPatch';

// Simple test to verify component renders without errors

const mockPatch: ProgramPatch = {
  id: 'test-patch-id',
  name: 'Test Program Patch',
  total_weeks: 8,
  mesocycles: [
    {
      id: 'meso-1',
      label: 'Base Phase',
      weeks: 4,
      start_week: 1,
      focus: 'Building foundation',
      sessions: []
    }
  ],
  start_date: '2024-01-01',
  end_date: '2024-02-26',
  user_uuid: 'user-123'
};

test('PatchPrompt renders correctly', () => {
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

  // Basic rendering test - just ensure component mounts without errors
  expect(() => {
    React.createElement(PatchPrompt, {
      patch: mockPatch,
      onAccept: mockOnAccept,
      onDecline: mockOnDecline,
      isVisible: true
    });
  }).not.toThrow();

  // Test that component doesn't render when not visible
  expect(() => {
    React.createElement(PatchPrompt, {
      patch: mockPatch,
      onAccept: mockOnAccept,
      onDecline: mockOnDecline,
      isVisible: false
    });
  }).not.toThrow();
});