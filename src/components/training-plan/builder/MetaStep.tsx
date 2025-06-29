
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BuilderMeta } from '@/hooks/useTemplateBuilder';

interface MetaStepProps {
  meta: BuilderMeta;
  setMeta: (meta: BuilderMeta) => void;
  onNext: () => void;
}

export const MetaStep: React.FC<MetaStepProps> = ({ meta, setMeta, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meta.name.trim()) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Template Metadata</h2>
        <p className="text-white/70">Set up the basic information for your template</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Template Name *</Label>
            <Input
              id="name"
              value={meta.name}
              onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              placeholder="Enter template name..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={meta.description || ''}
              onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              placeholder="Describe the template's purpose and goals..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
              rows={3}
            />
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label className="text-white">Training Goal</Label>
            <Select value={meta.goal} onValueChange={(value: any) => setMeta({ ...meta, goal: value })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1E26] border-white/10">
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="power">Power</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="rehab">Rehabilitation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audience */}
          <div className="space-y-3">
            <Label className="text-white">Audience Type</Label>
            <RadioGroup
              value={meta.audience}
              onValueChange={(value: 'team' | 'individual') => setMeta({ ...meta, audience: value })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" className="border-white/30 data-[state=checked]:border-indigo-500" />
                <Label htmlFor="individual" className="text-white/90">Individual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" className="border-white/30 data-[state=checked]:border-indigo-500" />
                <Label htmlFor="team" className="text-white/90">Team</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Block Length */}
          <div className="space-y-3">
            <Label className="text-white">Block Length: {meta.weeks} weeks</Label>
            <Slider
              value={[meta.weeks]}
              onValueChange={([value]) => setMeta({ ...meta, weeks: value })}
              min={1}
              max={12}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>1 week</span>
              <span>12 weeks</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!meta.name.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8"
          >
            Next Step
          </Button>
        </div>
      </form>
    </div>
  );
};
