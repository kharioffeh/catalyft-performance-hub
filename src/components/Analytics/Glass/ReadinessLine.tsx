
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ReadinessLineProps {
  period: string;
  spark?: boolean;
}

export const ReadinessLine: React.FC<ReadinessLineProps> = ({ period, spark }) => {
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
    const data = Array.from({ length: dataPoints }, () => Math.random() * 20 + 80);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          fill: true,
          pointRadius: spark ? 0 : 3,
          pointHoverRadius: spark ? 0 : 6,
          tension: 0.35,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: !spark }
        },
        scales: {
          x: {
            display: !spark,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          },
          y: {
            display: !spark,
            min: 50,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
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
      {!spark && <h3 className="text-white font-medium mb-4">Readiness Trend</h3>}
      <canvas ref={canvasRef} />
    </div>
  );
};
