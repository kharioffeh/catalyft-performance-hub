import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { PlannedWorkout, PlannedExercise } from '../../types/ai';

interface WorkoutCardProps {
  workout: PlannedWorkout;
  onStart: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onStart }) => {
  const getTotalSets = () => {
    return workout.exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  const getMuscleGroups = () => {
    // This would be determined from exercise data
    return ['Chest', 'Triceps', 'Shoulders'];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>{workout.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Icon name="time-outline" size={16} color="#fff" />
              <Text style={styles.statText}>{workout.estimatedDuration} min</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="fitness-outline" size={16} color="#fff" />
              <Text style={styles.statText}>{getTotalSets()} sets</Text>
            </View>
            {workout.targetRPE && (
              <View style={styles.stat}>
                <Icon name="speedometer-outline" size={16} color="#fff" />
                <Text style={styles.statText}>RPE {workout.targetRPE}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.muscleGroups}>
        {getMuscleGroups().map((muscle, index) => (
          <View key={index} style={styles.muscleTag}>
            <Text style={styles.muscleText}>{muscle}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        {workout.exercises.map((exercise, index) => (
          <View key={exercise.exerciseId} style={styles.exerciseItem}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseInfo}>
                {exercise.sets} sets × {exercise.reps} reps
                {exercise.weight && ` @ ${exercise.weight}`}
              </Text>
              {exercise.notes && (
                <Text style={styles.exerciseNote}>{exercise.notes}</Text>
              )}
            </View>
            {exercise.alternatives && exercise.alternatives.length > 0 && (
              <TouchableOpacity style={styles.alternativeButton}>
                <Icon name="swap-horizontal" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {workout.warmup && (
        <View style={styles.additionalInfo}>
          <Icon name="flame-outline" size={16} color="#666" />
          <Text style={styles.additionalText}>
            {workout.warmup.duration} min warm-up included
          </Text>
        </View>
      )}

      {workout.cooldown && (
        <View style={styles.additionalInfo}>
          <Icon name="snow-outline" size={16} color="#666" />
          <Text style={styles.additionalText}>
            {workout.cooldown.duration} min cool-down included
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <LinearGradient
          colors={['#00C851', '#00A846']}
          style={styles.startButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 320,
  },
  header: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  muscleTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  muscleText: {
    fontSize: 12,
    color: '#666',
  },
  exerciseList: {
    maxHeight: 200,
    padding: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseInfo: {
    fontSize: 12,
    color: '#666',
  },
  exerciseNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  alternativeButton: {
    padding: 5,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  additionalText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  startButton: {
    margin: 10,
  },
  startButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WorkoutCard;