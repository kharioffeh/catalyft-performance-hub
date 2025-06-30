
import React from 'react';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { SkeletonBox } from '@/components/skeleton/SkeletonBox';

interface LoadingStateProps {
  variant: 'default' | 'dashboard' | 'analytics' | 'settings' | 'chat';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ variant }) => {
  return (
    <GlassLayout variant={variant}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <SkeletonBox width={200} height={48} className="mx-auto" />
          <SkeletonBox width={160} height={16} className="mx-auto" />
        </div>
      </div>
    </GlassLayout>
  );
};
