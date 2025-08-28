import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsService from '../../services/analytics';

interface RatingPromptProps {
  visible: boolean;
  onClose: () => void;
}

const RatingPrompt: React.FC<RatingPromptProps> = ({ visible, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const handleRating = async (stars: number) => {
    setRating(stars);
    
    AnalyticsService.track('rating_given', {
      rating: stars,
      platform: Platform.OS,
    });

    if (stars >= 4) {
      // High rating - prompt for app store review
      await promptAppStoreReview();
    } else {
      // Lower rating - collect feedback
      setHasRated(true);
    }
  };

  const promptAppStoreReview = async () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id1234567890', // Replace with actual app ID
      android: 'market://details?id=com.catalyft.app', // Replace with actual package name
    });

    if (storeUrl) {
      await Linking.openURL(storeUrl);
    }

    await AsyncStorage.setItem('hasRatedApp', 'true');
    await AsyncStorage.setItem('lastRatingPrompt', Date.now().toString());
    
    AnalyticsService.track('app_store_review_prompted', {
      rating: rating,
    });

    onClose();
  };

  const handleFeedback = () => {
    AnalyticsService.track('feedback_requested', {
      rating: rating,
    });
    
    // Navigate to feedback screen or open feedback form
    onClose();
  };

  const handleLater = async () => {
    await AsyncStorage.setItem('lastRatingPrompt', Date.now().toString());
    
    AnalyticsService.track('rating_dismissed', {
      action: 'later',
    });
    
    onClose();
  };

  const handleNever = async () => {
    await AsyncStorage.setItem('neverAskForRating', 'true');
    
    AnalyticsService.track('rating_dismissed', {
      action: 'never',
    });
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {!hasRated ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="star" size={50} color="#FFD93D" />
              </View>

              <Text style={styles.title}>Enjoying Catalyft?</Text>
              <Text style={styles.description}>
                We'd love to hear your feedback! How would you rate your experience so far?
              </Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#FFD93D' : '#E0E0E0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
                  <Text style={styles.laterText}>Maybe Later</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.neverButton} onPress={handleNever}>
                  <Text style={styles.neverText}>Don't Ask Again</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses" size={50} color="#6C63FF" />
              </View>

              <Text style={styles.title}>Thanks for your feedback!</Text>
              <Text style={styles.description}>
                We appreciate your rating. Would you like to share more details about your experience?
              </Text>

              <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedback}>
                <Text style={styles.feedbackButtonText}>Share Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.laterButton} onPress={onClose}>
                <Text style={styles.laterText}>Not Now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  starButton: {
    padding: 5,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  feedbackButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  laterText: {
    color: '#6C63FF',
    fontSize: 15,
  },
  neverButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  neverText: {
    color: '#999',
    fontSize: 14,
  },
});

export default RatingPrompt;