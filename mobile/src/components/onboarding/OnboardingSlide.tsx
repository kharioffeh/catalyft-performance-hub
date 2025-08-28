import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  description: string;
  image?: any;
  icon?: string;
  backgroundColor: string;
  gradientColors?: string[];
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  image,
  icon,
  backgroundColor,
  gradientColors,
}) => {
  const colors = gradientColors || [backgroundColor, `${backgroundColor}DD`];

  return (
    <LinearGradient colors={colors} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={image} style={styles.image} resizeMode="contain" />
          ) : icon ? (
            <View style={styles.iconWrapper}>
              <Ionicons name={icon as any} size={120} color="white" />
            </View>
          ) : null}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 120,
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.35,
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    padding: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
});

export default OnboardingSlide;