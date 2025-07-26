
import React from 'react';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Subscription: React.FC = () => {
  const { profile } = useAuth();

  // Subscription page disabled for solo users
  return (
    <div className="space-responsive">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Subscription management is not available for solo users.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="space-responsive">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-4 text-base md:text-lg text-gray-600">
          Choose the plan that fits your coaching needs
        </p>
      </div>
      <SubscriptionPlans />
    </div>
  );
};

export default Subscription;
