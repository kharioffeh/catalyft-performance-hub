
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Target } from 'lucide-react';
import { WorkoutTemplate } from '@/types/workout';

interface WorkoutTemplateListProps {
  templates: WorkoutTemplate[];
  onTemplateSelect: (template: WorkoutTemplate) => void;
  onAssignTemplate?: (template: WorkoutTemplate) => void;
  showAssignButton?: boolean;
}

export const WorkoutTemplateList: React.FC<WorkoutTemplateListProps> = ({
  templates,
  onTemplateSelect,
  onAssignTemplate,
  showAssignButton = false,
}) => {
  const getDifficultyColor = (level?: number) => {
    if (!level) return 'secondary';
    if (level <= 2) return 'default';
    if (level <= 3) return 'secondary';
    return 'destructive';
  };

  const getDifficultyText = (level?: number) => {
    if (!level) return 'Not set';
    if (level === 1) return 'Beginner';
    if (level === 2) return 'Easy';
    if (level === 3) return 'Moderate';
    if (level === 4) return 'Hard';
    return 'Expert';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onTemplateSelect(template)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="mt-1">
                  {template.description || 'No description'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {template.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{template.estimated_duration || 'N/A'} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <Badge variant={getDifficultyColor(template.difficulty_level)} className="text-xs">
                  {getDifficultyText(template.difficulty_level)}
                </Badge>
              </div>
            </div>
            
            {showAssignButton && onAssignTemplate && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignTemplate(template);
                }}
                className="w-full"
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
