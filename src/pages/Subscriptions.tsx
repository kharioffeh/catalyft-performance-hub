
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Subscriptions: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'coach') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
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
      <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Billing</h1>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Subscription</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <SubscriptionManagement />
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-6">
          <SubscriptionPlans />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subscriptions;
