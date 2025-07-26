import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Alert } from 'react-native';
import { Session } from '@/types/training';

interface SessionCardProps {
  session: Session;
  onLongPress?: () => void;
  isActive?: boolean;
}

const getLoadBorderColor = (loadPercent?: number): string => {
  if (loadPercent === undefined) return 'rgba(255, 255, 255, 0.2)';
  
  // HSL formula: hsl(120 - 120*loadPercent/100, 80%, 60%)
  const hue = Math.max(0, 120 - (120 * loadPercent) / 100);
  const saturation = 80;
  const lightness = 60;
  
  // Convert HSL to RGB for React Native
  const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness / 100 - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue < 180) {
    r = 0; g = c; b = x;
  } else if (hue < 240) {
    r = 0; g = x; b = c;
  } else if (hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);
  
  return `rgb(${red}, ${green}, ${blue})`;
};

const getLoadInfo = (session: Session): string => {
  const loadText = session.loadPercent !== undefined ? `Load: ${session.loadPercent}%` : 'Load: N/A';
  const prText = session.isPR ? '\nPR Achieved! 🏅' : '';
  return loadText + prText;
};

export const CalendarSessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onLongPress, 
  isActive 
}) => {
  const startTime = new Date(session.start_ts).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const borderColor = session.isPR ? '#5BAFFF' : getLoadBorderColor(session.loadPercent);

  const handlePress = () => {
    Alert.alert(
      'Session Details',
      getLoadInfo(session),
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      onPress={handlePress}
      delayLongPress={500}
      style={{
        marginBottom: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: isActive ? 'rgba(91, 175, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: borderColor,
        transform: [{ scale: isActive ? 1.05 : 1 }],
        position: 'relative',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <View style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#5BAFFF'
        }} />
        <Text style={{ fontSize: 12, color: 'white', fontWeight: '500' }}>
          {startTime}
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'capitalize' }}>
          {session.type}
        </Text>
      </View>
      
      {/* PR Badge */}
      {session.isPR && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: '#5BAFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 10 }}>🏅</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};