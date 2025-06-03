
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface BuilderHeaderProps {
  name: string;
  setName: (name: string) => void;
}

export default function BuilderHeader({ name, setName }: BuilderHeaderProps) {
  return (
    <div className="pb-4">
      <DialogHeader className="space-y-0 mb-4">
        <DialogTitle className="text-xl">Create Program Template</DialogTitle>
      </DialogHeader>
      <Input
        placeholder="Template name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
