
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface DateInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="date" className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      Date *
    </Label>
    <Input
      id="date"
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={new Date().toISOString().split('T')[0]}
    />
  </div>
);
