
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Users } from 'lucide-react';

interface UpgradeSeatCTAProps {
  current: number;
  showAddPacks?: boolean;
  className?: string;
}

export const UpgradeSeatCTA: React.FC<UpgradeSeatCTAProps> = ({ 
  current, 
  showAddPacks = false,
  className 
}) => {
  return (
    <Alert className={className}>
      <Users className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p>You've reached your athlete limit ({current} athletes).</p>
          <p className="text-sm text-gray-600 mt-1">
            {showAddPacks ? 'Add athlete packs or upgrade your plan to continue.' : 'Upgrade your plan to add more athletes.'}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          {showAddPacks && (
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
