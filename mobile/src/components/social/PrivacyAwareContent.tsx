/**
 * Privacy-aware content wrapper that respects user privacy settings
 */

import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserProfile, PrivacySettings } from '../../types/social';

interface PrivacyAwareContentProps {
  userProfile: UserProfile;
  privacyKey: keyof PrivacySettings;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  currentUserId?: string;
  isFollowing?: boolean;
}

export const PrivacyAwareContent: React.FC<PrivacyAwareContentProps> = ({
  userProfile,
  privacyKey,
  children,
  fallback,
  currentUserId,
  isFollowing = false,
}) => {
  // Always show content for the user's own profile
  if (userProfile.userId === currentUserId) {
    return <>{children}</>;
  }

  const privacySettings = userProfile.privacySettings;
  if (!privacySettings) {
    // If no privacy settings, default to showing content
    return <>{children}</>;
  }

  // Check the specific privacy setting
  const settingValue = privacySettings[privacyKey];
  
  // Handle boolean settings
  if (typeof settingValue === 'boolean') {
    if (!settingValue) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <PrivacyPlaceholder type="hidden" />
      );
    }
    return <>{children}</>;
  }

  // Handle visibility level settings
  if (typeof settingValue === 'string') {
    const visibilityLevel = settingValue as 'public' | 'followers' | 'private';
    
    switch (visibilityLevel) {
      case 'public':
        return <>{children}</>;
      case 'followers':
        if (isFollowing) {
          return <>{children}</>;
        }
        return fallback ? (
          <>{fallback}</>
        ) : (
          <PrivacyPlaceholder type="followers-only" />
        );
      case 'private':
        return fallback ? (
          <>{fallback}</>
        ) : (
          <PrivacyPlaceholder type="private" />
        );
      default:
        return <>{children}</>;
    }
  }

  // Default to showing content if we can't determine privacy
  return <>{children}</>;
};

interface PrivacyPlaceholderProps {
  type: 'hidden' | 'followers-only' | 'private';
}

const PrivacyPlaceholder: React.FC<PrivacyPlaceholderProps> = ({ type }) => {
  const getMessage = () => {
    switch (type) {
      case 'hidden':
        return 'This information is private';
      case 'followers-only':
        return 'Follow to see this content';
      case 'private':
        return 'Private content';
      default:
        return 'Content not available';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'hidden':
        return 'eye-off';
      case 'followers-only':
        return 'people';
      case 'private':
        return 'lock-closed';
      default:
        return 'eye-off';
    }
  };

  return (
    <View style={{
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
    }}>
      <Icon name={getIcon()} size={24} color="#999" />
      <Text style={{
        marginTop: 8,
        color: '#999',
        fontSize: 14,
      }}>
        {getMessage()}
      </Text>
    </View>
  );
};

// Helper hook to check if content should be visible
export const usePrivacyCheck = (
  userProfile: UserProfile | null,
  privacyKey: keyof PrivacySettings,
  currentUserId?: string,
  isFollowing: boolean = false
): boolean => {
  if (!userProfile) return false;
  
  // Always show content for the user's own profile
  if (userProfile.userId === currentUserId) {
    return true;
  }

  const privacySettings = userProfile.privacySettings;
  if (!privacySettings) {
    return true; // Default to showing if no settings
  }

  const settingValue = privacySettings[privacyKey];
  
  // Handle boolean settings
  if (typeof settingValue === 'boolean') {
    return settingValue;
  }

  // Handle visibility level settings
  if (typeof settingValue === 'string') {
    const visibilityLevel = settingValue as 'public' | 'followers' | 'private';
    
    switch (visibilityLevel) {
      case 'public':
        return true;
      case 'followers':
        return isFollowing;
      case 'private':
        return false;
      default:
        return true;
    }
  }

  return true;
};

// Privacy-aware stat display component
interface PrivacyAwareStatProps {
  label: string;
  value: string | number;
  userProfile: UserProfile;
  privacyKey: keyof PrivacySettings;
  currentUserId?: string;
  isFollowing?: boolean;
}

export const PrivacyAwareStat: React.FC<PrivacyAwareStatProps> = ({
  label,
  value,
  userProfile,
  privacyKey,
  currentUserId,
  isFollowing,
}) => {
  return (
    <PrivacyAwareContent
      userProfile={userProfile}
      privacyKey={privacyKey}
      currentUserId={currentUserId}
      isFollowing={isFollowing}
      fallback={
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#CCC' }}>
            --
          </Text>
          <Text style={{ color: '#666', fontSize: 12 }}>{label}</Text>
        </View>
      }
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          {value}
        </Text>
        <Text style={{ color: '#666', fontSize: 12 }}>{label}</Text>
      </View>
    </PrivacyAwareContent>
  );
};