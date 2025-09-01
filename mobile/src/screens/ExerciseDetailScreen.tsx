import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { Exercise, PersonalRecord } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseId } = route.params as { exerciseId: string };
  
  const {
    exercises,
    personalRecords,
    favoriteExercises,
    toggleFavoriteExercise,
    addExerciseToWorkout,
    currentWorkout,
  } = useWorkoutStore();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [imageScale] = useState(new Animated.Value(1));

  useEffect(() => {
    if (exerciseId && exercises.length > 0) {
      const foundExercise = exercises.find(ex => ex.id === exerciseId);
      if (foundExercise) {
        setExercise(foundExercise);
        setIsFavorite(favoriteExercises.some(fav => fav.id === exerciseId));
        
        // Find personal record
        const record = personalRecords.find(pr => pr.exerciseId === exerciseId);
        setPersonalRecord(record || null);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [exerciseId, exercises, favoriteExercises, personalRecords]);

  const handleFavoriteToggle = async () => {
    if (exercise) {
      await toggleFavoriteExercise(exercise.id);
      setIsFavorite(!isFavorite);
    }
  };

  const handleShare = async () => {
    if (exercise) {
      try {
        await Share.share({
          message: `Check out this exercise: ${exercise.name} - ${exercise.muscleGroup} workout`,
          title: exercise.name,
        });
      } catch (error) {
        console.error('Error sharing exercise:', error);
      }
    }
  };

  const handleAddToWorkout = async () => {
    if (exercise && currentWorkout) {
      try {
        await addExerciseToWorkout(exercise);
        Alert.alert(
          'Exercise Added',
          `${exercise.name} has been added to your current workout!`,
          [{ text: 'OK' }]
        );
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to add exercise to workout');
      }
    } else if (exercise) {
      // Start new workout
      navigation.navigate('CreateWorkout');
    }
  };

  const handleStartWorkout = () => {
    if (exercise) {
      navigation.navigate('CreateWorkout');
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors = {
      chest: theme.colors.light.primary,
      back: theme.colors.light.secondary,
      legs: theme.colors.light.success,
      shoulders: theme.colors.light.warning,
      arms: theme.colors.light.error,
      core: theme.colors.light.info,
      full_body: theme.colors.light.neutral.slate,
    };
    return colors[muscleGroup as keyof typeof colors] || theme.colors.light.neutral.slate;
  };

  const getEquipmentIcon = (equipment: string): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      barbell: 'barbell-outline',
      dumbbell: 'fitness-outline',
      machine: 'settings-outline',
      bodyweight: 'body-outline',
      cable: 'git-branch-outline',
      kettlebell: 'ellipse-outline',
      bands: 'resize-outline',
      equipment: 'construct-outline',
    };
    return icons[equipment as keyof typeof icons] || 'fitness-outline';
  };

  const renderHeroImage = () => (
    <View style={styles.heroContainer}>
      {exercise?.imageUrl ? (
        <Animated.Image
          source={{ uri: exercise.imageUrl }}
          style={[styles.heroImage, { transform: [{ scale: imageScale }] }]}
          resizeMode="cover"
        />
      ) : (
        <Animated.View
          style={[
            styles.heroPlaceholder,
            {
              backgroundColor: exercise ? getMuscleGroupColor(exercise.muscleGroup) : theme.colors.light.neutral.slate,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <Ionicons name="fitness" size={64} color="white" />
        </Animated.View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonBackground}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.heroActions}>
        <TouchableOpacity
          style={styles.heroActionButton}
          onPress={handleFavoriteToggle}
        >
          <View style={styles.heroActionBackground}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? theme.colors.light.error : 'white'}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heroActionButton}
          onPress={handleShare}
        >
          <View style={styles.heroActionBackground}>
            <Ionicons name="share-outline" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );

  const renderExerciseInfo = () => (
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{exercise?.name}</Text>
      
      <View style={styles.exerciseMeta}>
        <View style={styles.metaItem}>
          <Ionicons
            name="body-outline"
            size={16}
            color={exercise ? getMuscleGroupColor(exercise.muscleGroup) : theme.colors.light.textSecondary}
          />
          <Text style={[styles.metaText, { color: exercise ? getMuscleGroupColor(exercise.muscleGroup) : theme.colors.light.textSecondary }]}>
            {exercise?.muscleGroup ? exercise.muscleGroup.replace('_', ' ').charAt(0).toUpperCase() + exercise.muscleGroup.replace('_', ' ').slice(1) : 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons
            name={exercise ? getEquipmentIcon(exercise.equipment) : 'fitness-outline'}
            size={16}
            color={theme.colors.light.textSecondary}
          />
          <Text style={styles.metaText}>
            {exercise?.equipment ? exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1) : 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="fitness-outline" size={16} color={theme.colors.light.textSecondary} />
          <Text style={styles.metaText}>
            {exercise?.category ? exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1) : 'Unknown'}
          </Text>
        </View>
      </View>

      {exercise?.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>{exercise.instructions}</Text>
        </View>
      )}
    </View>
  );

  const renderPersonalRecord = () => {
    if (!personalRecord) return null;

    return (
      <View style={styles.prContainer}>
        <LinearGradient
          colors={theme.gradients.success}
          style={styles.prGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.prContent}>
            <View style={styles.prIcon}>
              <Ionicons name="trophy" size={24} color="white" />
            </View>
            <View style={styles.prInfo}>
              <Text style={styles.prTitle}>Personal Record</Text>
              <Text style={styles.prDetails}>
                {personalRecord.weight}kg × {personalRecord.reps} reps
              </Text>
              <Text style={styles.prDate}>
                {new Date(personalRecord.achievedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderRecommendedSets = () => (
    <View style={styles.setsContainer}>
      <Text style={styles.setsTitle}>Recommended Sets</Text>
      
      <View style={styles.setsGrid}>
        {[
          { sets: 3, reps: '8-12', weight: '70-80% 1RM', rest: '90s' },
          { sets: 4, reps: '6-8', weight: '80-85% 1RM', rest: '120s' },
          { sets: 5, reps: '4-6', weight: '85-90% 1RM', rest: '180s' },
        ].map((set, index) => (
          <View key={index} style={styles.setCard}>
            <View style={styles.setHeader}>
              <Text style={styles.setNumber}>Set {index + 1}</Text>
              <View style={styles.setType}>
                <Text style={styles.setTypeText}>Strength</Text>
              </View>
            </View>
            
            <View style={styles.setDetails}>
              <View style={styles.setDetail}>
                <Text style={styles.setDetailLabel}>Sets</Text>
                <Text style={styles.setDetailValue}>{set.sets}</Text>
              </View>
              
              <View style={styles.setDetail}>
                <Text style={styles.setDetailLabel}>Reps</Text>
                <Text style={styles.setDetailValue}>{set.reps}</Text>
              </View>
              
              <View style={styles.setDetail}>
                <Text style={styles.setDetailLabel}>Weight</Text>
                <Text style={styles.setDetailValue}>{set.weight}</Text>
              </View>
              
              <View style={styles.setDetail}>
                <Text style={styles.setDetailLabel}>Rest</Text>
                <Text style={styles.setDetailValue}>{set.rest}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRelatedExercises = () => (
    <View style={styles.relatedContainer}>
      <Text style={styles.relatedTitle}>Related Exercises</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.relatedScroll}
      >
        {exercises
          .filter(ex => ex.muscleGroup === exercise?.muscleGroup && ex.id !== exercise?.id)
          .slice(0, 5)
          .map((relatedExercise) => (
            <TouchableOpacity
              key={relatedExercise.id}
              style={styles.relatedCard}
              onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: relatedExercise.id })}
            >
              {relatedExercise.imageUrl ? (
                <Image
                  source={{ uri: relatedExercise.imageUrl }}
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.relatedPlaceholder, { backgroundColor: getMuscleGroupColor(relatedExercise.muscleGroup) }]}>
                  <Ionicons name="fitness" size={24} color="white" />
                </View>
              )}
              <Text style={styles.relatedName} numberOfLines={2}>
                {relatedExercise.name}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );

  if (!exercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading exercise...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {renderHeroImage()}

        {/* Exercise Info */}
        {renderExerciseInfo()}

        {/* Personal Record */}
        {renderPersonalRecord()}

        {/* Recommended Sets */}
        {renderRecommendedSets()}

        {/* Related Exercises */}
        {renderRelatedExercises()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={currentWorkout ? handleAddToWorkout : handleStartWorkout}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.ctaButtonText}>
              {currentWorkout ? 'Add to Workout' : 'Start Workout'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    position: 'relative',
    height: height * 0.4,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActions: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    gap: 12,
  },
  heroActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  heroActionBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  exerciseInfo: {
    padding: 20,
    backgroundColor: theme.colors.light.background,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
    lineHeight: 34,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 16,
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: theme.colors.light.textSecondary,
    lineHeight: 24,
  },
  prContainer: {
    margin: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  prGradient: {
    borderRadius: 20,
    padding: 20,
  },
  prContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  prIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prInfo: {
    flex: 1,
  },
  prTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  prDetails: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 2,
  },
  prDate: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  setsContainer: {
    margin: 20,
  },
  setsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
  },
  setsGrid: {
    gap: 16,
  },
  setCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  setType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.light.primary + '20',
    borderRadius: 12,
  },
  setTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.light.primary,
    textTransform: 'uppercase',
  },
  setDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setDetail: {
    alignItems: 'center',
    flex: 1,
  },
  setDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.light.textSecondary,
    marginBottom: 4,
  },
  setDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.light.text,
  },
  relatedContainer: {
    margin: 20,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
  },
  relatedScroll: {
    paddingRight: 20,
  },
  relatedCard: {
    width: 140,
    marginRight: 16,
  },
  relatedImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedPlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.light.text,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 20,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: theme.colors.light.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
  },
  ctaButton: {
    borderRadius: 16,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  gradientButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.light.textSecondary,
  },
});