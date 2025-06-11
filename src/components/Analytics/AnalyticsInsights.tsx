
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ARIAInsight } from './ARIAInsight';
import { TrendingUp } from 'lucide-react';

interface AnalyticsInsightsProps {
  isHourlyView: boolean;
  period: number;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({
  isHourlyView,
  period
}) => {
  return (
    <Card className="shadow-sm border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          AI Performance Insights {isHourlyView && "(24h View)"}
        </CardTitle>
        <CardDescription>
          {isHourlyView ? 
            "Real-time insights based on your hourly performance patterns" :
            "Personalized recommendations based on your performance data"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ARIAInsight metric="overview" period={period} />
      </CardContent>
    </Card>
  );
};
