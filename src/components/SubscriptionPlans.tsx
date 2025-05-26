
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  stripe_price_id: string;
  price_monthly: number;
  athlete_limit: number | null;
  description: string;
}

interface UserSubscription {
  plan_id: string;
  status: string;
  plan?: Plan;
}

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans.",
        variant: "destructive",
      });
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPlan(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
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

  const getPlanFeatures = (plan: Plan) => {
    const features = ['AI-powered training plans', 'Performance analytics', 'Mobile app access'];
    
    if (plan.athlete_limit === null) {
      features.push('Unlimited athletes', 'Priority support', 'Advanced reporting');
    } else if (plan.athlete_limit > 1) {
      features.push(`Up to ${plan.athlete_limit} athletes`, 'Team management', 'Coach tools');
    } else {
      features.push('Personal training', 'Individual metrics');
    }
    
    return features;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="mt-4 text-lg text-gray-600">Select the perfect plan for your training needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = userSubscription?.plan_id === plan.id;
          const features = getPlanFeatures(plan);

          return (
            <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
              {isCurrentPlan && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£{plan.price_monthly}</span>
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

                {isCurrentPlan ? (
                  <Button 
                    onClick={handleManageSubscription} 
                    variant="outline" 
                    className="w-full"
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.stripe_price_id, plan.id)}
                    disabled={processingPlan === plan.id}
                    className="w-full"
                  >
                    {processingPlan === plan.id ? 'Processing...' : 'Subscribe'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userSubscription && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Your Current Subscription</h3>
          <p className="text-blue-700">
            You're currently on the {userSubscription.plan?.name} plan (£{userSubscription.plan?.price_monthly}/month)
          </p>
          {userSubscription.plan?.athlete_limit && (
            <p className="text-blue-600 text-sm">
              Athlete limit: {userSubscription.plan.athlete_limit}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
