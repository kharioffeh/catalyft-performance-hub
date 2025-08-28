import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import EnhancedAnalyticsService, { EVENTS } from '../../services/analytics.enhanced';
import { PlaceholderIllustration } from '../../assets/placeholders';

const { width, height } = Dimensions.get('window');

interface Slide {
  key: string;
  title: string;
  text: string;
  image: any;
  backgroundColor: string;
  icon: string;
  gradient: string[];
}

const slides: Slide[] = [
  {
    key: 'welcome',
    title: 'Welcome to Catalyft',
    text: 'Your AI-powered fitness companion for achieving your health goals',
    image: require('../../assets/onboarding/welcome.png'),
    backgroundColor: '#121212',
    icon: 'fitness-outline',
    gradient: ['#121212', '#1a1a1a', '#0f0f0f'],
  },
  {
    key: 'ai_coach',
    title: 'AI Personal Trainer',
    text: 'Get personalized workout plans tailored to your fitness level and goals',
    image: require('../../assets/onboarding/ai-coach.png'),
    backgroundColor: '#121212',
    icon: 'body-outline',
    gradient: ['#121212', '#1a1a1a', '#0f0f0f'],
  },
  {
    key: 'track_progress',
    title: 'Track Your Progress',
    text: 'Monitor your workouts, nutrition, and see your transformation over time',
    image: require('../../assets/onboarding/progress.png'),
    backgroundColor: '#121212',
    icon: 'trending-up-outline',
    gradient: ['#121212', '#1a1a1a', '#0f0f0f'],
  },
  {
    key: 'community',
    title: 'Join the Community',
    text: 'Connect with fitness enthusiasts, share achievements, and stay motivated',
    image: require('../../assets/onboarding/community.png'),
    backgroundColor: '#121212',
    icon: 'people-outline',
    gradient: ['#121212', '#1a1a1a', '#0f0f0f'],
  },
  {
    key: 'get_started',
    title: 'Ready to Transform?',
    text: "Let's create your personalized fitness journey and achieve your goals together",
    image: require('../../assets/onboarding/get-started.png'),
    backgroundColor: '#121212',
    icon: 'rocket-outline',
    gradient: ['#121212', '#1a1a1a', '#0f0f0f'],
  },
];

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const sliderRef = useRef<AppIntroSlider>(null);
  const startTime = useRef(Date.now());

  const renderItem = ({ item }: { item: Slide }) => {
    return (
      <LinearGradient
        colors={item.gradient}
        style={styles.slide}
      >
        <View style={styles.slideContent}>
          {/* Feature Cards */}
          <View style={styles.featureCards}>
            <View style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={40} color="#00D4FF" />
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          </View>

          {/* Bottom Content */}
          <View style={styles.bottomContent}>
            <Text style={styles.mainTitle}>Transform Your Fitness</Text>
            <Text style={styles.subtitle}>AI-powered workouts tailored just for you</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <LinearGradient
          colors={['#00D4FF', '#00FF88']}
          style={styles.gradientButton}
        >
          <Ionicons name="arrow-forward" size={24} color="white" />
        </LinearGradient>
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#00D4FF', '#00FF88']}
          style={styles.gradientButton}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderSkipButton = () => {
    return (
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    );
  };

  const handleGetStarted = () => {
    const duration = Date.now() - startTime.current;
    
    EnhancedAnalyticsService.track(EVENTS.ONBOARDING_STARTED, {
      source: 'welcome_screen',
      completed_slides: true,
      duration_ms: duration,
    });
    
    navigation.navigate('GoalSelection');
  };

  const handleSkip = () => {
    const duration = Date.now() - startTime.current;
    
    EnhancedAnalyticsService.track(EVENTS.ONBOARDING_SKIPPED, {
      source: 'welcome_screen',
      slide_index: sliderRef.current?.state?.activeIndex || 0,
      duration_ms: duration,
    });
    
    navigation.navigate('MainTabs');
  };

  const onSlideChange = (index: number, lastIndex: number) => {
    EnhancedAnalyticsService.track('onboarding_slide_viewed', {
      slide_index: index,
      slide_key: slides[index].key,
      previous_slide: slides[lastIndex]?.key,
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" translucent />
      <AppIntroSlider
        ref={sliderRef as any}
        data={slides}
        renderItem={renderItem}
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        renderSkipButton={renderSkipButton}
        onSlideChange={onSlideChange}
        showSkipButton
        activeDotStyle={styles.activeDot}
        dotStyle={styles.dot}
      />
    </>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  featureCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  featureText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  bottomContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButton: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: '#888888',
    fontSize: 16,
    opacity: 0.8,
  },
  activeDot: {
    backgroundColor: '#00D4FF',
    width: 30,
    height: 6,
    borderRadius: 3,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 10,
    height: 6,
    borderRadius: 3,
  },
});

export default WelcomeScreen;