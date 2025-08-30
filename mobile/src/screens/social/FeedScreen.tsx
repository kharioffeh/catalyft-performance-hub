/**
 * Feed Screen - Activity feed with infinite scroll and social interactions
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { ActivityPost, REACTION_EMOJIS } from '../../types/social';
import { formatRelativeTime, formatNumber, formatCalories, formatDuration } from '../../utils/formatters';
import { PostCard } from '../../components/social/PostCard';
import { ShareWorkoutModal } from '../../components/social/ShareWorkoutModal';
import { StoryBubble } from '../../components/social/StoryBubble';
import { WorkoutSummary } from '../../components/social/WorkoutSummary';
import { EngagementBar } from '../../components/social/EngagementBar';
import { mockStories } from '../../data/mockStories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  Feed: undefined;
  Profile: { userId: string };
  PostDetail: { postId: string };
  CreatePost: undefined;
  Comments: { postId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  
  const {
    activityFeed,
    feedLoading,
    feedHasMore,
    loadActivityFeed,
    loadMoreFeed,
    likePost,
    unlikePost,
    addReaction,
    removeReaction,
    shareWorkout,
    currentUser,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  useEffect(() => {
    loadInitialFeed();
  }, []);

  const loadInitialFeed = async () => {
    try {
      await loadActivityFeed(true);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivityFeed(true);
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!feedLoading && feedHasMore) {
      loadMoreFeed();
    }
  }, [feedLoading, feedHasMore]);

  const handleLike = async (post: ActivityPost) => {
    try {
      if (post.isLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      await addReaction(postId, reactionType);
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleComment = (postId: string) => {
    navigation.navigate('Comments', { postId });
  };

  const handleShare = (post: ActivityPost) => {
    if (post.type === 'workout' && post.workoutData) {
      setSelectedWorkoutId(post.workoutData.workoutId);
      setShowShareModal(true);
    } else {
      // Handle other share types
      Alert.alert('Share', 'Sharing functionality coming soon!');
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const renderPostHeader = (post: ActivityPost) => (
    <TouchableOpacity
      onPress={() => handleUserPress(post.userId)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FAFAFA',
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E0E0E0',
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F0F0F0',
      }}>
        {post.user?.profilePicture ? (
          <Image
            source={{ uri: post.user.profilePicture }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FF6B6B',
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {post.user?.fullName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: '#333' }}>
            {post.user?.fullName || 'Unknown User'}
          </Text>
          {post.user?.isVerified && (
            <Icon name="checkmark-circle" size={16} color="#4ECDC4" style={{ marginLeft: 6 }} />
          )}
        </View>
        <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
          {formatRelativeTime(post.createdAt)}
        </Text>
      </View>
      <TouchableOpacity style={{ padding: 8 }}>
        <Icon name="ellipsis-horizontal" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPostContent = (post: ActivityPost) => {
    switch (post.type) {
      case 'workout':
        return renderWorkoutPost(post);
      case 'meal':
        return renderMealPost(post);
      case 'achievement':
        return renderAchievementPost(post);
      case 'pr':
        return renderPRPost(post);
      case 'challenge':
        return renderChallengePost(post);
      default:
        return renderTextPost(post);
    }
  };

  const renderWorkoutPost = (post: ActivityPost) => (
    <View>
      {post.content && (
        <Text style={{ 
          paddingHorizontal: 16, 
          marginBottom: 12, 
          fontSize: 15, 
          lineHeight: 22,
          color: '#333',
          fontWeight: '400',
        }}>
          {post.content}
        </Text>
      )}
      
      <WorkoutSummary
        duration={post.workoutData?.duration || 0}
        exercises={post.workoutData?.exercises || 0}
        calories={post.workoutData?.caloriesBurned || 0}
        muscleGroups={post.workoutData?.muscleGroups || []}
        intensity={post.workoutData?.intensity || 'medium'}
        gradient={['#10B981', '#059669']}
        name={post.workoutData?.name}
      />
    </View>
  );

  const renderMealPost = (post: ActivityPost) => (
    <View>
      {post.content && (
        <Text style={{ 
          paddingHorizontal: 16, 
          marginBottom: 12, 
          fontSize: 15, 
          lineHeight: 22,
          color: '#333',
          fontWeight: '400',
        }}>
          {post.content}
        </Text>
      )}
      {post.images?.[0] && (
        <Image
          source={{ uri: post.images[0] }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
            resizeMode: 'cover',
          }}
        />
      )}
      <View style={{
        backgroundColor: '#F8F9FA',
        margin: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Icon name="restaurant" size={22} color="#4CAF50" />
          <Text style={{
            fontSize: 17,
            fontWeight: '600',
            marginLeft: 10,
            color: '#333',
          }}>
            {post.mealData?.name || 'Meal'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Calories</Text>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>{post.mealData?.calories || 0}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Protein</Text>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>{post.mealData?.protein || 0}g</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Carbs</Text>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>{post.mealData?.carbs || 0}g</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Fats</Text>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#333' }}>{post.mealData?.fats || 0}g</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAchievementPost = (post: ActivityPost) => {
    const rarityColors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FFD700',
    };

    return (
      <View style={{ alignItems: 'center', padding: 24 }}>
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: rarityColors[post.achievementData?.rarity || 'common'],
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <Text style={{ fontSize: 56 }}>
            {post.achievementData?.icon || '🏆'}
          </Text>
        </View>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          marginBottom: 8,
          color: '#333',
          textAlign: 'center',
        }}>
          {post.achievementData?.name || 'Achievement Unlocked!'}
        </Text>
        <Text style={{ 
          color: '#666', 
          textAlign: 'center',
          fontSize: 14,
          lineHeight: 20,
          paddingHorizontal: 20,
        }}>
          {post.achievementData?.description}
        </Text>
        {post.content && (
          <Text style={{ 
            marginTop: 16, 
            textAlign: 'center',
            fontSize: 15,
            lineHeight: 22,
            color: '#333',
            fontWeight: '400',
            paddingHorizontal: 20,
          }}>
            {post.content}
          </Text>
        )}
      </View>
    );
  };

  const renderPRPost = (post: ActivityPost) => (
    <View style={{ padding: 16 }}>
      <View style={{
        backgroundColor: '#FFD700',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
          🎉 NEW PERSONAL RECORD! 🎉
        </Text>
      </View>
      <View style={{
        backgroundColor: '#FFF9E6',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFE5B4',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          marginBottom: 12,
          color: '#333',
        }}>
          {post.prData?.exerciseName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFD700' }}>
            {post.prData?.newRecord}
          </Text>
          <Text style={{ fontSize: 18, marginLeft: 6, color: '#666' }}>
            {post.prData?.unit}
          </Text>
        </View>
        <Text style={{ color: '#666', marginTop: 12, fontSize: 14 }}>
          Previous: {post.prData?.previousRecord} {post.prData?.unit}
        </Text>
        <View style={{
          backgroundColor: '#4CAF50',
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 16,
          marginTop: 12,
        }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
            +{post.prData?.improvement}% improvement
          </Text>
        </View>
      </View>
      {post.content && (
        <Text style={{ 
          marginTop: 16,
          fontSize: 15,
          lineHeight: 22,
          color: '#333',
          fontWeight: '400',
        }}>
          {post.content}
        </Text>
      )}
    </View>
  );

  const renderChallengePost = (post: ActivityPost) => (
    <View style={{ padding: 16 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#F8F9FA',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E9ECEF',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Icon name="trophy" size={28} color="#FFD700" />
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginLeft: 12,
            flex: 1,
            color: '#333',
          }}>
            {post.challengeData?.name || 'Challenge'}
          </Text>
        </View>
        <View style={{ marginBottom: 12 }}>
          <View style={{
            height: 10,
            backgroundColor: '#E9ECEF',
            borderRadius: 5,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${post.challengeData?.progress || 0}%`,
              height: '100%',
              backgroundColor: '#4ECDC4',
              borderRadius: 5,
            }} />
          </View>
          <Text style={{ fontSize: 13, color: '#666', marginTop: 6, fontWeight: '500' }}>
            {post.challengeData?.progress || 0}% Complete
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#666', fontSize: 13, fontWeight: '500' }}>
            {post.challengeData?.participantsCount || 0} participants
          </Text>
          {post.challengeData?.rank && (
            <Text style={{ fontWeight: '600', fontSize: 13, color: '#4ECDC4' }}>
              Rank #{post.challengeData.rank}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      {post.content && (
        <Text style={{ 
          marginTop: 16,
          fontSize: 15,
          lineHeight: 22,
          color: '#333',
          fontWeight: '400',
        }}>
          {post.content}
        </Text>
      )}
    </View>
  );

  const renderTextPost = (post: ActivityPost) => (
    <View style={{ padding: 16 }}>
      <Text style={{ 
        fontSize: 15, 
        lineHeight: 22,
        color: '#333',
        fontWeight: '400',
      }}>
        {post.content}
      </Text>
      {post.images && post.images.length > 0 && (
        <View style={{ marginTop: 12 }}>
          {post.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                marginBottom: 8,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderPostActions = (post: ActivityPost) => (
    <View>
      {/* Engagement Stats */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
      }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
          {post.likesCount > 0 && (
            <>
              <Icon name="heart" size={16} color="#FF6B6B" />
              <Text style={{ marginLeft: 6, fontSize: 13, color: '#666', fontWeight: '500' }}>
                {formatNumber(post.likesCount)} likes
              </Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {post.commentsCount > 0 && (
            <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>
              {formatNumber(post.commentsCount)} comments
            </Text>
          )}
          {post.sharesCount > 0 && (
            <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>
              {formatNumber(post.sharesCount)} shares
            </Text>
          )}
        </View>
      </View>

      {/* Enhanced Engagement Bar */}
      <EngagementBar
        liked={post.isLiked || false}
        likeCount={post.likesCount}
        commentCount={post.commentsCount}
        shareCount={post.sharesCount}
        onLike={() => handleLike(post)}
        onComment={() => handleComment(post.id)}
        onShare={() => handleShare(post)}
        onDoubleTap={() => {
          if (!post.isLiked) {
            handleLike(post);
          }
        }}
      />

      {/* Reaction Picker */}
      {showReactionPicker === post.id && (
        <View style={{
          position: 'absolute',
          bottom: 60,
          left: 12,
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 8,
          flexDirection: 'row',
          gap: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleReaction(post.id, type)}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderPost = ({ item }: { item: ActivityPost }) => (
    <View style={{
      backgroundColor: 'white',
      marginBottom: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    }}>
      {renderPostHeader(item)}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          // Handle single tap if needed
        }}
        onLongPress={() => setShowReactionPicker(item.id)}
        style={{ flex: 1 }}
      >
        {renderPostContent(item)}
      </TouchableOpacity>
      {renderPostActions(item)}
    </View>
  );

  const renderFooter = () => {
    if (!feedLoading) return null;
    
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#FF6B6B" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (feedLoading) {
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 100,
        }}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={{ marginTop: 12, color: '#666' }}>Loading feed...</Text>
        </View>
      );
    }

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
      }}>
        <Icon name="newspaper-outline" size={64} color="#CCC" />
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
        }}>
          No posts yet
        </Text>
        <Text style={{
          color: '#666',
          textAlign: 'center',
          lineHeight: 20,
        }}>
          Follow other users to see their workouts and achievements in your feed!
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Discover' as any)}
          style={{
            backgroundColor: '#FF6B6B',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 24,
            marginTop: 24,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Find People to Follow
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Activity Feed</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost' as any)}
            style={{
              backgroundColor: '#FF6B6B',
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories Bar */}
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {mockStories.map(story => (
            <StoryBubble
              key={story.id}
              avatar={story.avatar}
              viewed={story.viewed}
              gradient={!story.viewed ? ['#8B5CF6', '#3B82F6'] : null}
              username={story.username}
              onPress={() => {
                // Handle story tap - could navigate to story view
                console.log('Story tapped:', story.id);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <FlatList
        ref={flatListRef}
        data={activityFeed}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B6B']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Share Workout Modal */}
      {selectedWorkoutId && (
        <ShareWorkoutModal
          visible={showShareModal}
          workoutId={selectedWorkoutId}
          onClose={() => {
            setShowShareModal(false);
            setSelectedWorkoutId(null);
          }}
          onShare={async (caption) => {
            await shareWorkout(selectedWorkoutId, caption);
            setShowShareModal(false);
            setSelectedWorkoutId(null);
          }}
        />
      )}
    </View>
  );
};