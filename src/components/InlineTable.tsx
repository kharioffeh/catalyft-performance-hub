
import React from 'react';
import { Input } from '@/components/ui/input';

interface InlineTableProps {
  week: any;
  weekIdx: number;
  editable: boolean;
  onEdit: (weekIdx: number, sessIdx: number, exIdx: number, field: string, value: any) => void;
}

export default function InlineTable({ week, weekIdx, editable, onEdit }: InlineTableProps) {
  const handleChange = (sessIdx: number, exIdx: number, field: string, value: string) => {
    // Convert numeric fields to numbers
    const numericFields = ['pct1RM', 'sets', 'reps', 'rpe'];
    const finalValue = numericFields.includes(field) && value !== '' ? Number(value) : value;
    onEdit(weekIdx, sessIdx, exIdx, field, finalValue);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Exercise</th>
            <th className="px-3 py-2 text-center">%1RM</th>
            <th className="px-3 py-2 text-center">Sets</th>
            <th className="px-3 py-2 text-center">Reps</th>
            <th className="px-3 py-2 text-center">Rest</th>
            <th className="px-3 py-2 text-center">RPE</th>
            <th className="px-3 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {week.map((session: any, sessIdx: number) =>
            (session.exercises || []).map((exercise: any, exIdx: number) => (
              <tr key={`${sessIdx}-${exIdx}`} className="even:bg-gray-50">
                <td className="px-3 py-2 font-medium text-blue-600">
                  {exercise.name}
                </td>
                
                <td className="px-3 py-2 text-center">
                  {editable ? (
                    <Input
                      type="number"
                      className="w-16 h-8 text-center text-xs"
                      value={exercise.pct1RM ?? ''}
                      onChange={(e) => handleChange(sessIdx, exIdx, 'pct1RM', e.target.value)}
                      placeholder="-"
                    />
                  ) : (
                    exercise.pct1RM ?? '-'
                  )}
                </td>
                
                <td className="px-3 py-2 text-center">
                  {editable ? (
                    <Input
                      type="number"
                      className="w-16 h-8 text-center text-xs"
                      value={exercise.sets ?? ''}
                      onChange={(e) => handleChange(sessIdx, exIdx, 'sets', e.target.value)}
                      placeholder="-"
                    />
                  ) : (
                    exercise.sets ?? '-'
                  )}
                </td>
                
                <td className="px-3 py-2 text-center">
                  {editable ? (
                    <Input
                      type="text"
                      className="w-16 h-8 text-center text-xs"
                      value={exercise.reps ?? ''}
                      onChange={(e) => handleChange(sessIdx, exIdx, 'reps', e.target.value)}
                      placeholder="-"
                    />
                  ) : (
                    exercise.reps ?? '-'
                  )}
                </td>
                
                <td className="px-3 py-2 text-center">
                  {editable ? (
                    <Input
                      type="text"
                      className="w-20 h-8 text-center text-xs"
                      value={exercise.rest ?? ''}
                      onChange={(e) => handleChange(sessIdx, exIdx, 'rest', e.target.value)}
                      placeholder="-"
                    />
                  ) : (
                    exercise.rest ?? '-'
                  )}
                </td>
                
                <td className="px-3 py-2 text-center">
                  {editable ? (
                    <Input
                      type="number"
                      className="w-16 h-8 text-center text-xs"
                      value={exercise.rpe ?? ''}
                      onChange={(e) => handleChange(sessIdx, exIdx, 'rpe', e.target.value)}
                      placeholder="-"
                    />
                  ) : (
                    exercise.rpe ?? '-'
                  )}
                </td>
                
                <td className="px-3 py-2">
                  {editable ? (
                    <Input
                      type="text"
                      className="w-32 h-8 text-xs"
                      value={exercise.notes ?? ''}
                      onChange={(e) => handleChange(sessIdx, exIdx, 'notes', e.target.value)}
                      placeholder="Notes..."
                    />
                  ) : (
                    exercise.notes ?? ''
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
