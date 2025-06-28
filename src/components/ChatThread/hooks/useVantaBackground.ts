
import { useEffect, useRef } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

export function useVantaBackground(ref: React.RefObject<HTMLDivElement>) {
  const vantaRef = useRef<any>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    vantaRef.current = NET({
      el: ref.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      backgroundColor: 0x101014,
      color: 0x5e6ad2,
      points: 8,
      maxDistance: 25,
      spacing: 20,
    });
    
    return () => vantaRef.current?.destroy?.();
  }, [ref]);
}
