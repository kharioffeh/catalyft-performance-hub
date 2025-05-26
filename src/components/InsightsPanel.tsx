
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface Insight {
  type: 'positive' | 'warning' | 'negative' | 'neutral';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

interface InsightsPanelProps {
  insights: Insight[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'negative':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Intelligent analysis of your training data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Not enough data for insights yet
          </div>
        ) : (
          insights.map((insight, index) => (
            <Alert key={index} className="border-l-4 border-l-blue-500">
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    {insight.change && (
                      <Badge variant={getInsightVariant(insight.type)} className="text-xs">
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </Badge>
                    )}
                  </div>
                  <AlertDescription className="text-xs">
                    {insight.description}
                  </AlertDescription>
                  {insight.metric && (
                    <div className="text-xs text-gray-500 mt-1">
                      {insight.metric}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
};
