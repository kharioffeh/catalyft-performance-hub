import React from 'react';
import { MeetsScreen } from './MeetsScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock story component for demonstration
export const MeetsScreenStory: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-brand p-4">
        <MeetsScreen />
      </div>
    </BrowserRouter>
  );
};

// Example of how this would be used in Storybook with mock data
export const MeetsScreenWithMockData: React.FC = () => {
  // This would contain the mock data setup for Storybook
  return <MeetsScreenStory />;
};

export default MeetsScreenStory;