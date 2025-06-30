
import { useGesture } from 'react-use-gesture';
import { useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  delay?: number;
  enabled?: boolean;
}

export const useLongPress = ({ 
  onLongPress, 
  delay = 500, 
  enabled = true 
}: UseLongPressOptions) => {
  const handleLongPress = useCallback(() => {
    if (enabled) {
      onLongPress();
    }
  }, [onLongPress, enabled]);

  const bind = useGesture({
    onPointerDown: ({ event }) => {
      if (!enabled) return;
      
      const timeout = setTimeout(() => {
        handleLongPress();
      }, delay);
      
      const cleanup = () => {
        clearTimeout(timeout);
        document.removeEventListener('pointerup', cleanup);
        document.removeEventListener('pointercancel', cleanup);
        document.removeEventListener('pointermove', cleanup);
      };
      
      document.addEventListener('pointerup', cleanup);
      document.addEventListener('pointercancel', cleanup);
      document.addEventListener('pointermove', cleanup);
    },
  }, {
    pointer: {
      threshold: 10,
    }
  });

  return bind;
};
