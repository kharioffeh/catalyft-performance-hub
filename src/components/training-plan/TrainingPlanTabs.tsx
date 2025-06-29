
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';

export const TrainingPlanTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the current tab from the pathname
  const currentTab = location.pathname.split('/').pop() || 'templates';

  const handleTabChange = (value: string) => {
    navigate(`/training-plan/${value}`);
  };

  return (
    <div className="mb-6">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1 grid w-full grid-cols-4">
          <TabsTrigger 
            value="templates" 
            className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="programs" 
            className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200"
          >
            Programs
          </TabsTrigger>
          <TabsTrigger 
            value="instances" 
            className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200"
          >
            Instances
          </TabsTrigger>
          <TabsTrigger 
            value="library" 
            className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200"
          >
            Library
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
