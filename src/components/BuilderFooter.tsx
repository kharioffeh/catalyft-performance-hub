
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
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <Button 
          onClick={addWeek} 
          disabled={disabled || weeks.length >= 12} 
          variant="outline"
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          + Add Week ({weeks.length}/12)
        </Button>
        <Button 
          onClick={save} 
          className="w-full sm:w-auto px-6 order-1 sm:order-2"
          disabled={disabled || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </div>
  );
}
