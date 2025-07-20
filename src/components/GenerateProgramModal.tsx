
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useAthletes } from "@/hooks/useAthletes";
import { useGenerateProgram } from "@/hooks/useGenerateProgram";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GenerateProgramModal: React.FC<Props> = ({ open, onClose }) => {
  const { profile } = useAuth();
  const { athletes } = useAthletes();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { athlete_uuid: "", goal: "strength", weeks: 6 }
  });

  const runGenerate = useGenerateProgram();

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      const templateId = await runGenerate({
        athlete_uuid: values.athlete_uuid,
        coach_uuid: profile?.id,
        goal: values.goal,
        weeks: values.weeks
      });
      onClose();
      navigate(`/template/${templateId}`);
    } catch (e) {
      alert("Generation failed. See console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="rounded-2xl shadow-inner-glass bg-white/70 backdrop-blur-md border border-gym-charcoal/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl text-gym-charcoal">ARIA Program Generator</DialogTitle>
          <DialogDescription>
            Generate an S&C program (2–12 weeks) tailored to your athlete, using ARIA's latest elite models.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm mb-1 font-medium text-gym-charcoal">Athlete</label>
            <Select onValueChange={v => setValue("athlete_uuid", v)} defaultValue={watch("athlete_uuid")}>
              <SelectTrigger className="border rounded">
                <SelectValue placeholder="Select athlete…" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium text-gym-charcoal">Goal</label>
            <Select onValueChange={v => setValue("goal", v)} defaultValue={watch("goal")}>
              <SelectTrigger className="border rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Max Strength</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="power">Speed & Power</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium text-gym-charcoal">Weeks</label>
            <div className="flex items-center gap-3">
              <Slider min={2} max={12} step={1} value={[watch("weeks")]} onValueChange={v => setValue("weeks", v[0])} />
              <span className="text-gym-charcoal font-mono">{watch("weeks")} wks</span>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-gym-charcoal text-lab-white rounded-lg px-6">
              {isLoading ? <Loader2 className="animate-spin mr-2 inline w-4 h-4" /> : "Generate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
