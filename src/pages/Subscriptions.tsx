
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';

const Subscriptions: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  if (profile?.role !== 'coach') {
    return (
      <div className="space-responsive">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Subscriptions</h1>
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
    <div className="space-responsive">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Subscriptions & Billing</h1>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className={`${isMobile ? 'w-full' : ''} grid grid-cols-2`}>
          <TabsTrigger value="current" className="text-sm">Current Subscription</TabsTrigger>
          <TabsTrigger value="plans" className="text-sm">Available Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-responsive mt-4">
          <SubscriptionManagement />
        </TabsContent>
        
        <TabsContent value="plans" className="space-responsive mt-4">
          <SubscriptionPlans />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subscriptions;
