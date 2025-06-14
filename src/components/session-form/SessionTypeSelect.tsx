
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dumbbell } from "lucide-react";

interface SessionTypeSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export const SessionTypeSelect: React.FC<SessionTypeSelectProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="type" className="flex items-center gap-2">
      <Dumbbell className="w-4 h-4" />
      Session Type *
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select session type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="strength">Strength Training</SelectItem>
        <SelectItem value="technical">Technical Training</SelectItem>
        <SelectItem value="recovery">Recovery Session</SelectItem>
        <SelectItem value="conditioning">Conditioning</SelectItem>
        <SelectItem value="assessment">Assessment</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
