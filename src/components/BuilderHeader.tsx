
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface BuilderHeaderProps {
  name: string;
  setName: (name: string) => void;
  onClose: () => void;
}

export default function BuilderHeader({ name, setName, onClose }: BuilderHeaderProps) {
  return (
    <div className="pb-4">
      <DialogHeader className="flex flex-row items-center justify-between space-y-0">
        <DialogTitle className="text-xl">Create Program Template</DialogTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </DialogHeader>
      <Input
        placeholder="Template name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mt-4"
      />
    </div>
  );
}
