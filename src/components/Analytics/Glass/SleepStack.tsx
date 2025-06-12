
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface SleepStackProps {
  period: string;
  spark?: boolean;
}

export const SleepStack: React.FC<SleepStackProps> = ({ period, spark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Generate mock data based on period
    const dataPoints = period === '24h' ? 24 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const labels = Array.from({ length: dataPoints }, (_, i) => 
      period === '24h' ? `${i}:00` : `Day ${i + 1}`
    );

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Deep Sleep',
            data: Array.from({ length: dataPoints }, () => Math.random() * 2 + 1),
            backgroundColor: '#1e40af',
            borderRadius: 2
          },
          {
            label: 'REM Sleep',
            data: Array.from({ length: dataPoints }, () => Math.random() * 2 + 1.5),
            backgroundColor: '#7c3aed',
            borderRadius: 2
          },
          {
            label: 'Light Sleep',
            data: Array.from({ length: dataPoints }, () => Math.random() * 3 + 4),
            backgroundColor: '#0ea5e9',
            borderRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: !spark,
            labels: { color: 'rgba(255, 255, 255, 0.8)' }
          },
          tooltip: { enabled: !spark }
        },
        scales: {
          x: {
            display: !spark,
            stacked: true,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          },
          y: {
            display: !spark,
            stacked: true,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [period, spark]);

  return (
    <div className={spark ? "h-16" : "h-full"}>
      {!spark && <h3 className="text-white font-medium mb-4">Sleep Stages</h3>}
      <canvas ref={canvasRef} />
    </div>
  );
};
