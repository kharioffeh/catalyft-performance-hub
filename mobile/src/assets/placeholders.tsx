import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, Path, Rect, Line } from 'react-native-svg';

// Placeholder illustration component
export const PlaceholderIllustration = ({ 
  title, 
  color = '#6C63FF',
  width = 300,
  height = 300 
}: { 
  title: string;
  color?: string;
  width?: number;
  height?: number;
}) => (
  <View style={[styles.placeholder, { width, height }]}>
    <Svg width={width} height={height} viewBox="0 0 300 300">
      <Rect x="50" y="50" width="200" height="200" fill={`${color}20`} rx="20" />
      <Circle cx="150" cy="150" r="60" fill={`${color}40`} />
      <Path
        d="M 120 150 L 140 170 L 180 130"
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    <Text style={[styles.placeholderText, { color }]}>{title}</Text>
  </View>
);

// Placeholder goal icon
export const PlaceholderGoalIcon = ({ 
  name,
  color = '#6C63FF'
}: {
  name: string;
  color?: string;
}) => (
  <Svg width={64} height={64} viewBox="0 0 64 64">
    <Circle cx="32" cy="32" r="28" fill={`${color}20`} stroke={color} strokeWidth="2" />
    <Text x="32" y="38" fontSize="24" fill={color} textAnchor="middle">
      {name.charAt(0).toUpperCase()}
    </Text>
  </Svg>
);

// Placeholder coach avatar
export const PlaceholderCoachAvatar = ({ 
  name 
}: { 
  name: string 
}) => (
  <View style={styles.avatar}>
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarText}>
        {name.split(' ').map(n => n[0]).join('').toUpperCase()}
      </Text>
    </View>
    <Text style={styles.avatarName}>{name}</Text>
  </View>
);

// Animated placeholder for success animations
export const PlaceholderAnimation = ({ 
  type 
}: { 
  type: 'confetti' | 'checkmark' | 'trophy' 
}) => {
  const icons = {
    confetti: '🎉',
    checkmark: '✅',
    trophy: '🏆'
  };
  
  return (
    <View style={styles.animation}>
      <Text style={styles.animationIcon}>{icons[type]}</Text>
      <Text style={styles.animationText}>{type} animation</Text>
    </View>
  );
};

// Export placeholder image sources
export const PLACEHOLDER_IMAGES = {
  onboarding: {
    welcome: { component: () => <PlaceholderIllustration title="Welcome" /> },
    aiCoach: { component: () => <PlaceholderIllustration title="AI Coach" color="#4ECDC4" /> },
    progress: { component: () => <PlaceholderIllustration title="Progress" color="#FFD93D" /> },
    community: { component: () => <PlaceholderIllustration title="Community" color="#FF9F1C" /> },
    getStarted: { component: () => <PlaceholderIllustration title="Get Started" color="#A8E6CF" /> },
  },
  goals: {
    loseWeight: { component: () => <PlaceholderGoalIcon name="Weight" color="#FF6B6B" /> },
    buildMuscle: { component: () => <PlaceholderGoalIcon name="Muscle" color="#4ECDC4" /> },
    getStronger: { component: () => <PlaceholderGoalIcon name="Strong" color="#6C63FF" /> },
    improveEndurance: { component: () => <PlaceholderGoalIcon name="Endure" color="#FF9F1C" /> },
    generalFitness: { component: () => <PlaceholderGoalIcon name="Fitness" color="#A8E6CF" /> },
    sportSpecific: { component: () => <PlaceholderGoalIcon name="Sport" color="#FFD93D" /> },
  },
  coaches: {
    sarah: { component: () => <PlaceholderCoachAvatar name="Sarah Johnson" /> },
    mike: { component: () => <PlaceholderCoachAvatar name="Mike Chen" /> },
    alex: { component: () => <PlaceholderCoachAvatar name="Alex Rivera" /> },
    maria: { component: () => <PlaceholderCoachAvatar name="Maria Silva" /> },
  },
  animations: {
    confetti: { component: () => <PlaceholderAnimation type="confetti" /> },
    checkmark: { component: () => <PlaceholderAnimation type="checkmark" /> },
    trophy: { component: () => <PlaceholderAnimation type="trophy" /> },
  },
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  avatar: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6C63FF20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  avatarName: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  animation: {
    alignItems: 'center',
    padding: 20,
  },
  animationIcon: {
    fontSize: 60,
  },
  animationText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});