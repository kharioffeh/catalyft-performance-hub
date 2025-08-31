/**
 * Privacy-filtered post component that respects user privacy settings
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityPost, UserProfile } from '../../types/social';
import { formatCalories, formatDuration } from '../../utils/formatters';
import { usePrivacyCheck } from './PrivacyAwareContent';

interface PrivacyFilteredPostProps {
  post: ActivityPost;
  userProfile: UserProfile;
  currentUserId?: string;
  isFollowing?: boolean;
}

export const PrivacyFilteredPost: React.FC<PrivacyFilteredPostProps> = ({
  post,
  userProfile,
  currentUserId,
  isFollowing = false,
}) => {
  const privacySettings = userProfile.privacySettings;
  
  // Check various privacy settings
  const canShowWorkoutDetails = usePrivacyCheck(
    userProfile,
    'showWorkoutDetails',
    currentUserId,
    isFollowing
  );
  
  const canShowCalories = usePrivacyCheck(
    userProfile,
    'shareCaloriesBurned',
    currentUserId,
    isFollowing
  );
  
  const canShowDuration = usePrivacyCheck(
    userProfile,
    'shareDuration',
    currentUserId,
    isFollowing
  );
  
  const canShowExerciseDetails = usePrivacyCheck(
    userProfile,
    'shareExerciseDetails',
    currentUserId,
    isFollowing
  );
  
  const canShowNutritionDetails = usePrivacyCheck(
    userProfile,
    'showNutritionDetails',
    currentUserId,
    isFollowing
  );
  
  const canShowMacros = usePrivacyCheck(
    userProfile,
    'shareMacros',
    currentUserId,
    isFollowing
  );
  
  const canShowCalorieIntake = usePrivacyCheck(
    userProfile,
    'shareCalorieIntake',
    currentUserId,
    isFollowing
  );

  // Render workout post with privacy filtering
  if (post.type === 'workout' && post.workoutData) {
    if (!canShowWorkoutDetails) {
      return (
        <View style={{
          padding: 16,
          backgroundColor: '#F5F5F5',
          borderRadius: 8,
          margin: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="lock-closed" size={20} color="#999" />
            <Text style={{ marginLeft: 8, color: '#999' }}>
              Workout details are private
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        padding: 16,
        margin: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="barbell" size={24} color="white" />
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            marginLeft: 8,
          }}>
            {post.workoutData.name || 'Workout'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {canShowDuration && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                Duration
              </Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {formatDuration(post.workoutData.duration)}
              </Text>
            </View>
          )}
          
          {canShowExerciseDetails && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                Exercises
              </Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {post.workoutData.exercises}
              </Text>
            </View>
          )}
          
          {canShowCalories && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                Calories
              </Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {formatCalories(post.workoutData.caloriesBurned)}
              </Text>
            </View>
          )}
        </View>
        
        {!canShowDuration && !canShowExerciseDetails && !canShowCalories && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
            Completed a workout
          </Text>
        )}
      </View>
    );
  }

  // Render meal post with privacy filtering
  if (post.type === 'meal' && post.mealData) {
    if (!canShowNutritionDetails) {
      return (
        <View style={{
          padding: 16,
          backgroundColor: '#F5F5F5',
          borderRadius: 8,
          margin: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="restaurant" size={20} color="#999" />
            <Text style={{ marginLeft: 8, color: '#999' }}>
              Had a meal
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{
        backgroundColor: '#F5F5F5',
        margin: 12,
        borderRadius: 12,
        padding: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="restaurant" size={20} color="#4CAF50" />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
          }}>
            {post.mealData.name || 'Meal'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {canShowCalorieIntake && (
            <View>
              <Text style={{ color: '#666', fontSize: 12 }}>Calories</Text>
              <Text style={{ fontWeight: '600' }}>{post.mealData.calories}</Text>
            </View>
          )}
          
          {canShowMacros && (
            <>
              <View>
                <Text style={{ color: '#666', fontSize: 12 }}>Protein</Text>
                <Text style={{ fontWeight: '600' }}>{post.mealData.protein}g</Text>
              </View>
              <View>
                <Text style={{ color: '#666', fontSize: 12 }}>Carbs</Text>
                <Text style={{ fontWeight: '600' }}>{post.mealData.carbs}g</Text>
              </View>
              <View>
                <Text style={{ color: '#666', fontSize: 12 }}>Fats</Text>
                <Text style={{ fontWeight: '600' }}>{post.mealData.fats}g</Text>
              </View>
            </>
          )}
        </View>
        
        {!canShowCalorieIntake && !canShowMacros && (
          <Text style={{ color: '#666' }}>
            Nutrition details are private
          </Text>
        )}
      </View>
    );
  }

  // For other post types, return as is
  return null;
};

// Privacy indicator component
export const PrivacyIndicator: React.FC<{ 
  visibility: 'public' | 'followers' | 'private' 
}> = ({ visibility }) => {
  const getIcon = () => {
    switch (visibility) {
      case 'public':
        return 'earth';
      case 'followers':
        return 'people';
      case 'private':
        return 'lock-closed';
    }
  };

  const getColor = () => {
    switch (visibility) {
      case 'public':
        return '#4CAF50';
      case 'followers':
        return '#FF9800';
      case 'private':
        return '#F44336';
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
    }}>
      <Ionicons name={getIcon()} size={12} color={getColor()} />
      <Text style={{
        marginLeft: 4,
        fontSize: 10,
        color: getColor(),
        fontWeight: '600',
      }}>
        {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
      </Text>
    </View>
  );
};