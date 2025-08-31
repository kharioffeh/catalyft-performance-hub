import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  showStatus?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "ARIA",
  subtitle = "Always here to help",
  showStatus = true
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <LinearGradient 
          colors={['#0057FF', '#003FCC']} 
          style={styles.ariaAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.ariaInitial}>A</Text>
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.ariaName}>{title}</Text>
          {showStatus && (
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{subtitle}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ariaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ariaInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  ariaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C853',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});