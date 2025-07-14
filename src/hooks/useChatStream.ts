import { useState, useCallback } from 'react';
import { ProgramPatch } from '@/types/programPatch';

export interface AriaStreamEvent {
  type: 'aria';
  data: {
    kind: string;
    payload?: ProgramPatch;
    id?: string;
  };
}

export interface UseChatStreamReturn {
  onAriaMessage: (callback: (event: AriaStreamEvent) => void) => void;
  programPatches: Map<string, ProgramPatch>;
  clearPatch: (id: string) => void;
}

export const useChatStream = (): UseChatStreamReturn => {
  const [programPatches] = useState<Map<string, ProgramPatch>>(new Map());
  const [ariaCallbacks] = useState<Set<(event: AriaStreamEvent) => void>>(new Set());

  const onAriaMessage = useCallback((callback: (event: AriaStreamEvent) => void) => {
    ariaCallbacks.add(callback);
    return () => ariaCallbacks.delete(callback);
  }, [ariaCallbacks]);

  const clearPatch = useCallback((id: string) => {
    programPatches.delete(id);
  }, [programPatches]);

  // This would be called by the enhanced streaming function
  const handleAriaEvent = useCallback((event: AriaStreamEvent) => {
    if (event.type === 'aria' && event.data.kind === 'programPatch' && event.data.payload && event.data.id) {
      // Store patch for idempotency check
      if (!programPatches.has(event.data.id)) {
        programPatches.set(event.data.id, event.data.payload);
        
        // Notify all callbacks
        ariaCallbacks.forEach(callback => callback(event));
      }
    }
  }, [programPatches, ariaCallbacks]);

  return {
    onAriaMessage,
    programPatches,
    clearPatch
  };
};