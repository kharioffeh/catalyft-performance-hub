import React, { useState } from 'react';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLegend, VictoryTheme } from 'victory';

interface E1RMData {
  exercise: string;
  date: string;
  e1rm: number;
}

interface E1RMCardProps {
  data: E1RMData[];
}

const EXERCISE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
];

export const E1RMCard: React.FC<E1RMCardProps> = ({ data }) => {
  // Group data by exercise
  const exercises = Array.from(new Set(data.map(d => d.exercise)));
  const [hiddenExercises, setHiddenExercises] = useState<Set<string>>(new Set());
  
  // Transform data for Victory
  const exerciseData = exercises.map((exercise, index) => {
    const exercisePoints = data
      .filter(d => d.exercise === exercise)
      .map(d => ({
        x: new Date(d.date),
        y: d.e1rm
      }));
    
    return {
      exercise,
      data: exercisePoints,
      color: EXERCISE_COLORS[index % EXERCISE_COLORS.length],
      hidden: hiddenExercises.has(exercise)
    };
  });

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
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full h-[320px] flex flex-col">
      <h3 className="font-display font-semibold text-xl text-slate-50 mb-4">
        Estimated 1RM Progress
      </h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {exercises.slice(0, 3).map((exercise, index) => (
          <button
            key={exercise}
            onClick={() => toggleExercise(exercise)}
            className={`text-sm px-3 py-2 rounded-md transition-opacity ${
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
        <VictoryChart
          theme={VictoryTheme.material}
          width={350}
          height={180}
          padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
          style={{
            parent: { background: 'transparent' }
          }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(value) => `${value}kg`}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#94a3b8' },
              grid: { stroke: '#374151', strokeWidth: 0.5 }
            }}
          />
          <VictoryAxis
            tickFormat={(date) => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#94a3b8' }
            }}
          />
          {exerciseData.map((exercise) => (
            !exercise.hidden && exercise.data.length > 0 && (
              <VictoryLine
                key={exercise.exercise}
                data={exercise.data}
                style={{
                  data: { stroke: exercise.color, strokeWidth: 3 }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
            )
          ))}
        </VictoryChart>
      </div>
    </div>
  );
};