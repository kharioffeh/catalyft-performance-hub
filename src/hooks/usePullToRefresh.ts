
import { useGesture } from 'react-use-gesture';
import { useSpring } from '@react-spring/web';
import { useReducedMotion } from './useReducedMotion';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  refreshThreshold = 60, 
  enabled = true 
}: UsePullToRefreshOptions) => {
  const prefersReducedMotion = useReducedMotion();
  
  const [{ y, opacity }, api] = useSpring(() => ({
    y: 0,
    opacity: 1,
    config: { tension: 300, friction: 30 },
  }));

  const bind = useGesture({
    onDrag: ({ down, movement, velocity, direction }) => {
      if (!enabled) return;
      
      // Only allow pull down from top
      if (window.scrollY > 0) return;
      
      const [, my] = movement;
      const [, vy] = velocity;
      const [, dy] = direction;
      
      const threshold = refreshThreshold;
      const trigger = my > threshold && !down;
      
      if (trigger) {
        api.start({ y: 0, opacity: 0.6 });
        onRefresh().finally(() => {
          api.start({ y: 0, opacity: 1 });
        });
      } else {
        const pullDistance = Math.max(0, my);
        const pullOpacity = Math.max(0.6, 1 - pullDistance / 200);
        
        if (prefersReducedMotion) {
          api.start({ y: 0, opacity: trigger ? 0.6 : 1 });
        } else {
          api.start({ 
            y: down ? pullDistance * 0.5 : 0,
            opacity: down ? pullOpacity : 1,
            immediate: down
          });
        }
      }
    },
  }, {
    drag: {
      axis: 'y',
      bounds: { top: 0 },
      threshold: 10,
    }
  });

  return { bind, style: { y, opacity } };
};
