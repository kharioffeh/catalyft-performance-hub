
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PerformanceTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          Performance tracking coming soon
        </div>
      </CardContent>
    </Card>
  );
};
