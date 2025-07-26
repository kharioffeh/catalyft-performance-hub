
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Crown, Calendar, Star } from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
  const { toast } = useToast();
  const { isSubscribed, loading, refresh } = useSubscriptionStatus();

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
            Subscribe to Solo Pro to access all premium features and optimize your training.
          </p>
          <Button onClick={() => window.location.href = '/billing'}>
            Subscribe to Solo Pro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" />
            Solo Pro Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Solo Pro</h3>
              <p className="text-gray-600">Personal training optimization platform</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">$14.99</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">All Features</p>
              <p className="text-sm text-gray-600">unlocked</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Included Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Advanced AI training insights</li>
              <li>• Personalized program optimization</li>
              <li>• Comprehensive analytics</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <Button onClick={handleManageSubscription} className="w-full">
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
