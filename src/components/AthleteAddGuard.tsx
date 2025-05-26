
import React from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown } from 'lucide-react';

interface AthleteAddGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const AthleteAddGuard: React.FC<AthleteAddGuardProps> = ({ 
  children, 
  fallbackMessage = "You've reached your plan's athlete limit. Please upgrade to add more athletes." 
}) => {
  const { canAddAthlete, loading, isSubscribed, athleteCount, athleteLimit } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Subscribe to a plan to add athletes.</span>
          <Button 
            size="sm" 
            onClick={() => window.location.href = '/subscriptions'}
          >
            View Plans
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!canAddAthlete) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>{fallbackMessage}</p>
            {athleteLimit && (
              <p className="text-sm text-gray-600 mt-1">
                Current: {athleteCount} / {athleteLimit} athletes
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => window.location.href = '/subscriptions'}
          >
            Upgrade Plan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default AthleteAddGuard;
