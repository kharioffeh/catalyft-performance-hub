
import React from 'react';
import { Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface ARIAInputSectionProps {
  ariaInput: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ARIAInputSection: React.FC<ARIAInputSectionProps> = ({
  ariaInput,
  onInputChange,
  onSubmit
}) => {
  return (
    <div className="col-span-12">
      <GlassCard accent="secondary" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Ask ARIA
          </h3>
        </div>

        {/* Enhanced Input - Textarea */}
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <textarea
            id="aria-input"
            rows={3}
            className="w-full resize-none rounded-lg bg-black/20 p-3 text-sm placeholder:text-white/40 border border-border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
            placeholder="Ask ARIA… e.g. 'How can I improve recovery this week?'"
            value={ariaInput}
            onChange={(e) => onInputChange(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-white flex items-center gap-2"
              type="submit"
              disabled={!ariaInput.trim()}
            >
              <Sparkles className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
