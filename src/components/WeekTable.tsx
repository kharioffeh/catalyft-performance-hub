
import React from 'react';

interface WeekTableProps {
  week: any;
}

export default function WeekTable({ week }: WeekTableProps) {
  // Handle the case where week might be an object with sessions property
  const sessions = week?.sessions || week;
  
  // Ensure sessions is an array and has valid data
  if (!Array.isArray(sessions)) {
    console.warn('WeekTable: sessions is not an array', sessions);
    return (
      <div className="w-full p-4 text-center text-gray-500 border rounded-md bg-gray-50">
        No sessions data available
      </div>
    );
  }

  // Check if there are any exercises to display
  const hasExercises = sessions.some(session => 
    session?.exercises && Array.isArray(session.exercises) && session.exercises.length > 0
  );

  if (!hasExercises) {
    return (
      <div className="w-full p-4 text-center text-gray-500 border rounded-md bg-gray-50">
        No exercises found for this week
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
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
            (session?.exercises || []).map((ex: any, i: number) => (
              <tr key={`${sessionIndex}-${i}`} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                <td className="px-3 py-1 underline text-blue-600 cursor-pointer hover:text-blue-800">
                  {ex?.name || 'Unknown Exercise'}
                </td>
                <td className="text-center">{ex?.pct1RM ?? "-"}</td>
                <td className="text-center">{ex?.sets ?? "-"}</td>
                <td className="text-center">{ex?.reps ?? "-"}</td>
                <td className="text-center">{ex?.rest ?? "-"}</td>
                <td className="text-center">{ex?.rpe ?? "-"}</td>
                <td className="text-left px-3">{ex?.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
