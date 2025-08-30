import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width, height) * 0.6;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

export default function RestTimerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { duration = 90, exerciseName = 'Exercise', setNumber = 1 } = route.params as {
    duration: number;
    exerciseName: string;
    setNumber: number;
  };
  
  const { cancelRestTimer } = useWorkoutStore();
  
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const timerRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startTimer();
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...theme.animation.spring.bouncy,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      progressRef.current = setInterval(() => {
        const progress = (duration - timeLeft) / duration;
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  useEffect(() => {
    // Pulse animation when time is running low
    if (timeLeft <= 10 && timeLeft > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsPaused(false);
    progressAnim.setValue(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    Vibration.vibrate([0, 500, 200, 500]);
    
    Alert.alert(
      'Rest Complete! 💪',
      `Time to start your next set of ${exerciseName}!`,
      [
        {
          text: 'Continue',
          onPress: () => {
            cancelRestTimer();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const skipRest = () => {
    Alert.alert(
      'Skip Rest',
      'Are you sure you want to skip the rest period?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            cancelRestTimer();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (timeLeft > duration * 0.6) return theme.colors.light.success;
    if (timeLeft > duration * 0.3) return theme.colors.light.warning;
    return theme.colors.light.error;
  };

  const renderCircularProgress = () => (
    <View style={styles.progressContainer}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        {/* Background Circle */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={theme.colors.light.backgroundSecondary}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={getProgressColor()}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [CIRCUMFERENCE, 0],
          })}
          strokeLinecap="round"
          transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
        />
        
        {/* Glowing Edge */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={getProgressColor()}
          strokeWidth={STROKE_WIDTH + 4}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [CIRCUMFERENCE, 0],
          })}
          strokeLinecap="round"
          transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
          opacity={glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          })}
        />
      </Svg>
      
      {/* Time Display */}
      <View style={styles.timeDisplay}>
        <Animated.Text
          style={[
            styles.timeText,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {formatTime(timeLeft)}
        </Animated.Text>
        <Text style={styles.timeLabel}>REST TIME</Text>
      </View>
    </View>
  );

  const renderExerciseInfo = () => (
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{exerciseName}</Text>
      <Text style={styles.setInfo}>Set {setNumber}</Text>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {!isActive ? (
        <TouchableOpacity
          style={styles.controlButton}
          onPress={startTimer}
        >
          <LinearGradient
            colors={theme.gradients.success}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.controlButtonText}>Start</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.controlRow}>
          {isPaused ? (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={resumeTimer}
            >
              <LinearGradient
                colors={theme.gradients.success}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.controlButtonText}>Resume</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pauseTimer}
            >
              <LinearGradient
                colors={theme.gradients.warning}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="pause" size={24} color="white" />
                <Text style={styles.controlButtonText}>Pause</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetTimer}
          >
            <LinearGradient
              colors={theme.gradients.secondary}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.controlButtonText}>Reset</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipRest}
      >
        <Text style={styles.skipButtonText}>Skip Rest</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.rest}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              cancelRestTimer();
              navigation.goBack();
            }}
          >
            <View style={styles.backButtonBackground}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Rest Timer</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.mainContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {renderExerciseInfo()}
            {renderCircularProgress()}
            {renderControls()}
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Rest Timer Overlay */}
      {isActive && !isPaused && (
        <View style={styles.restOverlay}>
        <View style={styles.restContent}>
          <Text style={styles.restTitle}>Rest Time</Text>
          <View style={styles.modalCircularProgress}>
            <Svg width={200} height={200}>
              {/* Background Circle */}
              <Circle
                cx={100}
                cy={100}
                r={90}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={8}
                fill="transparent"
              />
              
              {/* Progress Circle */}
              <Circle
                cx={100}
                cy={100}
                r={90}
                stroke="#0057FF"
                strokeWidth={8}
                fill="transparent"
                strokeDasharray={565.48}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [565.48, 0],
                })}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </Svg>
            
            {/* Time Display */}
            <View style={styles.modalTimeDisplay}>
              <Text style={styles.modalTimeText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
          
                     <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
             <Text style={styles.skipText}>Skip Rest</Text>
           </TouchableOpacity>
         </View>
       </View>
       )}
     </View>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  backButtonBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainContainer: {
    alignItems: 'center',
    width: '100%',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  setInfo: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timeDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  controlButton: {
    borderRadius: 16,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 120,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Overlay Styles
  restOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  restContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 24,
  },
  modalCircularProgress: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTimeDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTimeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E2E2E',
    fontFamily: 'monospace',
  },
  skipText: {
    color: '#0057FF',
    fontSize: 16,
    fontWeight: '600',
  },
});