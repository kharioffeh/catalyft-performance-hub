import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: 'workout-tracking',
      question: 'How do I track my workouts?',
      answer: 'To track a workout, tap the "+" button on the main screen and select "Start Workout". You can then choose from your saved workout templates or create a new one. During the workout, you can log sets, reps, and weights for each exercise.',
      icon: 'fitness-outline',
    },
    {
      id: 'nutrition-logging',
      question: 'How do I log my meals?',
      answer: 'Navigate to the Nutrition tab and tap "Log Meal". You can search for foods in our database, scan barcodes, or manually enter nutrition information. You can also save frequently eaten meals for quick logging.',
      icon: 'nutrition-outline',
    },
    {
      id: 'goal-setting',
      question: 'How do I set fitness goals?',
      answer: 'Go to the Goals tab and tap "Add Goal". You can set various types of goals including weight loss, muscle gain, workout frequency, or specific performance targets. Track your progress over time and celebrate achievements!',
      icon: 'target-outline',
    },
    {
      id: 'data-sync',
      question: 'How does data synchronization work?',
      answer: 'Your data automatically syncs across all your devices when you\'re connected to the internet. You can also manually sync by pulling down on any screen. Offline mode allows you to continue tracking even without internet connection.',
      icon: 'sync-outline',
    },
    {
      id: 'privacy-settings',
      question: 'How do I control my privacy?',
      answer: 'Go to Settings > Privacy to control what information is shared with other users. You can choose to keep your profile private, visible to followers only, or public. You can also control specific data sharing preferences.',
      icon: 'shield-outline',
    },
  ];

  const supportOptions = [
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'Get help via email within 24 hours',
      icon: 'mail-outline',
      action: () => Linking.openURL('mailto:support@fitnessapp.com'),
    },
    {
      id: 'chat',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: 'chatbubble-outline',
      action: () => Alert.alert('Live Chat', 'Live chat is available during business hours (9 AM - 6 PM EST)'),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      subtitle: 'Call us for immediate assistance',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:+1-800-FITNESS'),
    },
    {
      id: 'community',
      title: 'Community Forum',
      subtitle: 'Get help from other users',
      icon: 'people-outline',
      action: () => Alert.alert('Community Forum', 'Navigate to community forum'),
    },
  ];

  const quickActions = [
    {
      id: 'tutorial',
      title: 'App Tutorial',
      subtitle: 'Learn the basics',
      icon: 'play-circle-outline',
      action: () => Alert.alert('Tutorial', 'Start app tutorial'),
    },
    {
      id: 'video-guides',
      title: 'Video Guides',
      subtitle: 'Watch helpful videos',
      icon: 'videocam-outline',
      action: () => Alert.alert('Video Guides', 'Open video guides'),
    },
    {
      id: 'user-manual',
      title: 'User Manual',
      subtitle: 'Comprehensive guide',
      icon: 'document-text-outline',
      action: () => Alert.alert('User Manual', 'Open user manual'),
    },
    {
      id: 'tips',
      title: 'Pro Tips',
      subtitle: 'Expert advice',
      icon: 'bulb-outline',
      action: () => Alert.alert('Pro Tips', 'Show pro tips'),
    },
  ];

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderFAQItem = (faq: any) => (
    <TouchableOpacity
      key={faq.id}
      style={styles.faqItem}
      onPress={() => handleFAQToggle(faq.id)}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqIcon}>
          <Icon name={faq.icon} size={20} color="#007AFF" />
        </View>
        <View style={styles.faqQuestion}>
          <Text style={styles.faqQuestionText}>{faq.question}</Text>
        </View>
        <Icon 
          name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#C7C7CC" 
        />
      </View>
      
      {expandedFAQ === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSupportOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={styles.supportOption}
      onPress={option.action}
    >
      <View style={styles.supportOptionLeft}>
        <View style={styles.supportOptionIcon}>
          <Icon name={option.icon} size={20} color="#007AFF" />
        </View>
        <View style={styles.supportOptionInfo}>
          <Text style={styles.supportOptionTitle}>{option.title}</Text>
          <Text style={styles.supportOptionSubtitle}>{option.subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickAction}
      onPress={action.action}
    >
      <View style={styles.quickActionIcon}>
        <Icon name={action.icon} size={24} color="#007AFF" />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Help Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Icon name="help-circle" size={32} color="#007AFF" />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewTitle}>How can we help you?</Text>
              <Text style={styles.overviewSubtitle}>
                Find answers to common questions and get the support you need
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.sectionContent}>
            {supportOptions.map(renderSupportOption)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.sectionContent}>
            {faqs.map(renderFAQItem)}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="globe-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Website</Text>
                  <Text style={styles.settingSubtitle}>
                    Visit our website for more information
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="logo-youtube" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>YouTube Channel</Text>
                  <Text style={styles.settingSubtitle}>
                    Watch tutorials and tips on YouTube
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="logo-twitter" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Social Media</Text>
                  <Text style={styles.settingSubtitle}>
                    Follow us for updates and tips
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Us Improve</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="star-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Rate the App</Text>
                  <Text style={styles.settingSubtitle}>
                    Leave a review on the App Store
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="chatbox-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Send Feedback</Text>
                  <Text style={styles.settingSubtitle}>
                    Share your suggestions and ideas
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="bug-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Report a Bug</Text>
                  <Text style={styles.settingSubtitle}>
                    Help us fix issues you encounter
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Icon name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Support Hours</Text>
          </View>
          <Text style={styles.infoText}>
            Our support team is available Monday through Friday, 9 AM to 6 PM EST. For urgent issues outside of business hours, please email us and we'll respond as soon as possible.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    margin: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  overviewSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    color: '#000000',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  supportOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supportOptionInfo: {
    flex: 1,
  },
  supportOptionTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  supportOptionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
  },
  faqQuestionText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingLeft: 64,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  infoSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
});