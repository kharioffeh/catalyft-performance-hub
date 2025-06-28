
import React, { useRef } from "react";
import { useVantaBackground } from "../hooks/useVantaBackground";

export const ChatBackground: React.FC = () => {
  const bgRef = useRef<HTMLDivElement>(null);
  useVantaBackground(bgRef);

  return (
    <>
      {/* Vanta background */}
      <div ref={bgRef} className="absolute inset-0 -z-10 pointer-events-none" />
      {/* Accent gradient */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none -z-10" />
    </>
  );
};
