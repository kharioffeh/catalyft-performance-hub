
import React, { useState } from 'react';
import { TemplateGrid } from './TemplateGrid';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { EnhancedProgramBuilder } from '@/components/program-builder/EnhancedProgramBuilder';
import { AriaGenerateWizard } from './AriaGenerateWizard';
import { useNavigate } from 'react-router-dom';

export const MyProgramsScreen: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [ariaWizardOpen, setAriaWizardOpen] = useState(false);

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
          <h2 className="text-2xl font-bold text-white">My Training Programs</h2>
          <p className="text-white/70">Your personalized training programs</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleAriaGenerate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
          <Button onClick={handleCreateProgram} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <TemplateGrid />

      {/* Modals */}
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
