import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import AnalyticsService, { EVENTS } from '../../services/analytics';
import Icon from '../../components/ui/Icon';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleGetStarted = () => {
    AnalyticsService.track(EVENTS.ONBOARDING_STARTED, {
      source: 'welcome_screen',
      completed_slides: true,
    });
    
    navigation.navigate('GoalSelection');
  };

  const handleLogin = () => {
    AnalyticsService.track('login_link_clicked', {
      source: 'welcome_screen',
    });
    
    // Navigate to login screen or handle login flow
    navigation.navigate('Auth');
  };

  return (
    <LinearGradient colors={['#0057FF', '#003FCC']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LottieView
        source={require('../../assets/animations/fitness-welcome.json')}
        style={styles.animation}
        autoPlay
        loop
      />
      
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome to CataLyft</Text>
        <Text style={styles.welcomeSubtitle}>
          Your AI-powered fitness journey starts here
        </Text>
        
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Icon name="arrow-right" size={20} color="#0057FF" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
    fontWeight: '400',
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 24,
    width: '100%',
    maxWidth: 280,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0057FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  loginLink: {
    paddingVertical: 12,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;