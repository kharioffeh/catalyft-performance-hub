
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

    try {
      // Get the current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        toast({ title: 'Authentication error', variant: 'destructive' });
        return;
      }

      // Get the coach record based on the user's email
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.user.email)
        .single();

      if (coachError || !coach) {
        toast({ 
          title: 'Coach not found', 
          description: 'Your account is not registered as a coach. Please contact support.',
          variant: 'destructive' 
        });
        return;
      }

      // Insert the program template with the correct coach_uuid
      const { error } = await supabase
        .from('program_templates')
        .insert([{ 
          name, 
          block_json: { weeks }, 
          origin: 'COACH',
          coach_uuid: coach.id
        }]);

      if (error) {
        toast({ title: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Template saved successfully' });
        onClose(true);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ 
        title: 'Error saving template', 
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b bg-background">
            <BuilderHeader 
              name={name}
              setName={setName}
            />
          </div>
          
          {/* Scrollable content - Takes remaining space between header and footer */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
          </div>

          {/* Footer - Fixed at bottom as flex item */}
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
