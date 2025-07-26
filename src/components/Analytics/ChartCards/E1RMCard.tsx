import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface E1RMData {
  exercise: string;
  date: string;
  e1rm: number;
}

interface E1RMCardProps {
  data: E1RMData[];
}

const EXERCISE_COLORS = [
  'hsl(var(--brand-blue))',
  'hsl(var(--brand-purple))', 
  'hsl(var(--brand-green))',
  'hsl(var(--brand-orange))',
  'hsl(var(--brand-red))',
];

export const E1RMCard: React.FC<E1RMCardProps> = ({ data }) => {
  // Group data by exercise
  const exercises = Array.from(new Set(data.map(d => d.exercise)));
  const [hiddenExercises, setHiddenExercises] = useState<Set<string>>(new Set());
  
  // Transform data for the chart
  const chartData = data.reduce((acc, item) => {
    const existingEntry = acc.find(entry => entry.date === item.date);
    if (existingEntry) {
      existingEntry[item.exercise] = item.e1rm;
    } else {
      acc.push({
        date: item.date,
        [item.exercise]: item.e1rm
      });
    }
    return acc;
  }, [] as any[]);

  const toggleExercise = (exercise: string) => {
    const newHidden = new Set(hiddenExercises);
    if (newHidden.has(exercise)) {
      newHidden.delete(exercise);
    } else {
      newHidden.add(exercise);
    }
    setHiddenExercises(newHidden);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[300px] h-[240px] flex flex-col">
      <h3 className="font-display font-semibold text-lg text-slate-50 mb-2">
        Estimated 1RM Progress
      </h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-2">
        {exercises.slice(0, 3).map((exercise, index) => (
          <button
            key={exercise}
            onClick={() => toggleExercise(exercise)}
            className={`text-xs px-2 py-1 rounded-md transition-opacity ${
              hiddenExercises.has(exercise) ? 'opacity-50' : 'opacity-100'
            }`}
            style={{ 
              backgroundColor: `${EXERCISE_COLORS[index % EXERCISE_COLORS.length]}20`,
              color: EXERCISE_COLORS[index % EXERCISE_COLORS.length]
            }}
          >
            {exercise}
          </button>
        ))}
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}kg`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
            {exercises.map((exercise, index) => (
              !hiddenExercises.has(exercise) && (
                <Line
                  key={exercise}
                  type="monotone"
                  dataKey={exercise}
                  stroke={EXERCISE_COLORS[index % EXERCISE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};