
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProgramSession } from '@/hooks/useEnhancedProgramBuilder';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2 } from 'lucide-react';

interface ProgramSessionCardProps {
  session: ProgramSession;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ProgramSessionCard: React.FC<ProgramSessionCardProps> = ({
  session,
  isSelected = false,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`mb-2 cursor-pointer transition-colors ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected
          ? 'bg-indigo-600/30 border-indigo-500/60 ring-1 ring-indigo-500/40'
          : 'bg-white/10 border-white/20 hover:bg-white/15'
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">
              {session.title}
            </h4>
            <p className="text-xs text-white/60">
              {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-white/10 rounded">
              <Edit2 className="w-3 h-3 text-white/60" />
            </button>
            <button
              {...attributes}
              {...listeners}
              className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3 h-3 text-white/60" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
