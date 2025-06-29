
import React from 'react';
import { TemplateGrid } from './TemplateGrid';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const TemplatesTab: React.FC = () => {
  const { profile } = useAuth();
  const isCoach = profile?.role === 'coach';

  const handleCreateTemplate = () => {
    console.log('Create template');
  };

  const handleCreateProgram = () => {
    console.log('Create program');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Training Templates</h2>
          <p className="text-white/70">Create and manage training templates</p>
        </div>
        {isCoach && (
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateTemplate}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
            <Button 
              onClick={handleCreateProgram} 
              variant="outline"
              className="bg-transparent hover:bg-white/10 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        )}
      </div>

      {/* Template Grid */}
      <TemplateGrid />
    </div>
  );
};
