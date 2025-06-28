
import React from 'react';
import { useFeature } from '@/hooks/useFeature';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown, Users } from 'lucide-react';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';

interface AthleteAddGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const AthleteAddGuard: React.FC<AthleteAddGuardProps> = ({ 
  children, 
  fallbackMessage 
}) => {
  const { hasFeature, isLoading } = useFeature('can_add_athlete');
  const { 
    billing, 
    currentPlan, 
    maxAthletes, 
    currentAthletes, 
    needsUpgrade,
    inTrial 
  } = useBillingEnhanced();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // If subscription needs upgrade (trial expired, payment failed)
  if (needsUpgrade) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>Your subscription requires attention to add athletes.</p>
            <p className="text-sm text-gray-600 mt-1">
              {inTrial ? 'Trial expired' : 'Payment issue detected'}
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

  // If user can add athletes, show the children
  if (hasFeature) {
    return <>{children}</>;
  }

  // User has reached their athlete limit
  const defaultMessage = fallbackMessage || 
    `You've reached your plan's athlete limit (${currentAthletes}/${maxAthletes}). Upgrade or add athlete packs to continue.`;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p>{defaultMessage}</p>
          {currentPlan && (
            <p className="text-sm text-gray-600 mt-1">
              Current: {currentAthletes} / {maxAthletes === 0 ? '∞' : maxAthletes} athletes on {currentPlan.label}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          {currentPlan?.id === 'coach_pro' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.href = '/billing-enhanced'}
            >
              <Users className="w-4 h-4 mr-2" />
              Add Athletes
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={() => window.location.href = '/billing-enhanced'}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AthleteAddGuard;
