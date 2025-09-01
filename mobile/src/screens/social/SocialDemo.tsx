/**
 * Social Features Demo
 * Interactive demonstration of all social features
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store';
import { PostCard, UserAvatar, ShareWorkoutModal } from '../../components/social';
import { realtimeSocial } from '../../services/realtimeSocial';
import { mockDataGenerators } from '../../utils/socialTestUtils';

export const SocialDemo: React.FC = () => {
  const [demoStep, setDemoStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const {
    currentUserProfile,
    activityFeed,
    createPost,
    likePost,
    followUser,
    joinChallenge,
    loadActivityFeed,
  } = useStore();

  // Demo data
  const mockWorkout = {
    id: 'workout-1',
    name: 'Morning HIIT Session',
    duration: 45,
    caloriesBurned: 450,
    exercises: 8,
    muscleGroups: ['Core', 'Cardio', 'Full Body'],
  };

  const demoSteps = [
    {
      title: '1. User Profiles & Privacy',
      description: 'View profiles with privacy-aware content filtering',
      icon: 'person-circle',
      color: '#4CAF50',
    },
    {
      title: '2. Activity Feed',
      description: 'Share workouts, meals, achievements, and PRs',
      icon: 'newspaper',
      color: '#2196F3',
    },
    {
      title: '3. Social Interactions',
      description: 'Like, comment, react, and share posts',
      icon: 'heart',
      color: '#FF6B6B',
    },
    {
      title: '4. Challenges & Gamification',
      description: 'Join challenges, earn achievements, climb leaderboards',
      icon: 'trophy',
      color: '#FFD700',
    },
    {
      title: '5. Real-time Updates',
      description: 'Live feed updates, notifications, and presence',
      icon: 'pulse',
      color: '#9C27B0',
    },
    {
      title: '6. Discovery & Search',
      description: 'Find users, explore trending content',
      icon: 'search',
      color: '#FF9800',
    },
  ];

  useEffect(() => {
    // Initialize demo
    initializeDemo();
    
    // Set up real-time subscriptions
    const unsubscribe = setupRealtimeDemo();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const initializeDemo = async () => {
    setIsLoading(true);
    try {
      // Load initial feed
      await loadActivityFeed();
      
      // Create some mock data if feed is empty
      if (activityFeed.length === 0) {
        await createMockPosts();
      }
    } catch (error) {
      console.error('Demo initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMockPosts = async () => {
    // Create sample posts
    const mockPosts = [
      mockDataGenerators.createMockActivityPosts(1)[0],
      mockDataGenerators.createMockActivityPosts(1)[0],
      mockDataGenerators.createMockActivityPosts(1)[0],
    ];

    for (const post of mockPosts) {
      await createPost(post);
    }
  };

  const setupRealtimeDemo = () => {
    // Subscribe to real-time feed updates
    const unsubscribeFeed = realtimeSocial.subscribeFeedUpdates(
      currentUserProfile?.userId || '',
      (newPost) => {
        console.log('New post received:', newPost);
        Alert.alert('Real-time Update', 'New post added to feed!');
      },
      (updatedPost) => {
        console.log('Post updated:', updatedPost);
      },
      (deletedPostId) => {
        console.log('Post deleted:', deletedPostId);
      }
    );

    // Subscribe to notifications
    const unsubscribeNotifications = realtimeSocial.subscribeNotifications(
      currentUserProfile?.userId || '',
      (notification) => {
        Alert.alert(
          'New Notification',
          notification.message,
          [{ text: 'OK' }]
        );
      }
    );

    // Update connection status
    setRealtimeStatus('connected');

    return () => {
      unsubscribeFeed();
      unsubscribeNotifications();
      setRealtimeStatus('disconnected');
    };
  };

  const runDemoStep = async (step: number) => {
    setDemoStep(step);
    
    switch (step) {
      case 0:
        Alert.alert(
          'User Profiles Demo',
          'Profiles respect privacy settings. Users control what data is shared.',
          [{ text: 'View Example', onPress: () => navigateToProfile() }]
        );
        break;
        
      case 1:
        Alert.alert(
          'Activity Feed Demo',
          'The feed shows various post types with privacy filtering.',
          [{ text: 'Create Post', onPress: () => setShowShareModal(true) }]
        );
        break;
        
      case 2:
        Alert.alert(
          'Social Interactions Demo',
          'Users can engage with posts through likes, comments, and reactions.',
          [{ text: 'Try It', onPress: () => demonstrateInteractions() }]
        );
        break;
        
      case 3:
        Alert.alert(
          'Challenges Demo',
          'Join fitness challenges and compete on leaderboards.',
          [{ text: 'View Challenges', onPress: () => navigateToChallenges() }]
        );
        break;
        
      case 4:
        Alert.alert(
          'Real-time Demo',
          `Status: ${realtimeStatus}\nLive updates for posts, comments, and notifications.`,
          [{ text: 'Test Real-time', onPress: () => testRealtimeUpdate() }]
        );
        break;
        
      case 5:
        Alert.alert(
          'Discovery Demo',
          'Search users, explore trending content, find nearby fitness enthusiasts.',
          [{ text: 'Explore', onPress: () => navigateToDiscover() }]
        );
        break;
    }
  };

  const navigateToProfile = () => {
    console.log('Navigate to profile screen');
  };

  const navigateToChallenges = () => {
    console.log('Navigate to challenges screen');
  };

  const navigateToDiscover = () => {
    console.log('Navigate to discover screen');
  };

  const demonstrateInteractions = async () => {
    if (activityFeed.length > 0) {
      const firstPost = activityFeed[0];
      await likePost(firstPost.id);
      Alert.alert('Success', 'Post liked! Try commenting next.');
    }
  };

  const testRealtimeUpdate = async () => {
    // Create a new post to trigger real-time update
        const testPost = mockDataGenerators.createMockActivityPosts(1)[0];
    
    await createPost(testPost);
  };

  const handleShareWorkout = async (caption: string, privacy: string, shareToStory: boolean) => {
        const workoutPost = mockDataGenerators.createMockActivityPosts(1)[0];
    
    await createPost(workoutPost);
    Alert.alert('Success', 'Workout shared to your feed!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#45B545']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>Social Features Demo</Text>
        <Text style={styles.subtitle}>
          Interactive demonstration of Catalyft's social ecosystem
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people" size={24} color="white" />
            <Text style={styles.statValue}>{activityFeed.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="wifi" size={24} color="white" />
            <Text style={styles.statValue}>{realtimeStatus}</Text>
            <Text style={styles.statLabel}>Real-time</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="shield-checkmark" size={24} color="white" />
            <Text style={styles.statValue}>Active</Text>
            <Text style={styles.statLabel}>Privacy</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Demo Steps */}
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>Feature Demonstrations</Text>
        {demoSteps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.stepCard,
              demoStep === index && styles.activeStepCard,
            ]}
            onPress={() => runDemoStep(index)}
          >
            <View
              style={[
                styles.stepIcon,
                { backgroundColor: step.color },
              ]}
            >
              <Ionicons name={step.icon as keyof typeof Ionicons.glyphMap} size={24} color="white" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={demoStep === index ? '#4CAF50' : '#CCC'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sample Feed */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Sample Feed</Text>
        {activityFeed.slice(0, 3).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={(postId) => likePost(postId)}
            onComment={(postId) => console.log('Comment on:', postId)}
            onShare={(postId) => console.log('Share:', postId)}
            onProfilePress={(userId) => console.log('View profile:', userId)}
          />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowShareModal(true)}
        >
          <LinearGradient
            colors={['#4CAF50', '#45B545']}
            style={styles.actionGradient}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.actionText}>Share Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => runDemoStep(3)}
        >
          <LinearGradient
            colors={['#FFD700', '#FFC107']}
            style={styles.actionGradient}
          >
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.actionText}>Join Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Share Workout Modal */}
      <ShareWorkoutModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShareWorkout}
        workout={mockWorkout}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>✨ Features Summary</Text>
        <Text style={styles.summaryText}>
          • Privacy-first design with granular controls{'\n'}
          • Rich content types (workouts, meals, achievements){'\n'}
          • Real-time updates and notifications{'\n'}
          • Gamification with challenges and leaderboards{'\n'}
          • Social discovery and user search{'\n'}
          • Comprehensive engagement features
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  stepsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeStepCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  feedSection: {
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  summary: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});