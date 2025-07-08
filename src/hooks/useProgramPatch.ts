import { useMemo } from 'react';
import { ProgramPatch, Mesocycle, DailySession } from '@/types/programPatch';
import { addWeeks, format } from 'date-fns';

// Mock data generator for demonstration
export const useProgramPatch = (templateData?: any) => {
  const mockPrograms = useMemo((): ProgramPatch[] => {
    // If we have actual template data, try to convert it
    if (templateData && Array.isArray(templateData) && templateData.length > 0) {
      return templateData.map((template, index) => convertTemplateToProgramPatch(template, index));
    }

    // Otherwise return mock data
    return [
      {
        id: 'program-1',
        name: 'Strength & Conditioning Block',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addWeeks(new Date(), 12), 'yyyy-MM-dd'),
        total_weeks: 12,
        mesocycles: [
          {
            id: 'meso-1',
            label: 'Base Building',
            weeks: 4,
            start_week: 1,
            focus: 'Volume accumulation and movement quality',
            sessions: generateMockSessions(1, 4, 'base')
          },
          {
            id: 'meso-2',
            label: 'Strength Development',
            weeks: 4,
            start_week: 5,
            focus: 'Increased intensity and strength focus',
            sessions: generateMockSessions(5, 8, 'strength')
          },
          {
            id: 'meso-3',
            label: 'Peak & Test',
            weeks: 4,
            start_week: 9,
            focus: 'Peaking and testing phase',
            sessions: generateMockSessions(9, 12, 'peak')
          }
        ]
      },
      {
        id: 'program-2',
        name: 'Endurance Foundation',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addWeeks(new Date(), 8), 'yyyy-MM-dd'),
        total_weeks: 8,
        mesocycles: [
          {
            id: 'meso-4',
            label: 'Aerobic Base',
            weeks: 4,
            start_week: 1,
            focus: 'Aerobic capacity development',
            sessions: generateMockSessions(1, 4, 'endurance')
          },
          {
            id: 'meso-5',
            label: 'Threshold',
            weeks: 4,
            start_week: 5,
            focus: 'Lactate threshold improvement',
            sessions: generateMockSessions(5, 8, 'threshold')
          }
        ]
      }
    ];
  }, [templateData]);

  return { programs: mockPrograms };
};

function convertTemplateToProgramPatch(template: any, index: number): ProgramPatch {
  // Try to extract meaningful data from the template
  const blockJson = template.block_json || {};
  const totalWeeks = blockJson.weeks || 8;
  
  return {
    id: template.id || `program-${index}`,
    name: template.name || `Program ${index + 1}`,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addWeeks(new Date(), totalWeeks), 'yyyy-MM-dd'),
    total_weeks: totalWeeks,
    mesocycles: [{
      id: `meso-${template.id}`,
      label: blockJson.label || 'Training Block',
      weeks: totalWeeks,
      start_week: 1,
      focus: blockJson.focus || 'General training adaptations',
      sessions: generateMockSessions(1, totalWeeks, 'mixed')
    }]
  };
}

function generateMockSessions(startWeek: number, endWeek: number, phase: string): DailySession[] {
  const sessions: DailySession[] = [];
  
  for (let week = startWeek; week <= endWeek; week++) {
    // Monday - Upper body strength
    sessions.push({
      id: `session-${week}-1`,
      week,
      day: 1,
      title: 'Upper Body Strength',
      type: 'strength',
      duration_minutes: 90,
      exercises: [
        { id: '1', name: 'Bench Press', sets: 4, reps: '6-8', load_percent: 80, rest_seconds: 180, primary_muscle: 'Chest' },
        { id: '2', name: 'Pull-ups', sets: 4, reps: '8-10', rest_seconds: 120, primary_muscle: 'Back' },
        { id: '3', name: 'Overhead Press', sets: 3, reps: '8-10', load_percent: 75, rest_seconds: 120, primary_muscle: 'Shoulders' }
      ]
    });

    // Wednesday - Lower body strength
    sessions.push({
      id: `session-${week}-3`,
      week,
      day: 3,
      title: 'Lower Body Strength',
      type: 'strength',
      duration_minutes: 90,
      exercises: [
        { id: '4', name: 'Squat', sets: 4, reps: '6-8', load_percent: 85, rest_seconds: 180, primary_muscle: 'Quadriceps' },
        { id: '5', name: 'Romanian Deadlift', sets: 3, reps: '8-10', load_percent: 70, rest_seconds: 120, primary_muscle: 'Hamstrings' },
        { id: '6', name: 'Lunges', sets: 3, reps: '10 each', rest_seconds: 90, primary_muscle: 'Glutes' }
      ]
    });

    // Friday - Conditioning or accessory work
    if (phase === 'endurance' || phase === 'threshold') {
      sessions.push({
        id: `session-${week}-5`,
        week,
        day: 5,
        title: 'Cardio Session',
        type: 'conditioning',
        duration_minutes: 60,
        exercises: [
          { id: '7', name: 'Steady State Run', sets: 1, reps: '45 min', primary_muscle: 'Cardiovascular' },
          { id: '8', name: 'Core Circuit', sets: 3, reps: '30s each', rest_seconds: 60, primary_muscle: 'Core' }
        ]
      });
    } else {
      sessions.push({
        id: `session-${week}-5`,
        week,
        day: 5,
        title: 'Accessory Work',
        type: 'strength',
        duration_minutes: 60,
        exercises: [
          { id: '9', name: 'Dumbbell Rows', sets: 3, reps: '12-15', rest_seconds: 90, primary_muscle: 'Back' },
          { id: '10', name: 'Leg Curls', sets: 3, reps: '12-15', rest_seconds: 90, primary_muscle: 'Hamstrings' },
          { id: '11', name: 'Face Pulls', sets: 3, reps: '15-20', rest_seconds: 60, primary_muscle: 'Rear Delts' }
        ]
      });
    }

    // Sunday - Recovery (every other week)
    if (week % 2 === 0) {
      sessions.push({
        id: `session-${week}-7`,
        week,
        day: 7,
        title: 'Active Recovery',
        type: 'recovery',
        duration_minutes: 45,
        exercises: [
          { id: '12', name: 'Light Yoga', sets: 1, reps: '30 min', primary_muscle: 'Full Body' },
          { id: '13', name: 'Mobility Work', sets: 1, reps: '15 min', primary_muscle: 'Full Body' }
        ]
      });
    }
  }
  
  return sessions;
}
