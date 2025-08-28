import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityPost } from '../../types/social';
import { formatRelativeTime, formatNumber, formatDuration } from '../../utils/formatters';
import { PrivacyFilteredPost } from './PrivacyFilteredPost';

interface PostCardProps {
  post: ActivityPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onProfilePress: (userId: string) => void;
  onReaction?: (postId: string, reaction: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onProfilePress,
  onReaction,
  showActions = true,
  compact = false,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const REACTION_EMOJIS: { [key: string]: string } = {
    love: '❤️',
    fire: '🔥',
    muscle: '💪',
    clap: '👏',
    mindblown: '🤯',
  };

  const renderPostHeader = () => (
    <TouchableOpacity
      style={styles.header}
      onPress={() => onProfilePress(post.userId)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: post.userProfile?.profilePicture || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <View style={styles.headerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>
            {post.userProfile?.fullName || post.userProfile?.username || 'Unknown User'}
          </Text>
          {post.userProfile?.isVerified && (
            <Icon name="checkmark-circle" size={14} color="#4CAF50" />
          )}
        </View>
        <Text style={styles.timestamp}>{formatRelativeTime(post.createdAt)}</Text>
      </View>
      {post.visibility === 'private' && (
        <Icon name="lock-closed" size={16} color="#999" />
      )}
    </TouchableOpacity>
  );

  const renderWorkoutPost = () => {
    if (!post.workoutData) return null;
    
    return (
      <LinearGradient
        colors={['#4CAF50', '#45B545']}
        style={styles.workoutCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.workoutHeader}>
          <Icon name="fitness" size={24} color="white" />
          <Text style={styles.workoutTitle}>{post.workoutData.name}</Text>
        </View>
        
        <View style={styles.workoutStats}>
          <View style={styles.workoutStat}>
            <Icon name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.workoutStatText}>
              {formatDuration(post.workoutData.duration)}
            </Text>
          </View>
          <View style={styles.workoutStat}>
            <Icon name="flame-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.workoutStatText}>
              {post.workoutData.caloriesBurned} cal
            </Text>
          </View>
          <View style={styles.workoutStat}>
            <Icon name="barbell-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.workoutStatText}>
              {post.workoutData.exercises} exercises
            </Text>
          </View>
        </View>

        {post.workoutData.muscleGroups && post.workoutData.muscleGroups.length > 0 && (
          <View style={styles.muscleGroups}>
            {post.workoutData.muscleGroups.map((group, index) => (
              <View key={index} style={styles.muscleGroupChip}>
                <Text style={styles.muscleGroupText}>{group}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    );
  };

  const renderMealPost = () => {
    if (!post.mealData) return null;

    return (
      <View style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <Icon name="restaurant" size={20} color="#FF6B6B" />
          <Text style={styles.mealTitle}>{post.mealData.name}</Text>
          <Text style={styles.mealType}>{post.mealData.mealType}</Text>
        </View>

        <View style={styles.macros}>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{post.mealData.calories}</Text>
            <Text style={styles.macroLabel}>Calories</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{post.mealData.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{post.mealData.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{post.mealData.fats}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAchievementPost = () => {
    if (!post.achievementData) return null;

    const rarityColors: { [key: string]: string[] } = {
      common: ['#9E9E9E', '#757575'],
      rare: ['#2196F3', '#1976D2'],
      epic: ['#9C27B0', '#7B1FA2'],
      legendary: ['#FFD700', '#FFC107'],
    };

    return (
      <LinearGradient
        colors={rarityColors[post.achievementData.rarity] || rarityColors.common}
        style={styles.achievementCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.achievementIcon}>{post.achievementData.icon || '🏆'}</Text>
        <Text style={styles.achievementName}>{post.achievementData.name}</Text>
        <Text style={styles.achievementDescription}>{post.achievementData.description}</Text>
        <Text style={styles.achievementRarity}>
          {post.achievementData.rarity.toUpperCase()}
        </Text>
      </LinearGradient>
    );
  };

  const renderPRPost = () => {
    if (!post.prData) return null;

    const improvement = post.prData.improvement || 
      ((post.prData.newRecord - post.prData.previousRecord) / post.prData.previousRecord * 100);

    return (
      <View style={styles.prCard}>
        <View style={styles.prHeader}>
          <Icon name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.prTitle}>New Personal Record!</Text>
        </View>
        
        <Text style={styles.prExercise}>{post.prData.exerciseName}</Text>
        
        <View style={styles.prStats}>
          <View style={styles.prStat}>
            <Text style={styles.prOldValue}>{post.prData.previousRecord}</Text>
            <Text style={styles.prLabel}>Previous</Text>
          </View>
          
          <Icon name="arrow-forward" size={24} color="#4CAF50" />
          
          <View style={styles.prStat}>
            <Text style={styles.prNewValue}>{post.prData.newRecord}</Text>
            <Text style={styles.prLabel}>New PR</Text>
          </View>
        </View>
        
        <View style={styles.prImprovement}>
          <Icon name="arrow-up" size={16} color="#4CAF50" />
          <Text style={styles.prImprovementText}>
            {improvement.toFixed(1)}% improvement
          </Text>
        </View>
      </View>
    );
  };

  const renderChallengePost = () => {
    if (!post.challengeData) return null;

    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Icon name="trophy" size={20} color="#FFD700" />
          <Text style={styles.challengeTitle}>{post.challengeData.name}</Text>
        </View>
        
        <Text style={styles.challengeAction}>
          {post.challengeData.action || 'Joined challenge'}
        </Text>
        
        {post.challengeData.progress !== undefined && (
          <View style={styles.challengeProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{post.challengeData.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${post.challengeData.progress}%` }
                ]}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPostContent = () => {
    return (
      <View style={styles.content}>
        {post.content && (
          <Text style={styles.postText}>{post.content}</Text>
        )}

        {/* Render type-specific content with privacy filtering */}
        <PrivacyFilteredPost post={post} userProfile={post.userProfile} />

        {/* Render images if any */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[
                  styles.postImage,
                  post.images!.length === 1 && styles.singleImage,
                ]}
                onError={() => setImageError(true)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEngagement = () => {
    if (!showActions) return null;

    return (
      <View style={styles.engagement}>
        {/* Engagement Stats */}
        <View style={styles.engagementStats}>
          {post.likesCount > 0 && (
            <Text style={styles.statText}>
              {formatNumber(post.likesCount)} likes
            </Text>
          )}
          {post.commentsCount > 0 && (
            <Text style={styles.statText}>
              {formatNumber(post.commentsCount)} comments
            </Text>
          )}
          {post.sharesCount > 0 && (
            <Text style={styles.statText}>
              {formatNumber(post.sharesCount)} shares
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(post.id)}
            onLongPress={() => setShowReactions(!showReactions)}
          >
            <Icon
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={post.isLiked ? '#FF6B6B' : '#666'}
            />
            <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(post.id)}
          >
            <Icon name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(post.id)}
          >
            <Icon name="share-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Reaction Picker */}
        {showReactions && onReaction && (
          <View style={styles.reactionPicker}>
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <TouchableOpacity
                key={type}
                style={styles.reactionButton}
                onPress={() => {
                  onReaction(post.id, type);
                  setShowReactions(false);
                }}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {renderPostHeader()}
      {renderPostContent()}
      {renderEngagement()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    marginBottom: 4,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  postImage: {
    width: (screenWidth - 32) / 2,
    height: 200,
    borderRadius: 8,
  },
  singleImage: {
    width: screenWidth - 24,
    height: 300,
  },
  workoutCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  muscleGroupChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleGroupText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  mealCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macro: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  achievementCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  achievementIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementRarity: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 8,
  },
  prExercise: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  prStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  prStat: {
    alignItems: 'center',
  },
  prOldValue: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  prNewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  prLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  prImprovement: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  prImprovementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  challengeCard: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  challengeAction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  challengeProgress: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  engagement: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  engagementStats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  likedText: {
    color: '#FF6B6B',
  },
  reactionPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  reactionButton: {
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 24,
  },
});