
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Zap, Lock } from 'lucide-react';

interface AdaptiveAdjustmentFeatureGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  showUpgradeButton?: boolean;
}

export const AdaptiveAdjustmentFeatureGuard: React.FC<AdaptiveAdjustmentFeatureGuardProps> = ({ 
  children, 
  fallbackMessage,
  showUpgradeButton = true 
}) => {
  const { org, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Check if the current plan supports adaptive adjustments
  const hasAdaptiveAdjustments = org?.plan?.has_adaptive_replan || false;

  if (!hasAdaptiveAdjustments) {
    const defaultMessage = fallbackMessage || `Upgrade your ${org?.plan?.label || 'plan'} to enable automatic program adjustments.`;

    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>{defaultMessage}</p>
            <p className="text-sm text-gray-600 mt-1">
              ARIA will automatically adjust your training based on readiness and strain
            </p>
          </div>
          {showUpgradeButton && (
            <Button 
              size="sm" 
              onClick={() => window.location.href = '/billing-enhanced'}
              className="ml-4"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
