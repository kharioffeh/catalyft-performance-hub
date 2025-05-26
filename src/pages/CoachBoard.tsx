
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CoachBoard: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Risk Board</h1>
        <Card>
          <CardHeader>
            <CardTitle>Athlete Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Risk board functionality coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CoachBoard;
