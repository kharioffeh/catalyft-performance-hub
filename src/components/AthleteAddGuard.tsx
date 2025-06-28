
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { UpgradeSeatCTA } from './UpgradeSeatCTA';

interface AthleteAddGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const AthleteAddGuard: React.FC<AthleteAddGuardProps> = ({ 
  children, 
  fallbackMessage 
}) => {
  const { org, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>Unable to verify your subscription status.</p>
            <p className="text-sm text-gray-600 mt-1">Please refresh the page or contact support.</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // If subscription needs upgrade (trial expired, payment failed)
  if (org.needs_upgrade) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>Your subscription requires attention to add athletes.</p>
            <p className="text-sm text-gray-600 mt-1">
              {org.in_trial ? 'Trial expired' : 'Payment issue detected'}
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => window.location.href = '/billing-enhanced'}
          >
            Resolve Issue
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Check athlete limit using the simple session pattern
  if (org.athlete_count >= org.max_athletes) {
    return (
      <UpgradeSeatCTA 
        current={org.max_athletes} 
        showAddPacks={org.can_purchase_athletes}
      />
    );
  }

  // User can add athletes, show the children
  return <>{children}</>;
};

export default AthleteAddGuard;
