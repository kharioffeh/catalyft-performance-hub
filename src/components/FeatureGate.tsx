
import React from 'react';
import { useFeature } from '@/hooks/useFeature';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: Parameters<typeof useFeature>[0];
  children: React.ReactNode;
  fallbackMessage?: string;
  showUpgradeButton?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallbackMessage,
  showUpgradeButton = true 
}) => {
  const { hasFeature, isLoading, planName, upgradeRequired } = useFeature(feature);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!hasFeature) {
    const defaultMessage = upgradeRequired 
      ? `Upgrade your ${planName} plan to access this feature.`
      : fallbackMessage || 'This feature is not available on your current plan.';

    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>{defaultMessage}</p>
            {upgradeRequired && (
              <p className="text-sm text-gray-600 mt-1">
                Available on Pro plans
              </p>
            )}
          </div>
          {showUpgradeButton && upgradeRequired && (
            <Button 
              size="sm" 
              onClick={() => window.location.href = '/billing-enhanced'}
              className="ml-4"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
