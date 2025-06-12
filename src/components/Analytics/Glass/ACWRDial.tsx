
import React, { useEffect, useRef } from 'react';

interface ACWRDialProps {
  period: string;
  mini?: boolean;
  large?: boolean;
}

export const ACWRDial: React.FC<ACWRDialProps> = ({ period, mini, large }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = mini ? 100 : large ? 200 : 150;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    // Mock ACWR value (should be between 0.8 and 1.5 ideally)
    const acwrValue = 0.9;
    const angle = (acwrValue / 2) * Math.PI; // Convert to radians for half circle

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = mini ? 6 : 12;
    ctx.stroke();

    // Draw value arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle);
    
    // Color based on ACWR value
    if (acwrValue < 0.8 || acwrValue > 1.5) {
      ctx.strokeStyle = '#ef4444'; // Red - high risk
    } else if (acwrValue < 0.9 || acwrValue > 1.3) {
      ctx.strokeStyle = '#facc15'; // Yellow - moderate risk
    } else {
      ctx.strokeStyle = '#22c55e'; // Green - low risk
    }
    
    ctx.lineWidth = mini ? 6 : 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw center value text
    if (!mini) {
      ctx.fillStyle = 'white';
      ctx.font = `${large ? '24' : '18'}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(acwrValue.toFixed(1), centerX, centerY + 5);
      
      ctx.font = `${large ? '12' : '10'}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('ACWR', centerX, centerY + (large ? 25 : 20));
    }

  }, [period, mini, large]);

  return (
    <div className="flex flex-col items-center">
      {!mini && <h3 className="text-white font-medium mb-4">ACWR Ratio</h3>}
      <canvas ref={canvasRef} className="max-w-full" />
      {large && (
        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">Acute:Chronic Workload Ratio</p>
          <p className="text-white/50 text-xs mt-1">Optimal range: 0.8 - 1.3</p>
        </div>
      )}
    </div>
  );
};
