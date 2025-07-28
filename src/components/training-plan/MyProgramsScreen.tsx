
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
      {/* Quick Actions */}
      <div className="flex gap-3 justify-center md:justify-end">
        <Button 
          onClick={handleAriaGenerate}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </Button>
        <Button 
          onClick={handleCreateProgram} 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Program
        </Button>
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

      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button 
          onClick={handleCreateProgram}
          size="lg"
          className="rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
