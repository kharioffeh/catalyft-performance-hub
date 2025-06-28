
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { EnhancedSubscriptionManagement } from '@/components/EnhancedSubscriptionManagement';
import { EnhancedSubscriptionPlans } from '@/components/EnhancedSubscriptionPlans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CurrencySelector } from '@/components/CurrencySelector';

const Subscriptions: React.FC = () => {
  const { user, profile, org, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/20 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-white/20 rounded"></div>
              <div className="h-64 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'coach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
              <p className="text-white/70">Manage your subscription and billing</p>
            </div>
            <CurrencySelector />
          </div>
          
          <Alert className="bg-red-500/10 border-red-400/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              Subscription management is only available for coaches.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Subscriptions & Billing</h1>
            <p className="text-white/70">Manage your subscription, billing, and athlete limits</p>
          </div>
          <CurrencySelector />
        </div>
        
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="current" className="text-white data-[state=active]:bg-white/20">
              Current Subscription
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-white data-[state=active]:bg-white/20">
              Available Plans
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="mt-6">
            <EnhancedSubscriptionManagement />
          </TabsContent>
          
          <TabsContent value="plans" className="mt-6">
            <EnhancedSubscriptionPlans />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Subscriptions;
