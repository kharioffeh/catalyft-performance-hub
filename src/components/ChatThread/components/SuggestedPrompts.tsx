
import React from "react";

interface SuggestedPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
  isVisible: boolean;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  prompts,
  onSelectPrompt,
  isVisible
}) => {
  if (!isVisible || prompts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-3">
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="
              px-3 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30
              rounded-full text-xs text-white/80 hover:text-white
              transition-all duration-200 touch-manipulation
              border border-white/10 hover:border-white/20
              min-h-[32px] flex items-center justify-center
            "
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-center leading-tight">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
