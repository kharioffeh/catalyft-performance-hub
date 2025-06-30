
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { GlassLayout } from '@/components/Glass/GlassLayout';

interface ProfileErrorProps {
  variant: 'default' | 'dashboard' | 'analytics' | 'settings' | 'chat';
}

export const ProfileError: React.FC<ProfileErrorProps> = ({ variant }) => {
  return (
    <GlassLayout variant={variant}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Profile Not Found</h3>
            <p className="text-white/70 mb-4">
              We couldn't find your profile. Please try refreshing or contact support.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-500/90 hover:bg-indigo-500 text-white backdrop-blur-md"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </GlassLayout>
  );
};
