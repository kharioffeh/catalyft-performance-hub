
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Crown } from 'lucide-react';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';
import { useFeature } from '@/hooks/useFeature';

export const AthleteManagementCard: React.FC = () => {
  const { 
    billing, 
    currentPlan, 
    maxAthletes, 
    currentAthletes, 
    purchaseAthletes,
    isPurchasing,
    getPlanPrice 
  } = useBillingEnhanced();

  const { hasFeature: canAddAthlete } = useFeature('can_add_athlete');
  const { hasFeature: canPurchaseAthletes } = useFeature('can_purchase_athletes');

  if (!billing || !currentPlan) return null;

  const usagePercentage = maxAthletes > 0 ? (currentAthletes / maxAthletes) * 100 : 0;
  const isCoachPlan = currentPlan.type === 'coach';
  const isNearLimit = usagePercentage >= 80;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5" />
          Athlete Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm">Athletes Used</span>
            <span className="text-white font-medium">
              {currentAthletes} / {maxAthletes === 0 ? '∞' : maxAthletes}
            </span>
          </div>
          {maxAthletes > 0 && (
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
          )}
        </div>

        {/* Plan Type Info */}
        <div className="flex items-center gap-2">
          <Badge variant={isCoachPlan ? 'default' : 'secondary'}>
            {currentPlan.label}
          </Badge>
          {currentPlan.type === 'solo' && (
            <Badge variant="outline" className="text-white/60 border-white/20">
              Unlimited Athletes
            </Badge>
          )}
        </div>

        {/* Coach Plan - Athlete Limit Warning */}
        {isCoachPlan && isNearLimit && canAddAthlete && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Crown className="w-4 h-4" />
              <span>Approaching athlete limit</span>
            </div>
            <p className="text-amber-300/80 text-xs mt-1">
              Consider adding more athletes to your subscription.
            </p>
          </div>
        )}

        {/* Coach Plan - At Limit */}
        {isCoachPlan && !canAddAthlete && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Users className="w-4 h-4" />
              <span>Athlete limit reached</span>
            </div>
            <p className="text-red-300/80 text-xs mt-1">
              Add more athletes to continue growing your team.
            </p>
          </div>
        )}

        {/* Add Athletes Button - Coach Pro Only */}
        {canPurchaseAthletes && (
          <div className="space-y-2">
            <Button
              onClick={() => purchaseAthletes(1)}
              disabled={isPurchasing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isPurchasing ? 'Adding...' : 'Add 10 Athletes'}
            </Button>
            <p className="text-white/60 text-xs text-center">
              {getPlanPrice('athlete_topup')}/month per 10-athlete pack
            </p>
          </div>
        )}

        {/* Upgrade Suggestion for Coach Basic */}
        {currentPlan.id === 'coach_basic' && !canAddAthlete && (
          <div className="space-y-2">
            <p className="text-white/60 text-sm">
              Upgrade to Coach Pro for expandable athlete limits
            </p>
            <Button
              onClick={() => window.location.href = '/billing-enhanced'}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Upgrade to Coach Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
