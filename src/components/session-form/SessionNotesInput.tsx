
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SessionNotesInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const SessionNotesInput: React.FC<SessionNotesInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="notes">Session Notes</Label>
    <Textarea
      id="notes"
      placeholder="Add any specific notes or instructions for this session..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  </div>
)
