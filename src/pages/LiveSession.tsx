
import React from 'react';
import { LiveWorkoutSession } from '@/components/training/LiveWorkoutSession';
import { LiveBanner } from '@/features/session/LiveBanner';

const LiveSession: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <LiveBanner />
      <div className="flex-1 pt-14">
        <LiveWorkoutSession />
      </div>
    </div>
  );
};

export default LiveSession;
