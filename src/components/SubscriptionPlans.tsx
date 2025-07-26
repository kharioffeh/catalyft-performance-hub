
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBilling } from '@/hooks/useBilling';

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSubscribed, monthlyPrice, yearlyPrice } = useBilling();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to Solo Pro.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPlan(plan);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

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

  const features = [
    'Advanced AI training insights',
    'Personalized program optimization', 
    'Comprehensive analytics',
    'Mobile app access',
    'Performance tracking',
    'Recovery monitoring',
    'Priority support'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Solo Pro</h2>
        <p className="mt-4 text-lg text-gray-600">Personal training optimization platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <Card className={`relative ${isSubscribed ? 'ring-2 ring-blue-500' : ''}`}>
          {isSubscribed && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Active
            </Badge>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Monthly
            </CardTitle>
            <CardDescription>Perfect for trying out Solo Pro</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{monthlyPrice}</span>
              <span className="text-gray-600">/month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {isSubscribed ? (
              <Button 
                onClick={handleManageSubscription} 
                variant="outline" 
                className="w-full"
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={processingPlan === 'monthly'}
                className="w-full"
              >
                {processingPlan === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative border-2 border-amber-200 bg-amber-50">
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-500">
            Best Value
          </Badge>
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Yearly
            </CardTitle>
            <CardDescription>Save 20% with annual billing</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{yearlyPrice}</span>
              <span className="text-gray-600">/year</span>
              <div className="text-sm text-amber-600 font-medium">
                Save $35.88 per year!
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {isSubscribed ? (
              <Button 
                onClick={handleManageSubscription} 
                variant="outline" 
                className="w-full"
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                onClick={() => handleSubscribe('yearly')}
                disabled={processingPlan === 'yearly'}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {processingPlan === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {isSubscribed && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <h3 className="font-semibold text-blue-900">Active Solo Pro Subscription</h3>
          <p className="text-blue-700">
            You have access to all Solo Pro features. Manage your subscription above.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
