
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import WeekEditor from './WeekEditor';
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl">Create Program Template</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onClose(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-4">
          <Input
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />

          {weeks.map((week, idx) => (
            <WeekEditor 
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

          <Button 
            onClick={addWeek} 
            disabled={weeks.length >= 12} 
            variant="outline"
            className="mt-4"
          >
            + Add Week
          </Button>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={save} className="px-6">
              Save Template
            </Button>
          </div>
        </div>

        <LibraryDrawer />
      </DialogContent>
    </Dialog>
  );
}
