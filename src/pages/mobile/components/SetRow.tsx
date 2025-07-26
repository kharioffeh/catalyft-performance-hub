import React, { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Exercise } from '@/types/exercise';

interface SetRowProps {
  set: {
    id: string;
    exercise: string;
    weight: number;
    reps: number;
    rpe?: number;
    tempo?: string;
    velocity?: number;
  };
  exercises: Exercise[];
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({ set, exercises, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassCard className="p-4">
      <div className="space-y-4">
        {/* Exercise Selection */}
        <div>
          <Label className="text-sm font-medium text-white/80 mb-2 block">
            Exercise
          </Label>
          <Select value={set.exercise} onValueChange={(value) => onUpdate('exercise', value)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select exercise..." />
            </SelectTrigger>
            <SelectContent className="bg-brand-charcoal border-white/20">
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.name} className="text-white">
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Set Data - Weight and Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-white/80 mb-2 block">
              Weight (lbs)
            </Label>
            <Input
              type="number"
              value={set.weight || ''}
              onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-brand-electric focus:ring-brand-electric"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-white/80 mb-2 block">
              Reps
            </Label>
            <Input
              type="number"
              value={set.reps || ''}
              onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-brand-electric focus:ring-brand-electric"
            />
          </div>
        </div>

        {/* Expandable Advanced Options */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:text-white hover:bg-white/10 p-0 h-auto"
          >
            <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            {isExpanded ? 'Hide' : 'Show'} Advanced Options
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            {/* RPE Slider */}
            <div>
              <Label className="text-sm font-medium text-white/80 mb-2 block">
                RPE (Rate of Perceived Exertion): {set.rpe || 'Not set'}
              </Label>
              <Slider
                value={[set.rpe || 5]}
                onValueChange={(value) => onUpdate('rpe', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>1 - Very Easy</span>
                <span>10 - Max Effort</span>
              </div>
            </div>

            {/* Tempo */}
            <div>
              <Label className="text-sm font-medium text-white/80 mb-2 block">
                Tempo (e.g., 3-1-2-0)
              </Label>
              <Input
                type="text"
                value={set.tempo || ''}
                onChange={(e) => onUpdate('tempo', e.target.value)}
                placeholder="3-1-2-0"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-brand-electric focus:ring-brand-electric"
              />
            </div>

            {/* Velocity */}
            <div>
              <Label className="text-sm font-medium text-white/80 mb-2 block">
                Velocity (m/s)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={set.velocity || ''}
                onChange={(e) => onUpdate('velocity', parseFloat(e.target.value) || undefined)}
                placeholder="0.75"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-brand-electric focus:ring-brand-electric"
              />
            </div>
          </div>
        )}

        {/* Remove Button */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Set
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};