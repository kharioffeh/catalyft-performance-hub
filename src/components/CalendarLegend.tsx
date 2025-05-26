
import React from 'react';

const CalendarLegend = () => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Sessions</h2>
      <div className="flex space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00FF7B' }}></div>
          <span className="ml-2">Strength</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5BAFFF' }}></div>
          <span className="ml-2">Technical</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFCB5B' }}></div>
          <span className="ml-2">Recovery</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
