
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar } from 'lucide-react';
import { Template } from '@/types/training';

interface TrainingObjectsStatsProps {
  templates: Template[];
  programInstances: any[];
}

export const TrainingObjectsStats: React.FC<TrainingObjectsStatsProps> = ({
  templates,
  programInstances,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Templates</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{templates.length}</div>
          <p className="text-xs text-muted-foreground">
            Training templates created
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {programInstances.filter(p => p.status === 'active').length}
          </div>
          <p className="text-xs text-muted-foreground">
            Currently running programs
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{programInstances.length}</div>
          <p className="text-xs text-muted-foreground">
            All program instances
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
