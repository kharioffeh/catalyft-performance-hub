
import React from 'react';
import { Dumbbell, Brain, HeartPulse, Flame, GaugeCircle } from 'lucide-react';

const legendItem = (color: string, text: string, Icon?: React.ElementType) => (
  <div className="flex items-center gap-2 text-sm text-white/80">
    <span className={`${color} h-3 w-3 rounded-full block`} />
    {Icon && <Icon className="w-4 h-4 text-white/60" />}
    {text}
  </div>
);

const LegendBar: React.FC = () => {
  return (
    <div className="flex gap-6 mb-2">
      {legendItem("bg-green-400", "Strength", Dumbbell)}
      {legendItem("bg-blue-400", "Technical", Brain)}
      {legendItem("bg-pink-400", "Recovery", HeartPulse)}
      {legendItem("bg-orange-400", "Conditioning", Flame)}
      {legendItem("bg-purple-400", "Assessment", GaugeCircle)}
    </div>
  );
};

export default LegendBar;
