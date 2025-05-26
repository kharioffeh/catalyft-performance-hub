
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Users, Crown, Calendar, TrendingUp } from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
  const { toast } = useToast();
  const { isSubscribed, plan, athleteCount, athleteLimit, canAddAthlete, loading, refresh } = useSubscriptionStatus();

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSubscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Subscribe to a plan to start managing athletes and accessing premium features.
          </p>
          <Button onClick={() => window.location.href = '/subscriptions'}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = athleteLimit ? (athleteCount / athleteLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{plan?.name}</h3>
              <p className="text-gray-600">{plan?.description}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{athleteCount}</p>
              <p className="text-sm text-gray-600">
                {athleteLimit ? `of ${athleteLimit} athletes` : 'athletes'}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">£{plan?.price_monthly}</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">
                {athleteLimit === null ? '∞' : athleteLimit}
              </p>
              <p className="text-sm text-gray-600">athlete limit</p>
            </div>
          </div>

          {athleteLimit && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Athlete Usage</span>
                <span className="text-sm text-gray-600">
                  {athleteCount} / {athleteLimit}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              {usagePercentage >= 90 && (
                <p className="text-sm text-amber-600">
                  You're approaching your athlete limit. Consider upgrading your plan.
                </p>
              )}
            </div>
          )}

          <Button onClick={handleManageSubscription} className="w-full">
            Manage Subscription
          </Button>
        </CardContent>
      </Card>

      {!canAddAthlete && athleteLimit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Athlete Limit Reached</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              You've reached your current plan's athlete limit. Upgrade your subscription to add more athletes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManagement;
