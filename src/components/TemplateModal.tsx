import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import SwipeableViews from 'react-swipeable-views';
import WeekTable from '@/components/WeekTable';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateModalProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (template: any) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  template,
  open,
  onOpenChange,
  onAssign,
}) => {
  const [weekIdx, setWeekIdx] = useState(0);

  if (!template) return null;

  const weeks = template.block_json.weeks || [];
  const totalWeeks = weeks.length;
  const isKAI = template.origin === 'KAI';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] lg:max-w-4xl max-h-[90vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <Badge 
                className={`text-white ${
                  isKAI ? 'bg-badge-kai' : 'bg-badge-coach'
                }`}
              >
                {template.origin}
              </Badge>
              <Badge variant="outline">
                {totalWeeks} Weeks
              </Badge>
            </div>
            <Button 
              onClick={() => onAssign(template)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Assign
            </Button>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}
              disabled={weekIdx === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <h3 className="text-lg font-semibold">
              Week {weekIdx + 1} / {totalWeeks}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekIdx(Math.min(totalWeeks - 1, weekIdx + 1))}
              disabled={weekIdx === totalWeeks - 1}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="overflow-auto max-h-[60vh]">
            <SwipeableViews
              index={weekIdx}
              onChangeIndex={setWeekIdx}
              enableMouseEvents
            >
              {weeks.map((week, index) => (
                <div key={index} className="px-1">
                  <WeekTable week={week} />
                </div>
              ))}
            </SwipeableViews>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
