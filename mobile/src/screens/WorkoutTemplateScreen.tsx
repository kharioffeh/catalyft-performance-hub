import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { WorkoutTemplate, Exercise } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WorkoutTemplateScreen() {
  const navigation = useNavigation();
  const { templates, loadTemplates, createTemplate, deleteWorkout, startWorkoutFromTemplate } = useWorkoutStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadTemplates();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  }, [searchQuery, templates]);

  const handleCreateTemplate = () => {
    navigation.navigate('CreateTemplate');
  };

  const handleUseTemplate = async (template: WorkoutTemplate) => {
    try {
      await startWorkoutFromTemplate(template.id);
      navigation.navigate('ActiveWorkout');
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout from template');
    }
  };

  const handleEditTemplate = (template: WorkoutTemplate) => {
    navigation.navigate('EditTemplate', { templateId: template.id });
  };

  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(template.id);
              Alert.alert('Success', 'Template deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const handleDuplicateTemplate = (template: WorkoutTemplate) => {
    navigation.navigate('CreateTemplate', { duplicateFrom: template });
  };

  const getMuscleGroupColor = (category: string) => {
    const colors = {
      'push': theme.colors.light.primary,
      'pull': theme.colors.light.secondary,
      'legs': theme.colors.light.success,
      'upper': theme.colors.light.warning,
      'lower': theme.colors.light.error,
      'full_body': theme.colors.light.info,
      'custom': theme.colors.light.neutral600,
    };
    return colors[category as keyof typeof colors] || theme.colors.light.neutral500;
  };

  const renderTemplateCard = ({ item: template, index }: { item: WorkoutTemplate; index: number }) => (
    <Animated.View
      style={[
        styles.templateCard,
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
      <View style={styles.cardHeader}>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName} numberOfLines={2}>
            {template.name}
          </Text>
          {template.description && (
            <Text style={styles.templateDescription} numberOfLines={2}>
              {template.description}
            </Text>
          )}
        </View>
        
        <View style={styles.templateMeta}>
          {template.category && (
            <View style={[
              styles.categoryBadge,
              { backgroundColor: getMuscleGroupColor(template.category) + '20' }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: getMuscleGroupColor(template.category) }
              ]}>
                {template.category.toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="fitness-outline" size={16} color={theme.colors.light.textSecondary} />
              <Text style={styles.statText}>{template.exercises.length}</Text>
            </View>
            
            {template.usageCount && (
              <View style={styles.stat}>
                <Ionicons name="play-outline" size={16} color={theme.colors.light.textSecondary} />
                <Text style={styles.statText}>{template.usageCount}</Text>
              </View>
            )}
            
            {template.rating && (
              <View style={styles.stat}>
                <Ionicons name="star" size={16} color={theme.colors.light.warning} />
                <Text style={styles.statText}>{template.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Exercise Preview */}
      <View style={styles.exercisePreview}>
        <Text style={styles.exercisePreviewTitle}>Exercises:</Text>
        <View style={styles.exerciseList}>
          {template.exercises.slice(0, 3).map((exercise, idx) => (
            <View key={idx} style={styles.exerciseItem}>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {exercise.exercise?.name || `Exercise ${idx + 1}`}
              </Text>
              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.reps} reps
              </Text>
            </View>
          ))}
          {template.exercises.length > 3 && (
            <Text style={styles.moreExercises}>
              +{template.exercises.length - 3} more
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleUseTemplate(template)}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play" size={16} color="white" />
            <Text style={styles.primaryButtonText}>Use Template</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleEditTemplate(template)}
          >
            <Ionicons name="create-outline" size={16} color={theme.colors.light.primary} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.light.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleDuplicateTemplate(template)}
          >
            <Ionicons name="copy-outline" size={16} color={theme.colors.light.secondary} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.light.secondary }]}>
              Duplicate
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleDeleteTemplate(template)}
          >
            <Ionicons name="trash-outline" size={16} color={theme.colors.light.error} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.light.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="bookmark-outline" size={64} color={theme.colors.light.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Templates Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first workout template to save time and stay consistent
      </Text>
      <TouchableOpacity
        style={styles.createTemplateButton}
        onPress={handleCreateTemplate}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createTemplateButtonText}>Create Template</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Templates</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTemplate}
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
            placeholder="Search templates..."
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
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.templateList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState()}
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
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
  templateList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  templateCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  templateInfo: {
    flex: 1,
    marginRight: 16,
  },
  templateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.colors.light.textSecondary,
    lineHeight: 20,
  },
  templateMeta: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.light.text,
  },
  exercisePreview: {
    marginBottom: 20,
  },
  exercisePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.light.text,
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 12,
    color: theme.colors.light.textSecondary,
  },
  moreExercises: {
    fontSize: 12,
    color: theme.colors.light.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 8,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.light.backgroundSecondary,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  createTemplateButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  createTemplateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});