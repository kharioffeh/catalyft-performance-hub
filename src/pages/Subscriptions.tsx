
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Subscriptions: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Subscriptions functionality coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;
