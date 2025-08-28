import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
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
}

const slides: Slide[] = [
  {
    key: 'welcome',
    title: 'Welcome to Catalyft',
    text: 'Your AI-powered fitness companion for achieving your health goals',
    image: require('../../assets/onboarding/welcome.png'),
    backgroundColor: '#6C63FF',
    icon: 'fitness-outline',
  },
  {
    key: 'ai_coach',
    title: 'AI Personal Trainer',
    text: 'Get personalized workout plans tailored to your fitness level and goals',
    image: require('../../assets/onboarding/ai-coach.png'),
    backgroundColor: '#FF6B6B',
    icon: 'body-outline',
  },
  {
    key: 'track_progress',
    title: 'Track Your Progress',
    text: 'Monitor your workouts, nutrition, and see your transformation over time',
    image: require('../../assets/onboarding/progress.png'),
    backgroundColor: '#4ECDC4',
    icon: 'trending-up-outline',
  },
  {
    key: 'community',
    title: 'Join the Community',
    text: 'Connect with fitness enthusiasts, share achievements, and stay motivated',
    image: require('../../assets/onboarding/community.png'),
    backgroundColor: '#FF9F1C',
    icon: 'people-outline',
  },
  {
    key: 'get_started',
    title: 'Ready to Transform?',
    text: "Let's create your personalized fitness journey and achieve your goals together",
    image: require('../../assets/onboarding/get-started.png'),
    backgroundColor: '#A8E6CF',
    icon: 'rocket-outline',
  },
];

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const sliderRef = useRef<AppIntroSlider>(null);
  const startTime = useRef(Date.now());

  const renderItem = ({ item }: { item: Slide }) => {
    return (
      <LinearGradient
        colors={[item.backgroundColor, `${item.backgroundColor}DD`]}
        style={styles.slide}
      >
        <View style={styles.slideContent}>
          <View style={styles.imageContainer}>
            <Ionicons name={item.icon as any} size={80} color="white" />
            {/* Replace with actual image when assets are ready */}
            {/* <Image source={item.image} style={styles.image} resizeMode="contain" /> */}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons name="arrow-forward" size={24} color="white" />
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
        <Text style={styles.getStartedText}>Get Started</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonCircle: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 30,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 10,
  },
});

export default WelcomeScreen;