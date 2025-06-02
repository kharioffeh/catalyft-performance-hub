
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, BarChart3, Calendar } from 'lucide-react';

interface WorkoutStatsProps {
  templates: any[];
  assignedWorkouts: any[];
}

export const WorkoutStats: React.FC<WorkoutStatsProps> = ({ 
  templates, 
  assignedWorkouts 
}) => {
  const getStatsCards = () => {
    const completedWorkouts = assignedWorkouts.filter(w => w.status === 'completed').length;
    const pendingWorkouts = assignedWorkouts.filter(w => w.status === 'assigned').length;
    const totalTemplates = templates.length;

    return [
      {
        title: 'Total Templates',
        value: totalTemplates,
        icon: Library,
        description: 'Workout templates created'
      },
      {
        title: 'Completed Workouts',
        value: completedWorkouts,
        icon: BarChart3,
        description: 'Workouts finished'
      },
      {
        title: 'Pending Workouts',
        value: pendingWorkouts,
        icon: Calendar,
        description: 'Workouts assigned'
      }
    ];
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {getStatsCards().map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
