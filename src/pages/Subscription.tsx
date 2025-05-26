
import React from 'react';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Subscription: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'coach') {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Subscription management is only available for coaches.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose the plan that fits your coaching needs
        </p>
      </div>
      <SubscriptionPlans />
    </div>
  );
};

export default Subscription;
