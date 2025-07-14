
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

  return useCallback(() => {
    if (!enabled) return {};
    
    let timeout: ReturnType<typeof setTimeout>;
    let isLongPress = false;

    const handleStart = () => {
      isLongPress = false;
      timeout = setTimeout(() => {
        isLongPress = true;
        handleLongPress();
      }, delay);
    };

    const handleEnd = () => {
      clearTimeout(timeout);
    };

    const handleCancel = () => {
      clearTimeout(timeout);
    };

    return {
      onPointerDown: handleStart,
      onPointerUp: handleEnd,
      onPointerLeave: handleCancel,
      onPointerCancel: handleCancel,
    };
  }, [handleLongPress, delay, enabled]);
};
