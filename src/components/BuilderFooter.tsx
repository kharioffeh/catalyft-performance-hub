
import React from 'react';
import { Button } from '@/components/ui/button';

interface BuilderFooterProps {
  weeks: any[];
  addWeek: () => void;
  save: () => void;
}

export default function BuilderFooter({ weeks, addWeek, save }: BuilderFooterProps) {
  return (
    <div className="border-t pt-4 bg-background">
      <div className="flex justify-between items-center">
        <Button 
          onClick={addWeek} 
          disabled={weeks.length >= 12} 
          variant="outline"
        >
          + Add Week ({weeks.length}/12)
        </Button>
        <Button onClick={save} className="px-6">
          Save Template
        </Button>
      </div>
    </div>
  );
}
