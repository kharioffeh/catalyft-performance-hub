
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Send, Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { EnhancedTemplate } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

interface TemplateCardProps {
  template: EnhancedTemplate;
  onAssign?: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onDuplicate?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onAssign,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const { toast } = useToast();

  const handleAssign = () => {
    if (onAssign) {
      onAssign(template.id);
    } else {
      toast({ description: "Assign functionality coming soon" });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(template.id);
    } else {
      toast({ description: "Edit functionality coming soon" });
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
    <Card className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:border-indigo-500/30 transition-colors duration-200 group">
      {/* Quick actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/20 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <MoreVertical className="h-4 w-4 text-white/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-[#1A1E26] border-white/10 rounded-xl w-40"
        >
          <DropdownMenuItem onClick={handleAssign} className="text-white/90 hover:bg-white/10">
            <Send className="h-4 w-4 mr-2" />
            Assign
          </DropdownMenuItem>
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
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardHeader className="p-0">
        {/* Thumbnail with gradient fallback */}
        <div className="h-40 w-full rounded-t-2xl bg-gradient-to-br from-indigo-600/30 to-fuchsia-600/20 flex items-center justify-center">
          <span className="text-sm text-white/60">No preview</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-1">
        <CardTitle className="text-base font-medium text-white truncate" title={template.title}>
          {template.title}
        </CardTitle>
        <p className="text-xs text-white/60">
          {template.weeks} weeks • {template.sessions_count} sessions
        </p>
        <div className="pt-2">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-white/10 text-white/80 capitalize">
            {template.goal}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
