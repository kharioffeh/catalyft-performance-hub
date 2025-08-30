import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  threshold?: number;
  className?: string;
}

export const Swipeable: React.FC<SwipeableProps> = ({ 
  children, 
  onSwipeRight, 
  onSwipeLeft, 
  threshold = 100,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const newX = e.touches[0].clientX;
    setCurrentX(newX);
    
    const deltaX = newX - startX;
    const newTranslateX = Math.max(-threshold, Math.min(threshold, deltaX));
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (Math.abs(translateX) >= threshold) {
      if (translateX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (translateX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX;
    setCurrentX(newX);
    
    const deltaX = newX - startX;
    const newTranslateX = Math.max(-threshold, Math.min(threshold, deltaX));
    setTranslateX(newTranslateX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (Math.abs(translateX) >= threshold) {
      if (translateX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (translateX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setTranslateX(0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, translateX]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Delete action indicator */}
      {translateX > threshold * 0.5 && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center rounded-l-lg">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      )}
      
      {/* Main content */}
      <div
        ref={containerRef}
        className="relative bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};