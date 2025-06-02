
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTemplateModal } from '@/store/useTemplateModal';

interface TemplateCardProps {
  template: any;
  onAssign: (template: any) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onAssign,
}) => {
  const navigate = useNavigate();
  const isKAI = template.origin === 'KAI';
  
  const handleCardClick = () => {
    navigate(`/template/${template.id}`);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    useTemplateModal.getState().open(template);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
        data-testid="template-card"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="mt-1">
                {template.block_json.weeks?.length || 0} weeks
              </CardDescription>
            </div>
            <Badge 
              className={`text-white ${
                isKAI ? 'bg-badge-kai' : 'bg-badge-coach'
              }`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {template.origin}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePreviewClick}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAssign(template);
              }}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
