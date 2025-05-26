
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Workout: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
        <Card>
          <CardHeader>
            <CardTitle>Workout Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Workout functionality coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Workout;
