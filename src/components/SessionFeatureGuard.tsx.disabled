
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface SessionFeatureGuardProps {
  feature: keyof NonNullable<ReturnType<typeof useSession>['org']['plan']>;
  children: React.ReactNode;
  fallbackMessage?: string;
  showUpgradeButton?: boolean;
}

export const SessionFeatureGuard: React.FC<SessionFeatureGuardProps> = ({ 
  feature, 
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

  if (!org?.plan?.[feature]) {
    const defaultMessage = fallbackMessage || `Upgrade your ${org?.plan?.label || 'plan'} to access this feature.`;

    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p>{defaultMessage}</p>
            <p className="text-sm text-gray-600 mt-1">
              Available on Pro plans
            </p>
          </div>
          {showUpgradeButton && (
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
