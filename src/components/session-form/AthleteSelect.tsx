
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import type { Athlete } from "@/hooks/useCreateSessionForm";

interface AthleteSelectProps {
  athletes: Athlete[];
  value: string;
  onChange: (val: string) => void;
}

export const AthleteSelect: React.FC<AthleteSelectProps> = ({ athletes, value, onChange }) => (
  <div>
    <Label htmlFor="athlete" className="flex items-center gap-2">
      <User className="w-4 h-4" />
      Athlete *
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select an athlete" />
      </SelectTrigger>
      <SelectContent>
        {athletes.map((athlete) => (
          <SelectItem key={athlete.id} value={athlete.id}>
            {athlete.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
