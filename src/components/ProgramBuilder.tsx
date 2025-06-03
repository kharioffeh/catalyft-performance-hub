
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import BuilderHeader from './BuilderHeader';
import BuilderFooter from './BuilderFooter';
import WeekAccordion from './WeekAccordion';
import LibraryDrawer from './LibraryDrawer';

interface ProgramBuilderProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
}

export default function ProgramBuilder({ isOpen, onClose }: ProgramBuilderProps) {
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState([{ sessions: [] }]); // start with 1 week

  const addWeek = () => {
    if (weeks.length < 12) {
      setWeeks([...weeks, { sessions: [] }]);
    }
  };

  const save = async () => {
    if (!name) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('program_templates')
      .insert([{ 
        name, 
        block_json: { weeks }, 
        origin: 'COACH',
        coach_uuid: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Template saved successfully' });
      onClose(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 p-6 pb-0 border-b bg-background">
            <BuilderHeader 
              name={name}
              setName={setName}
              onClose={() => onClose(false)}
            />
          </div>
          
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-6 pt-4 space-y-4">
              {weeks.map((week, idx) => (
                <WeekAccordion 
                  key={idx} 
                  week={week} 
                  weekIdx={idx} 
                  onChange={(newWeek) => {
                    const clone = [...weeks];
                    clone[idx] = newWeek;
                    setWeeks(clone);
                  }} 
                />
              ))}
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 p-6 pt-0 border-t bg-background">
            <BuilderFooter 
              weeks={weeks}
              addWeek={addWeek}
              save={save}
            />
          </div>
        </div>

        <LibraryDrawer />
      </DialogContent>
    </Dialog>
  );
}
