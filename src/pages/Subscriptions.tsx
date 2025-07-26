
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CurrencySelector } from '@/components/CurrencySelector';

const Subscriptions: React.FC = () => {
  const { profile } = useAuth();

  // All users are solo now - subscriptions not available
  return (
    <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
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
            Subscription management is not available for solo users.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Subscriptions;
