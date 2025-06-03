
import React from 'react';

interface WeekTableProps {
  week: any;
}

export default function WeekTable({ week }: WeekTableProps) {
  // Handle the case where week might be an object with sessions property
  const sessions = week.sessions || week;
  
  // Ensure sessions is an array
  if (!Array.isArray(sessions)) {
    console.warn('WeekTable: sessions is not an array', sessions);
    return <div>No sessions data available</div>;
  }

  return (
    <table className="w-full table-auto border mb-6">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-3 py-2 text-left">Exercise</th>
          <th>%1RM</th>
          <th>Sets</th>
          <th>Reps</th>
          <th>Rest</th>
          <th>RPE</th>
          <th className="text-left">Notes</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session: any, sessionIndex: number) =>
          (session.exercises || []).map((ex: any, i: number) => (
            <tr key={`${sessionIndex}-${i}`} className="even:bg-gray-50">
              <td className="px-3 py-1 underline text-blue-600 cursor-pointer">{ex.name}</td>
              <td>{ex.pct1RM ?? "-"}</td>
              <td>{ex.sets}</td>
              <td>{ex.reps}</td>
              <td>{ex.rest}</td>
              <td>{ex.rpe ?? "-"}</td>
              <td className="text-left">{ex.notes ?? ""}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
