
import React, { useState } from 'react';
import { TemplateGrid } from './TemplateGrid';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EnhancedProgramBuilder } from '@/components/program-builder/EnhancedProgramBuilder';

export const TemplatesTab: React.FC = () => {
  const { profile } = useAuth();
  const [builderOpen, setBuilderOpen] = useState(false);
  const isCoach = profile?.role === 'coach';

  const handleCreateProgram = () => {
    setBuilderOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Training Programs</h2>
          <p className="text-white/70">Create and manage training programs</p>
        </div>
        {isCoach && (
          <Button 
            onClick={handleCreateProgram}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        )}
      </div>

      {/* Program Grid */}
      <TemplateGrid />
      
      <EnhancedProgramBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
      />
    </div>
  );
};
