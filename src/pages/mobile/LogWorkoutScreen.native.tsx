import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, Plus, Save, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { SetRowNative } from './components/SetRow.native';

interface WorkoutSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  rpe?: number;
  tempo?: string;
  velocity?: number;
}

export const LogWorkoutScreen: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: exercises = [] } = useExercises();

  // Create workout session on mount
  useEffect(() => {
    createWorkoutSession();
    return () => {
      // Auto-end workout on unmount if session exists
      if (sessionId) {
        endWorkout();
      }
    };
  }, []);

  const createWorkoutSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('createWorkout', {
        body: { notes: sessionNotes }
      });

      if (error) throw error;

      setSessionId(data.id);
      Alert.alert("Workout Started", "Your workout session has been created");
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert("Error", "Failed to start workout session");
    }
  };

  const addSet = () => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(36).substr(2, 9),
      exercise: '',
      weight: 0,
      reps: 0,
      rpe: undefined,
      tempo: '',
      velocity: undefined
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (id: string, field: keyof WorkoutSet, value: any) => {
    setSets(sets.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  const removeSet = (id: string) => {
    setSets(sets.filter(set => set.id !== id));
  };

  const saveAndContinue = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Save all new/updated sets
      for (const set of sets) {
        if (set.exercise && set.weight && set.reps) {
          const { error } = await supabase.functions.invoke('logSet', {
            body: {
              session_id: sessionId,
              exercise: set.exercise,
              weight: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              tempo: set.tempo,
              velocity: set.velocity
            }
          });

          if (error) throw error;
        }
      }

      Alert.alert("Sets Saved", "Your workout sets have been saved");
    } catch (error) {
      console.error('Error saving sets:', error);
      Alert.alert("Error", "Failed to save sets");
    }
    setIsLoading(false);
  };

  const endWorkout = async () => {
    if (!sessionId) {
      navigate(-1);
      return;
    }

    setIsLoading(true);
    try {
      // Save any pending sets first
      await saveAndContinue();

      // End the workout session
      const { error } = await supabase.functions.invoke('endWorkout', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      Alert.alert("Workout Ended", "Your workout has been completed");
      navigate('/');
    } catch (error) {
      console.error('Error ending workout:', error);
      Alert.alert("Error", "Failed to end workout");
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Workout</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Session Notes */}
          <View style={styles.glassCard}>
            <Text style={styles.label}>Session Notes</Text>
            <TextInput
              style={styles.textArea}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="Add any notes about your workout..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Sets List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercise Sets</Text>
            
            {sets.length === 0 ? (
              <View style={[styles.glassCard, styles.emptyState]}>
                <Text style={styles.emptyText}>No sets added yet</Text>
                <TouchableOpacity onPress={addSet} style={styles.addFirstButton}>
                  <Plus size={16} color="#000" />
                  <Text style={styles.addFirstText}>Add First Set</Text>
                </TouchableOpacity>
              </View>
            ) : (
              sets.map((set) => (
                <SetRowNative
                  key={set.id}
                  set={set}
                  exercises={exercises}
                  onUpdate={(field, value) => updateSet(set.id, field as keyof WorkoutSet, value)}
                  onRemove={() => removeSet(set.id)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={endWorkout}
            disabled={isLoading}
          >
            <Square size={16} color="#fff" />
            <Text style={styles.outlineButtonText}>End Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={saveAndContinue}
            disabled={isLoading}
          >
            <Save size={16} color="#000" />
            <Text style={styles.primaryButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>

        {/* FAB for adding sets */}
        {sets.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={addSet}>
            <Plus size={24} color="#000" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    marginLeft: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  spacer: {
    width: 64,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFirstText: {
    color: '#fff',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  outlineButtonText: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default LogWorkoutScreen;