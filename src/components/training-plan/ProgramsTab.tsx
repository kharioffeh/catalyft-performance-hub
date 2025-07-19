
import React, { useState } from 'react';
import { TemplateGrid } from './TemplateGrid';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { EnhancedProgramBuilder } from '@/components/program-builder/EnhancedProgramBuilder';
import { AriaGenerateWizard } from './AriaGenerateWizard';
import { useNavigate } from 'react-router-dom';

export const ProgramsTab: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [ariaWizardOpen, setAriaWizardOpen] = useState(false);
  const isCoach = profile?.role === 'coach';

  const handleCreateProgram = () => {
    setBuilderOpen(true);
  };

  const handleAriaGenerate = () => {
    setAriaWizardOpen(true);
  };

  const handleProgramGenerated = (data: { template_id: string; program_instance_id: string }) => {
    setAriaWizardOpen(false);
    // Navigate to the program instance view instead of template
    navigate(`/program-instance/${data.program_instance_id}`);
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
          <div className="flex gap-3">
            <Button 
              onClick={handleAriaGenerate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
            <Button 
              onClick={handleCreateProgram}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        )}
      </div>

      {/* Program Grid */}
      <TemplateGrid />
      
      <EnhancedProgramBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
      />
      
      <AriaGenerateWizard
        open={ariaWizardOpen}
        onOpenChange={setAriaWizardOpen}
        onProgramGenerated={handleProgramGenerated}
      />
    </div>
  );
};
