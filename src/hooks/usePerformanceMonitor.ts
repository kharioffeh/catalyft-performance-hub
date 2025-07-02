
import { useEffect } from 'react';

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor bundle loading performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('🚀 Performance Metrics:', {
            'First Paint': navEntry.responseStart - navEntry.requestStart,
            'DOM Content Loaded': navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            'Load Complete': navEntry.loadEventEnd - navEntry.loadEventStart,
            'Total Load Time': navEntry.loadEventEnd - navEntry.fetchStart
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Monitor FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        if (fps < 55) {
          console.warn(`⚠️ Low FPS detected: ${fps}fps`);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkFPS);
    };

    const rafId = requestAnimationFrame(checkFPS);
    
    return () => cancelAnimationFrame(rafId);
  }, []);
};
