
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface EndTimeInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const EndTimeInput: React.FC<EndTimeInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="end_time" className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      End Time *
    </Label>
    <Input
      id="end_time"
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)
