import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { Exercise, ExerciseCategory, MuscleGroup, Equipment } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ExerciseLibraryScreen() {
  const navigation = useNavigation();
  const {
    exercises,
    exercisesLoading,
    favoriteExercises,
    loadExercises,
    searchExercises,
    toggleFavoriteExercise,
    setExerciseFilters,
    exerciseSearchFilters,
  } = useWorkoutStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [selectedEquipment, setSelectedEquipment] = null;
  const [showFavorites, setShowFavorites] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadExercises();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchExercises(searchQuery);
    } else {
      loadExercises();
    }
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  const handleCategorySelect = (category: ExerciseCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setExerciseFilters({
      ...exerciseSearchFilters,
      category: selectedCategory === category ? undefined : category,
    });
  };

  const handleMuscleGroupSelect = (muscleGroup: MuscleGroup) => {
    setSelectedMuscleGroup(selectedMuscleGroup === muscleGroup ? null : muscleGroup);
    setExerciseFilters({
      ...exerciseSearchFilters,
      muscleGroup: selectedMuscleGroup === muscleGroup ? undefined : muscleGroup,
    });
  };

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(selectedEquipment === equipment ? null : equipment);
    setExerciseFilters({
      ...exerciseSearchFilters,
      equipment: selectedEquipment === equipment ? undefined : equipment,
    });
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
    setExerciseFilters({
      ...exerciseSearchFilters,
      onlyFavorites: !showFavorites,
    });
  };

  const getMuscleGroupColor = (muscleGroup: MuscleGroup) => {
    const colors = {
      chest: theme.colors.light.primary,
      back: theme.colors.light.secondary,
      legs: theme.colors.light.success,
      shoulders: theme.colors.light.warning,
      arms: theme.colors.light.error,
      core: theme.colors.light.info,
      full_body: theme.colors.light.neutral600,
    };
    return colors[muscleGroup] || theme.colors.light.neutral500;
  };

  const getEquipmentIcon = (equipment: Equipment) => {
    const icons = {
      barbell: 'barbell-outline',
      dumbbell: 'fitness-outline',
      machine: 'settings-outline',
      bodyweight: 'body-outline',
      cable: 'git-branch-outline',
      kettlebell: 'ellipse-outline',
      bands: 'resize-outline',
      equipment: 'construct-outline',
    };
    return icons[equipment] || 'fitness-outline';
  };

  const renderExerciseCard = ({ item: exercise, index }: { item: Exercise; index: number }) => {
    const isFavorite = favoriteExercises.some(fav => fav.id === exercise.id);

    return (
      <Animated.View
        style={[
          styles.exerciseCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.id })}
          activeOpacity={0.9}
        >
          {/* Exercise Image */}
          <View style={styles.imageContainer}>
            {exercise.imageUrl ? (
              <Image
                source={{ uri: exercise.imageUrl }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: getMuscleGroupColor(exercise.muscleGroup) }]}>
                <Ionicons name="fitness" size={32} color="white" />
              </View>
            )}
            
            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavoriteExercise(exercise.id)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? theme.colors.light.error : theme.colors.light.textSecondary}
              />
            </TouchableOpacity>

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={2}>
              {exercise.name}
            </Text>
            
            <View style={styles.exerciseMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="body-outline"
                  size={14}
                  color={getMuscleGroupColor(exercise.muscleGroup)}
                />
                <Text style={[styles.metaText, { color: getMuscleGroupColor(exercise.muscleGroup) }]}>
                  {exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1)}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons
                  name={getEquipmentIcon(exercise.equipment)}
                  size={14}
                  color={theme.colors.light.textSecondary}
                />
                <Text style={styles.metaText}>
                  {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.id })}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddToWorkout', { exerciseId: exercise.id })}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={styles.addButtonText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChipsContainer}
    >
      {/* Category Filters */}
      {(['strength', 'cardio', 'flexibility', 'balance'] as ExerciseCategory[]).map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.filterChip,
            selectedCategory === category && styles.filterChipActive,
          ]}
          onPress={() => handleCategorySelect(category)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedCategory === category && styles.filterChipTextActive,
            ]}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Muscle Group Filters */}
      {(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'] as MuscleGroup[]).map((muscleGroup) => (
        <TouchableOpacity
          key={muscleGroup}
          style={[
            styles.filterChip,
            selectedMuscleGroup === muscleGroup && styles.filterChipActive,
            { borderColor: getMuscleGroupColor(muscleGroup) },
          ]}
          onPress={() => handleMuscleGroupSelect(muscleGroup)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedMuscleGroup === muscleGroup && { color: getMuscleGroupColor(muscleGroup) },
            ]}
          >
            {muscleGroup.replace('_', ' ').charAt(0).toUpperCase() + muscleGroup.replace('_', ' ').slice(1)}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Equipment Filters */}
      {(['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'kettlebell', 'bands'] as Equipment[]).map((equipment) => (
        <TouchableOpacity
          key={equipment}
          style={[
            styles.filterChip,
            selectedEquipment === equipment && styles.filterChipActive,
          ]}
          onPress={() => handleEquipmentSelect(equipment)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedEquipment === equipment && styles.filterChipTextActive,
            ]}
          >
            {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="search-outline" size={64} color={theme.colors.light.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Exercises Found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or filters to find what you're looking for
      </Text>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory(null);
          setSelectedMuscleGroup(null);
          setSelectedEquipment(null);
          setShowFavorites(false);
          setExerciseFilters({});
        }}
      >
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Library</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateExercise')}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.light.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Favorites Toggle */}
        <TouchableOpacity
          style={[styles.favoritesToggle, showFavorites && styles.favoritesToggleActive]}
          onPress={toggleFavorites}
        >
          <Ionicons
            name="heart"
            size={20}
            color={showFavorites ? 'white' : theme.colors.light.error}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Exercise List */}
      <FlatList
        data={exercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exerciseList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState()}
        numColumns={1}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: theme.colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.light.text,
  },
  clearSearchButton: {
    padding: 4,
  },
  favoritesToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.light.error,
  },
  favoritesToggleActive: {
    backgroundColor: theme.colors.light.error,
  },
  filterChipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.light.primary + '20',
    borderColor: theme.colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.light.primary,
    fontWeight: '600',
  },
  exerciseList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  exerciseCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 20,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  cardContent: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  exerciseInfo: {
    padding: 20,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 12,
    lineHeight: 26,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.light.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.light.border,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.light.text,
  },
  addButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 16,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});