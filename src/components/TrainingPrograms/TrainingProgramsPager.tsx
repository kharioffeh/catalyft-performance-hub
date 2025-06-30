
import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Button } from '@/components/ui/button';
import { MasonryGrid } from './MasonryGrid';
import { motion } from 'framer-motion';

interface TrainingProgramsPagerProps {
  templates: any[];
  workoutTemplates: any[];
  isCoach: boolean;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onAssignTemplate: (template: any) => void;
  onCreateTemplate: () => void;
  onCreateProgram: () => void;
  deleteLoading: boolean;
}

type TabType = 'templates' | 'programs';

interface TabConfig {
  key: TabType;
  title: string;
  data: any[];
  onCreate: () => void;
}

export const TrainingProgramsPager: React.FC<TrainingProgramsPagerProps> = ({
  templates,
  workoutTemplates,
  isCoach,
  onView,
  onEdit,
  onDelete,
  onAssignTemplate,
  onCreateTemplate,
  onCreateProgram,
  deleteLoading,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs: TabConfig[] = [
    { key: 'templates', title: 'Templates', data: templates, onCreate: onCreateProgram },
    { key: 'programs', title: 'Programs', data: workoutTemplates, onCreate: onCreateTemplate },
  ];

  return (
    <div className="w-full">
      {/* Mobile Tab Indicators */}
      <div className="flex justify-center space-x-2 mb-6 md:hidden">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeIndex === index
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Desktop Tab Bar */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeIndex === index
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white/90'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
        {isCoach && (
          <Button 
            onClick={tabs[activeIndex].onCreate}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Create {tabs[activeIndex].title.slice(0, -1)}
          </Button>
        )}
      </div>

      {/* Swipeable Content */}
      <div className="md:hidden">
        <SwipeableViews
          index={activeIndex}
          onChangeIndex={setActiveIndex}
          containerStyle={{ height: 'auto' }}
          slideStyle={{ padding: '0' }}
        >
          {tabs.map((tab, index) => (
            <div key={tab.key}>
              <MasonryGrid
                data={tab.data}
                type={tab.key}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssign={onAssignTemplate}
                deleteLoading={deleteLoading}
              />
            </div>
          ))}
        </SwipeableViews>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MasonryGrid
            data={tabs[activeIndex].data}
            type={tabs[activeIndex].key}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onAssign={onAssignTemplate}
            deleteLoading={deleteLoading}
          />
        </motion.div>
      </div>

      {/* Mobile Create Button */}
      {isCoach && (
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={tabs[activeIndex].onCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
          >
            +
          </Button>
        </div>
      )}
    </div>
  );
};
