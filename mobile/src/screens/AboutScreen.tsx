import React from 'react';
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

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const appInfo = {
    name: 'ARIA Fitness',
    version: '2.1.0',
    build: '2024.01.15',
    developer: 'ARIA Technologies Inc.',
    copyright: '© 2024 ARIA Technologies Inc. All rights reserved.',
  };

  const legalLinks = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: 'shield-outline',
      action: () => Alert.alert('Privacy Policy', 'Navigate to privacy policy'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'App usage terms and conditions',
      icon: 'document-text-outline',
      action: () => Alert.alert('Terms of Service', 'Navigate to terms of service'),
    },
    {
      id: 'licenses',
      title: 'Third-Party Licenses',
      subtitle: 'Open source and third-party software',
      icon: 'code-outline',
      action: () => Alert.alert('Licenses', 'Show third-party licenses'),
    },
    {
      id: 'data',
      title: 'Data Processing',
      subtitle: 'How your data is processed',
      icon: 'analytics-outline',
      action: () => Alert.alert('Data Processing', 'Navigate to data processing info'),
    },
  ];

  const socialLinks = [
    {
      id: 'website',
      title: 'Website',
      subtitle: 'Visit our official website',
      icon: 'globe-outline',
      action: () => Linking.openURL('https://ariafitness.com'),
    },
    {
      id: 'twitter',
      title: 'Twitter',
      subtitle: 'Follow us on Twitter',
      icon: 'logo-twitter',
      action: () => Linking.openURL('https://twitter.com/ariafitness'),
    },
    {
      id: 'instagram',
      title: 'Instagram',
      subtitle: 'Follow us on Instagram',
      icon: 'logo-instagram',
      action: () => Linking.openURL('https://instagram.com/ariafitness'),
    },
    {
      id: 'youtube',
      title: 'YouTube',
      subtitle: 'Watch our videos',
      icon: 'logo-youtube',
      action: () => Linking.openURL('https://youtube.com/ariafitness'),
    },
  ];

  const teamMembers = [
    {
      id: 'ceo',
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former professional athlete with 15+ years in fitness technology',
      avatar: '👩‍💼',
    },
    {
      id: 'cto',
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Expert in mobile app development and AI-powered fitness solutions',
      avatar: '👨‍💻',
    },
    {
      id: 'design',
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      bio: 'Award-winning UX designer focused on health and wellness apps',
      avatar: '👩‍🎨',
    },
  ];

  const features = [
    {
      id: 'ai',
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms provide personalized workout recommendations and progress analysis.',
      icon: 'brain-outline',
    },
    {
      id: 'sync',
      title: 'Cross-Platform Sync',
      description: 'Seamlessly sync your data across iOS, Android, and web platforms.',
      icon: 'sync-outline',
    },
    {
      id: 'community',
      title: 'Social Fitness',
      description: 'Connect with friends, join challenges, and share your fitness journey.',
      icon: 'people-outline',
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Comprehensive tracking and visualization of your fitness metrics and progress.',
      icon: 'analytics-outline',
    },
  ];

  const renderLegalLink = (link: any) => (
    <TouchableOpacity
      key={link.id}
      style={styles.settingItem}
      onPress={link.action}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={link.icon} size={20} color="#007AFF" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{link.title}</Text>
          <Text style={styles.settingSubtitle}>{link.subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderSocialLink = (link: any) => (
    <TouchableOpacity
      key={link.id}
      style={styles.settingItem}
      onPress={link.action}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={link.icon} size={20} color="#007AFF" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{link.title}</Text>
          <Text style={styles.settingSubtitle}>{link.subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderTeamMember = (member: any) => (
    <View key={member.id} style={styles.teamMember}>
      <View style={styles.teamMemberAvatar}>
        <Text style={styles.teamMemberAvatarText}>{member.avatar}</Text>
      </View>
      <View style={styles.teamMemberInfo}>
        <Text style={styles.teamMemberName}>{member.name}</Text>
        <Text style={styles.teamMemberRole}>{member.role}</Text>
        <Text style={styles.teamMemberBio}>{member.bio}</Text>
      </View>
    </View>
  );

  const renderFeature = (feature: any) => (
    <View key={feature.id} style={styles.feature}>
      <View style={styles.featureIcon}>
        <Icon name={feature.icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>About</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* App Header */}
        <View style={styles.appHeaderSection}>
          <View style={styles.appHeader}>
            <View style={styles.appIcon}>
              <Icon name="fitness" size={48} color="#FFFFFF" />
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{appInfo.name}</Text>
              <Text style={styles.appVersion}>Version {appInfo.version}</Text>
              <Text style={styles.appBuild}>Build {appInfo.build}</Text>
            </View>
          </View>
          
          <View style={styles.appDescription}>
            <Text style={styles.appDescriptionText}>
              ARIA Fitness is your comprehensive fitness companion, combining cutting-edge AI technology with proven fitness science to help you achieve your health and wellness goals.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.sectionContent}>
            {features.map(renderFeature)}
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <View style={styles.sectionContent}>
            {teamMembers.map(renderTeamMember)}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.sectionContent}>
            {legalLinks.map(renderLegalLink)}
          </View>
        </View>

        {/* Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.sectionContent}>
            {socialLinks.map(renderSocialLink)}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="business-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Developer</Text>
                  <Text style={styles.settingSubtitle}>{appInfo.developer}</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="calendar-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Release Date</Text>
                  <Text style={styles.settingSubtitle}>January 15, 2024</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="phone-portrait-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Platform</Text>
                  <Text style={styles.settingSubtitle}>iOS & Android</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="language-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Languages</Text>
                  <Text style={styles.settingSubtitle}>English, Spanish, French, German</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>{appInfo.copyright}</Text>
          <Text style={styles.copyrightSubtext}>
            Made with ❤️ for fitness enthusiasts worldwide
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
  appHeaderSection: {
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
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  appBuild: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  appDescription: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  appDescriptionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
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
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  teamMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  teamMemberAvatarText: {
    fontSize: 24,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  teamMemberRole: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  teamMemberBio: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
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
  copyrightSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});