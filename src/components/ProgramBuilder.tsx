
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
  const [weeks, setWeeks] = useState([{ sessions: [] }]);
  const [isSaving, setIsSaving] = useState(false);

  const addWeek = () => {
    if (weeks.length < 12) {
      setWeeks([...weeks, { sessions: [] }]);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      toast({ 
        title: 'Name required', 
        description: 'Please enter a name for your template',
        variant: 'destructive' 
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get the current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user.user) {
        toast({ 
          title: 'Authentication error',
          description: 'Please log in and try again',
          variant: 'destructive' 
        });
        return;
      }

      // Get the coach record based on the user's email
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.user.email)
        .single();

      if (coachError || !coach) {
        console.error('Coach lookup error:', coachError);
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
          name: name.trim(), 
          block_json: { weeks }, 
          origin: 'COACH',
          coach_uuid: coach.id
        }]);

      if (error) {
        console.error('Template save error:', error);
        toast({ 
          title: 'Save failed',
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Success',
          description: 'Template saved successfully'
        });
        setName('');
        setWeeks([{ sessions: [] }]);
        onClose(true);
      }
    } catch (error) {
      console.error('Unexpected error saving template:', error);
      toast({ 
        title: 'Unexpected error', 
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSaving && onClose(false)}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b bg-background">
            <BuilderHeader 
              name={name}
              setName={setName}
              disabled={isSaving}
            />
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="px-8 py-6 space-y-4">
                {weeks.map((week, idx) => (
                  <WeekAccordion 
                    key={idx} 
                    week={week} 
                    weekIdx={idx} 
                    onChange={(newWeek) => {
                      if (!isSaving) {
                        const clone = [...weeks];
                        clone[idx] = newWeek;
                        setWeeks(clone);
                      }
                    }}
                    disabled={isSaving}
                  />
                ))}
                
                {weeks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Click "Add Week" to start building your program
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 px-8 pb-8 pt-4 border-t bg-background">
            <BuilderFooter 
              weeks={weeks}
              addWeek={addWeek}
              save={save}
              isSaving={isSaving}
              disabled={isSaving}
            />
          </div>
        </div>

        <LibraryDrawer />
      </DialogContent>
    </Dialog>
  );
}
