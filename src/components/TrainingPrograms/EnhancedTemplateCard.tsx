
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Calendar, Users, Eye, Send, Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedTemplateCardProps {
  template: any;
  type: 'templates' | 'programs';
  index: number;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onAssign: (template: any) => void;
  deleteLoading: boolean;
}

export const EnhancedTemplateCard: React.FC<EnhancedTemplateCardProps> = ({
  template,
  type,
  index,
  onView,
  onEdit,
  onDelete,
  onAssign,
  deleteLoading,
}) => {
  const isKAI = template.origin === 'KAI';
  
  // Calculate card height variation based on content
  const getCardHeight = () => {
    let baseHeight = 'min-h-[180px]';
    const titleLength = template.name?.length || 0;
    const hasDescription = template.description && template.description.length > 50;
    
    if (titleLength > 30 || hasDescription) {
      baseHeight = 'min-h-[220px]';
    }
    if (type === 'templates' && template.block_json?.weeks?.length > 8) {
      baseHeight = 'min-h-[260px]';
    }
    
    return baseHeight;
  };

  // Get weeks count for program templates
  const getWeeksCount = () => {
    if (template.block_json?.weeks?.length) {
      return template.block_json.weeks.length;
    }
    return 0;
  };

  // Generate gradient background
  const getGradientClass = () => {
    const gradients = [
      'bg-gradient-to-br from-indigo-600/30 to-purple-600/20',
      'bg-gradient-to-br from-blue-600/30 to-cyan-600/20',
      'bg-gradient-to-br from-purple-600/30 to-pink-600/20',
      'bg-gradient-to-br from-green-600/30 to-teal-600/20',
      'bg-gradient-to-br from-orange-600/30 to-red-600/20',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={getCardHeight()}
    >
      <Card 
        className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:border-indigo-500/30 transition-all duration-200 group cursor-pointer h-full"
        onClick={() => onView(template.id)}
      >
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/20 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              disabled={deleteLoading}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-white/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-[#1A1E26] border-white/10 rounded-xl w-40"
          >
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onAssign(template);
              }} 
              className="text-white/90 hover:bg-white/10"
            >
              <Send className="h-4 w-4 mr-2" />
              Assign
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(template.id);
              }} 
              className="text-white/90 hover:bg-white/10"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template.id);
              }} 
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              disabled={deleteLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CardHeader className="p-0">
          {/* Thumbnail with gradient */}
          <div className={`h-24 w-full rounded-t-2xl flex items-center justify-center ${getGradientClass()}`}>
            <div className="text-center">
              <Calendar className="w-6 h-6 text-white/60 mx-auto mb-1" />
              <span className="text-xs text-white/60">
                {type === 'templates' ? 'Program' : 'Workout'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 flex flex-col justify-between flex-1">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-white line-clamp-2 flex-1">
                {template.name}
              </CardTitle>
              <Badge 
                className={`ml-2 text-xs ${
                  isKAI ? 'bg-badge-kai text-white' : 'bg-badge-coach text-white'
                }`}
              >
                {template.origin}
              </Badge>
            </div>
            
            {template.description && (
              <p className="text-xs text-white/60 line-clamp-2">
                {template.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-white/60">
              {type === 'templates' && getWeeksCount() > 0 && (
                <span>{getWeeksCount()} weeks • </span>
              )}
              {type === 'programs' && template.estimated_duration && (
                <span>{template.estimated_duration} min • </span>
              )}
              <span>{new Date(template.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(template.id);
                }}
                className="flex-1 text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign(template);
                }}
                className="flex-1 text-xs bg-blue-600/80 hover:bg-blue-600 text-white"
              >
                <Users className="w-3 h-3 mr-1" />
                Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
