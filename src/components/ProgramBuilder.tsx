
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
          <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b bg-background">
            <BuilderHeader 
              name={name}
              setName={setName}
            />
          </div>
          
          <ScrollArea className="flex-1 overflow-auto [&>[data-radix-scroll-area-viewport]]:max-h-full">
            <div 
              className="px-8 py-6 space-y-4 overflow-y-auto max-h-[60vh]"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
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

          <div className="flex-shrink-0 px-8 pb-8 pt-4 border-t bg-background">
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
