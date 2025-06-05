
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  latest?: number;
  delta?: number;
  onClick: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  latest,
  delta,
  onClick
}) => {
  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition-shadow duration-200"
    >
      <CardContent className="p-4">
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {latest !== undefined ? latest.toFixed(1) : "—"}
        </p>
        {delta !== undefined && (
          <p className={`text-sm mt-1 ${
            delta >= 0 ? "text-green-500" : "text-red-500"
          }`}>
            {delta >= 0 ? `+${delta.toFixed(1)}` : `${delta.toFixed(1)}`} vs 7d
          </p>
        )}
      </CardContent>
    </Card>
  );
};
