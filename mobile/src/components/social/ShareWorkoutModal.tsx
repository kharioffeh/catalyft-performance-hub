import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { formatDuration, formatNumber } from '../../utils/formatters';

interface ShareWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (caption: string, privacy: string, shareToStory: boolean) => void;
  workout: {
    id: string;
    name: string;
    duration: number;
    caloriesBurned: number;
    exercises: number;
    muscleGroups?: string[];
  };
}

export const ShareWorkoutModal: React.FC<ShareWorkoutModalProps> = ({
  visible,
  onClose,
  onShare,
  workout,
}) => {
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [shareToStory, setShareToStory] = useState(false);
  const [includeStats, setIncludeStats] = useState(true);

  const handleShare = () => {
    onShare(caption, privacy, shareToStory);
    setCaption('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Share Workout</Text>
            <TouchableOpacity onPress={handleShare}>
              <Text style={styles.shareButton}>Share</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Workout Preview */}
            <LinearGradient
              colors={['#4CAF50', '#45B545']}
              style={styles.workoutPreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.workoutHeader}>
                <Icon name="fitness" size={32} color="white" />
                <Text style={styles.workoutName}>{workout.name}</Text>
              </View>

              {includeStats && (
                <View style={styles.workoutStats}>
                  <View style={styles.stat}>
                    <Icon name="time-outline" size={20} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                  <View style={styles.stat}>
                    <Icon name="flame-outline" size={20} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statValue}>{formatNumber(workout.caloriesBurned)}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                  <View style={styles.stat}>
                    <Icon name="barbell-outline" size={20} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statValue}>{workout.exercises}</Text>
                    <Text style={styles.statLabel}>Exercises</Text>
                  </View>
                </View>
              )}

              {workout.muscleGroups && workout.muscleGroups.length > 0 && (
                <View style={styles.muscleGroups}>
                  {workout.muscleGroups.map((group, index) => (
                    <View key={index} style={styles.muscleGroupChip}>
                      <Text style={styles.muscleGroupText}>{group}</Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>

            {/* Caption Input */}
            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption..."
                placeholderTextColor="#999"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={500}
              />
              <Text style={styles.charCount}>{caption.length}/500</Text>
            </View>

            {/* Privacy Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who can see this?</Text>
              <View style={styles.privacyOptions}>
                <TouchableOpacity
                  style={[styles.privacyOption, privacy === 'public' && styles.privacyOptionActive]}
                  onPress={() => setPrivacy('public')}
                >
                  <Icon name="earth" size={20} color={privacy === 'public' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.privacyText, privacy === 'public' && styles.privacyTextActive]}>
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.privacyOption, privacy === 'followers' && styles.privacyOptionActive]}
                  onPress={() => setPrivacy('followers')}
                >
                  <Icon name="people" size={20} color={privacy === 'followers' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.privacyText, privacy === 'followers' && styles.privacyTextActive]}>
                    Followers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.privacyOption, privacy === 'private' && styles.privacyOptionActive]}
                  onPress={() => setPrivacy('private')}
                >
                  <Icon name="lock-closed" size={20} color={privacy === 'private' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.privacyText, privacy === 'private' && styles.privacyTextActive]}>
                    Private
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sharing Options</Text>
              
              <View style={styles.option}>
                <View style={styles.optionInfo}>
                  <Icon name="stats-chart" size={20} color="#666" />
                  <Text style={styles.optionText}>Include workout stats</Text>
                </View>
                <Switch
                  value={includeStats}
                  onValueChange={setIncludeStats}
                  trackColor={{ false: '#CCC', true: '#4CAF50' }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.option}>
                <View style={styles.optionInfo}>
                  <Icon name="time-outline" size={20} color="#666" />
                  <Text style={styles.optionText}>Share to story (24h)</Text>
                </View>
                <Switch
                  value={shareToStory}
                  onValueChange={setShareToStory}
                  trackColor={{ false: '#CCC', true: '#4CAF50' }}
                  thumbColor="white"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  shareButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  body: {
    padding: 20,
  },
  workoutPreview: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginLeft: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
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
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleGroupChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  muscleGroupText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  captionContainer: {
    marginBottom: 20,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    gap: 8,
  },
  privacyOptionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  privacyTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
});