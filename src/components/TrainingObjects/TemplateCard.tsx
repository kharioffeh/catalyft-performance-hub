
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { Template } from '@/types/training';
import { GenerateButton } from '@/components/GenerateButton';

interface TemplateCardProps {
  template: Template;
  isCoach: boolean;
  isSolo: boolean;
  deleteLoading: boolean;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isCoach,
  isSolo,
  deleteLoading,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.title}</CardTitle>
          <Badge variant="outline">{template.goal}</Badge>
        </div>
        <CardDescription>
          {template.weeks} week{template.weeks !== 1 ? 's' : ''} • {template.visibility}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600">
          Created {new Date(template.created_at).toLocaleDateString()}
        </div>
        
        {isSolo && (
          <GenerateButton
            templateId={template.id}
            label="Start This Program"
            full
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          />
        )}
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(template.id)}
            className="flex-1"
          >
            View
          </Button>
          {isCoach && (
            <>
              <Button
                size="sm"
                onClick={() => onEdit(template.id)}
                className="flex-1"
              >
                Edit
              </Button>
              <GenerateButton
                templateId={template.id}
                label="Generate"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-sm px-3 py-1"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(template.id)}
                disabled={deleteLoading}
                className="px-3"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
