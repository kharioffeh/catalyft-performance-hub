
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface StartTimeInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const StartTimeInput: React.FC<StartTimeInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="start_time" className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      Start Time *
    </Label>
    <Input
      id="start_time"
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)
