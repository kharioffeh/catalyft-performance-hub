import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WorkoutSummaryProps {
  duration: number;
  exercises: number;
  calories: number;
  muscleGroups?: string[];
  intensity?: 'low' | 'medium' | 'high';
  gradient?: string[];
  name?: string;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  duration,
  exercises,
  calories,
  muscleGroups = [],
  intensity = 'medium',
  gradient = ['#10B981', '#059669'],
  name,
}) => {
  const getIntensityColor = () => {
    switch (intensity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const getIntensityIcon = () => {
    switch (intensity) {
      case 'high':
        return 'flame';
      case 'medium':
        return 'flash';
      default:
        return 'leaf';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCalories = (cal: number) => {
    if (cal >= 1000) {
      return `${(cal / 1000).toFixed(1)}k`;
    }
    return cal.toString();
  };

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      {name && (
        <View style={styles.header}>
          <Icon name="barbell" size={24} color="white" />
          <Text style={styles.workoutName}>{name}</Text>
          <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor() }]}>
            <Icon name={getIntensityIcon()} size={12} color="white" />
            <Text style={styles.intensityText}>{intensity.toUpperCase()}</Text>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Icon name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="fitness-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>{exercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="flame-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.statValue}>{formatCalories(calories)}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      {/* Muscle Groups */}
      {muscleGroups.length > 0 && (
        <View style={styles.muscleGroupsContainer}>
          <Text style={styles.muscleGroupsLabel}>Targeted Muscles</Text>
          <View style={styles.muscleGroupsGrid}>
            {muscleGroups.slice(0, 6).map((muscle, index) => (
              <View key={index} style={styles.muscleTag}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </View>
            ))}
            {muscleGroups.length > 6 && (
              <View style={styles.muscleTag}>
                <Text style={styles.muscleText}>+{muscleGroups.length - 6}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  workoutName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  intensityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  muscleGroupsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  muscleGroupsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  muscleGroupsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
});