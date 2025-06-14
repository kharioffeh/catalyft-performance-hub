
import React from 'react';

const LegendBar: React.FC = () => {
  const legendItem = (color: string, text: string) => (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <span className={`${color} h-3 w-3 rounded-full block`} />
      {text}
    </div>
  );

  return (
    <div className="flex gap-6 mb-2">
      {legendItem("bg-green-400", "Strength")}
      {legendItem("bg-blue-400", "Technical")}
      {legendItem("bg-yellow-400", "Recovery")}
    </div>
  );
};

export default LegendBar;
