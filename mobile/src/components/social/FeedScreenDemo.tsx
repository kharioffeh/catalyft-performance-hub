import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StoryBubble } from './StoryBubble';
import { WorkoutSummary } from './WorkoutSummary';
import { EngagementBar } from './EngagementBar';
import { AnimatedLikeButton } from './AnimatedLikeButton';

export const FeedScreenDemo: React.FC = () => {
  const mockStories = [
    { id: '1', username: 'Alex', avatar: undefined, viewed: false },
    { id: '2', username: 'Sarah', avatar: undefined, viewed: false },
    { id: '3', username: 'Mike', avatar: undefined, viewed: true },
    { id: '4', username: 'Emma', avatar: undefined, viewed: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enhanced FeedScreen Demo</Text>
      
      {/* Stories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instagram-style Stories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockStories.map(story => (
            <StoryBubble
              key={story.id}
              username={story.username}
              viewed={story.viewed}
              gradient={!story.viewed ? ['#8B5CF6', '#3B82F6'] : null}
            />
          ))}
        </ScrollView>
      </View>

      {/* Workout Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhanced Workout Summary</Text>
        <WorkoutSummary
          duration={75}
          exercises={8}
          calories={450}
          muscleGroups={['Chest', 'Triceps', 'Shoulders', 'Core']}
          intensity="high"
          gradient={['#10B981', '#059669']}
          name="Upper Body Power"
        />
      </View>

      {/* Engagement Bar Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clean Engagement Bar</Text>
        <View style={styles.postCard}>
          <Text style={styles.postText}>
            Just crushed my deadlift PR! 405lbs for 3 reps 💪 Feeling stronger every day.
          </Text>
          <EngagementBar
            liked={false}
            likeCount={24}
            commentCount={8}
            shareCount={3}
            onLike={() => console.log('Like pressed')}
            onComment={() => console.log('Comment pressed')}
            onShare={() => console.log('Share pressed')}
          />
        </View>
      </View>

      {/* Animated Like Button Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Animated Like Button</Text>
        <View style={styles.likeButtonContainer}>
          <AnimatedLikeButton
            liked={false}
            count={0}
            onPress={() => console.log('Like pressed')}
            size="large"
          />
        </View>
      </View>

      {/* Features List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✅ Instagram-style stories with gradient borders</Text>
          <Text style={styles.featureItem}>✅ Enhanced workout summary cards with intensity badges</Text>
          <Text style={styles.featureItem}>✅ Double-tap like animation with floating hearts</Text>
          <Text style={styles.featureItem}>✅ Clean engagement bar with smooth animations</Text>
          <Text style={styles.featureItem}>✅ Improved visual hierarchy and spacing</Text>
          <Text style={styles.featureItem}>✅ Consistent styling across all post types</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  postCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  postText: {
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  likeButtonContainer: {
    alignItems: 'center',
    padding: 20,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});