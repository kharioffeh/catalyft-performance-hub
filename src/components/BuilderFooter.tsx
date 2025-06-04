
import React from 'react';
import { Button } from '@/components/ui/button';

interface BuilderFooterProps {
  weeks: any[];
  addWeek: () => void;
  save: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export default function BuilderFooter({ weeks, addWeek, save, isSaving, disabled }: BuilderFooterProps) {
  return (
    <div className="pt-4">
      <div className="flex justify-between items-center">
        <Button 
          onClick={addWeek} 
          disabled={disabled || weeks.length >= 12} 
          variant="outline"
        >
          + Add Week ({weeks.length}/12)
        </Button>
        <Button 
          onClick={save} 
          className="px-6"
          disabled={disabled || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </div>
  );
}
