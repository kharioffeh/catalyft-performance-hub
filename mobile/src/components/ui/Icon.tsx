import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size: number;
  color: string;
  style?: any;
}

const Icon: React.FC<IconProps> = ({ name, size, color, style }) => {
  // Map common icon names to Ionicons names
  const iconMap: { [key: string]: string } = {
    'arrow-right': 'arrow-forward',
    'arrow-left': 'arrow-back',
    'check': 'checkmark',
    'close': 'close',
    'menu': 'menu',
    'search': 'search',
    'heart': 'heart',
    'star': 'star',
    'user': 'person',
    'settings': 'settings',
    'home': 'home',
    'fitness': 'fitness',
    'barbell': 'barbell',
    'scale': 'scale',
    'body': 'body',
    'trending-up': 'trending-up',
    'people': 'people',
    'rocket': 'rocket',
  };

  const iconName = iconMap[name] || name;

  return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
};

export default Icon;