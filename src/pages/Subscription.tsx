
import React from 'react';
import AppLayout from '@/components/AppLayout';
import SubscriptionPlans from '@/components/SubscriptionPlans';

const Subscription: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <SubscriptionPlans />
      </div>
    </AppLayout>
  );
};

export default Subscription;
