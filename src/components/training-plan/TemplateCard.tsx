
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Copy, Trash2, MoreVertical, Calendar, Target, Users } from 'lucide-react';
import { EnhancedTemplate } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

interface TemplateCardProps {
  template: EnhancedTemplate;
  onEdit?: (templateId: string) => void;
  onDuplicate?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  onView?: (templateId: string) => void;
  deleteLoading?: boolean;
}

// Program type tag component with gradient backgrounds
const ProgramTypeTag: React.FC<{ type: string }> = ({ type }) => {
  const getTagStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength':
        return 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30 text-red-200';
      case 'hypertrophy':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-200';
      case 'power':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200';
      case 'endurance':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200';
      case 'mobility':
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/30 text-yellow-200';
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/30 text-gray-200';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getTagStyle(type)} border px-3 py-1 text-xs font-medium rounded-full`}
    >
      {type}
    </Badge>
  );
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  deleteLoading = false,
}) => {
  const { toast } = useToast();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(template.id);
    } else {
      toast({ description: "Edit functionality coming soon" });
    }
  };

  const handleView = () => {
    if (onView) {
      onView(template.id);
    } else if (onEdit) {
      onEdit(template.id);
    } else {
      toast({ description: "View functionality coming soon" });
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(template.id);
    } else {
      toast({ description: "Duplicate functionality coming soon" });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(template.id);
    } else {
      toast({ description: "Delete functionality coming soon" });
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl hover:border-indigo-500/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      {/* Gradient Header */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-pink-600/20">
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Quick actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
              disabled={deleteLoading}
            >
              <MoreVertical className="h-4 w-4 text-white/90" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-[#1A1E26] border-white/10 rounded-xl w-40 backdrop-blur-md"
          >
            <DropdownMenuItem onClick={handleEdit} className="text-white/90 hover:bg-white/10">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate} className="text-white/90 hover:bg-white/10">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              disabled={deleteLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Program type tag */}
        <div className="absolute bottom-3 left-3">
          <ProgramTypeTag type={template.goal} />
        </div>

        {/* Program stats overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white/80">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{template.weeks}w</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Target className="w-3 h-3" />
            <span>{template.sessions_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-5 space-y-4" onClick={handleView}>
        {/* Title and description */}
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold text-white truncate" title={template.title}>
            {template.title}
          </CardTitle>
          <p className="text-sm text-white/60 line-clamp-2">
            {template.description || `A ${template.weeks}-week ${template.goal} training program designed to help you achieve your fitness goals.`}
          </p>
        </div>

        {/* Additional metadata */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{template.visibility === 'public' ? 'Public' : 'Private'}</span>
          </div>
          <span>
            {new Date(template.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Progress indicator (if applicable) */}
        {template.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>Progress</span>
              <span>{template.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${template.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
