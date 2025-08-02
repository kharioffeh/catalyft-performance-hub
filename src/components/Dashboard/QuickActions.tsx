
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Users, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsNavigation } from '@/hooks/useAnalyticsNavigation';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'default' | 'outline';
}

export const QuickActions: React.FC = () => {
  const navigate = useAnalyticsNavigation();

  const quickActions: QuickAction[] = [
    {
      title: 'Start Workout',
      description: 'Begin your training session',
      icon: Dumbbell,
      action: () => navigate('/workout', { method: 'button' }),
      variant: 'default',
    },
    {
      title: 'View Analytics',
      description: 'Check your progress and metrics',
      icon: BarChart3,
      action: () => navigate('/analytics', { method: 'button' }),
      variant: 'outline',
    },
    {
      title: 'Create Program',
      description: 'Design a new training program',
      icon: Plus,
      action: () => navigate('/workout?tab=templates', { method: 'button' }),
      variant: 'outline',
    },
    {
      title: 'Join Community',
      description: 'Connect with other athletes',
      icon: Users,
      action: () => navigate('/athletes', { method: 'button' }),
      variant: 'outline',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Navigate to key areas of your training platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="flex items-center gap-2 h-12"
              onClick={action.action}
            >
              <action.icon className="w-5 h-5" />
              {action.title}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
