const fs = require('fs');

let content = fs.readFileSync('src/store/slices/workoutSlice.ts', 'utf8');

// Fix the createWorkout function - it's incorrectly placed
// The issue is that completeWorkout code was put in createWorkout
content = content.replace(
  /createWorkout: async \(workoutData\) => \{[\s\S]*?return workout;[\s\S]*?\} catch[\s\S]*?\}\s*\},/,
  `createWorkout: async (workoutData) => {
    set({ isLoading: true, error: null });
    try {
      // Validate workout data
      const validation = safeValidateData(CreateWorkoutSchema, workoutData);
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }

      const workout = await supabaseService.createWorkout(workoutData);
      
      set(state => ({
        workouts: [workout, ...state.workouts],
        isLoading: false,
      }));
      
      return workout;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create workout',
        isLoading: false 
      });
      throw error;
    }
  },`
);

// Now find and fix the completeWorkout function
content = content.replace(
  /completeWorkout: async \(\) => \{[\s\S]*?\},\s*cancelWorkout:/,
  `completeWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) throw new Error('No active workout');

    const completedWorkout = {
      ...activeWorkout,
      status: 'completed' as const,
      completedDate: new Date(),
    };

    try {
      await supabaseService.updateWorkout(activeWorkout.id, {
        status: 'completed',
        completed_date: new Date().toISOString(),
        exercises: completedWorkout.exercises as any,
      });

      set(state => ({
        workouts: state.workouts.map(w => 
          w.id === activeWorkout.id ? completedWorkout : w
        ),
        activeWorkout: null,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to complete workout' });
      throw error;
    }
  },

  cancelWorkout:`
);

fs.writeFileSync('src/store/slices/workoutSlice.ts', content);
console.log('Fixed workoutSlice.ts');