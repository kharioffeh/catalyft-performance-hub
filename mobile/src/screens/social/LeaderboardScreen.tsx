import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useStore } from '../../store';
import { LeaderboardEntry } from '../../types/social';
import { formatNumber } from '../../utils/formatters';
import { useNavigation } from '@react-navigation/native';

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'challenges'>('global');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');
  const [category, setCategory] = useState<'overall' | 'workouts' | 'calories' | 'duration' | 'streak'>('overall');
  const [refreshing, setRefreshing] = useState(false);

  const {
    leaderboard,
    currentUserProfile,
    isLoading,
    loadGlobalLeaderboard,
    loadFriendsLeaderboard,
    loadChallengeLeaderboard,
  } = useStore();

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, timePeriod, category]);

  const loadLeaderboard = async () => {
    if (activeTab === 'global') {
      await loadGlobalLeaderboard(timePeriod, category);
    } else if (activeTab === 'friends') {
      await loadFriendsLeaderboard(timePeriod, category);
    } else {
      await loadChallengeLeaderboard(timePeriod);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [activeTab, timePeriod, category]);

  const navigateToProfile = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.userId === currentUserProfile?.userId;
    const isTopThree = index < 3;

    return (
      <TouchableOpacity
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
          isTopThree && styles.topThreeItem,
        ]}
        onPress={() => navigateToProfile(item.userId)}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View style={[styles.medalContainer, getMedalStyle(index)]}>
              <Icon name="medal" size={24} color={getMedalColor(index)} />
            </View>
          ) : (
            <Text style={styles.rankNumber}>#{item.rank}</Text>
          )}
        </View>

        <Image
          source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
          style={styles.userAvatar}
        />

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
              {item.username}
            </Text>
            {item.isVerified && (
              <Icon name="checkmark-circle" size={14} color="#4CAF50" />
            )}
          </View>
          <Text style={styles.userStats}>
            {formatStatValue(item.value, category)} {getStatUnit(category)}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={[styles.scoreValue, isTopThree && styles.topThreeScore]}>
            {formatNumber(item.score)}
          </Text>
        </View>

        {item.change !== undefined && item.change !== 0 && (
          <View style={styles.changeContainer}>
            <Icon
              name={item.change > 0 ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={item.change > 0 ? '#4CAF50' : '#F44336'}
            />
            <Text style={[
              styles.changeText,
              { color: item.change > 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {Math.abs(item.change)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getMedalStyle = (index: number) => {
    const styles = [
      { backgroundColor: '#FFD700' }, // Gold
      { backgroundColor: '#C0C0C0' }, // Silver
      { backgroundColor: '#CD7F32' }, // Bronze
    ];
    return styles[index] || {};
  };

  const getMedalColor = (index: number) => {
    const colors = ['#FFF', '#FFF', '#FFF'];
    return colors[index] || '#FFF';
  };

  const formatStatValue = (value: number, category: string): string => {
    switch (category) {
      case 'calories':
        return formatNumber(value);
      case 'duration':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      default:
        return formatNumber(value);
    }
  };

  const getStatUnit = (category: string): string => {
    switch (category) {
      case 'workouts':
        return 'workouts';
      case 'calories':
        return 'cal';
      case 'duration':
        return '';
      case 'streak':
        return 'days';
      default:
        return 'pts';
    }
  };

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);
    if (topThree.length === 0) return null;

    return (
      <View style={styles.topThreeContainer}>
        {topThree[1] && (
          <TouchableOpacity
            style={styles.topThreeItem}
            onPress={() => navigateToProfile(topThree[1].userId)}
          >
            <View style={styles.silverMedal}>
              <Text style={styles.medalNumber}>2</Text>
            </View>
            <Image
              source={{ uri: topThree[1].profilePicture || 'https://via.placeholder.com/80' }}
              style={styles.topThreeAvatar}
            />
            <Text style={styles.topThreeName}>{topThree[1].username}</Text>
            <Text style={styles.topThreeScore}>{formatNumber(topThree[1].score)}</Text>
          </TouchableOpacity>
        )}

        {topThree[0] && (
          <TouchableOpacity
            style={[styles.topThreeItem, styles.firstPlace]}
            onPress={() => navigateToProfile(topThree[0].userId)}
          >
            <Icon name="crown" size={32} color="#FFD700" style={styles.crown} />
            <View style={styles.goldMedal}>
              <Text style={styles.medalNumber}>1</Text>
            </View>
            <Image
              source={{ uri: topThree[0].profilePicture || 'https://via.placeholder.com/100' }}
              style={[styles.topThreeAvatar, styles.firstPlaceAvatar]}
            />
            <Text style={styles.topThreeName}>{topThree[0].username}</Text>
            <Text style={styles.topThreeScore}>{formatNumber(topThree[0].score)}</Text>
          </TouchableOpacity>
        )}

        {topThree[2] && (
          <TouchableOpacity
            style={styles.topThreeItem}
            onPress={() => navigateToProfile(topThree[2].userId)}
          >
            <View style={styles.bronzeMedal}>
              <Text style={styles.medalNumber}>3</Text>
            </View>
            <Image
              source={{ uri: topThree[2].profilePicture || 'https://via.placeholder.com/80' }}
              style={styles.topThreeAvatar}
            />
            <Text style={styles.topThreeName}>{topThree[2].username}</Text>
            <Text style={styles.topThreeScore}>{formatNumber(topThree[2].score)}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCurrentUserPosition = () => {
    if (!currentUserProfile) return null;

    const userEntry = leaderboard.find(entry => entry.userId === currentUserProfile.userId);
    if (!userEntry || userEntry.rank <= 10) return null;

    return (
      <View style={styles.currentUserPosition}>
        <LinearGradient
          colors={['#4CAF50', '#45B545']}
          style={styles.currentUserGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.currentUserRank}>#{userEntry.rank}</Text>
          <Image
            source={{ uri: currentUserProfile.profilePicture || 'https://via.placeholder.com/40' }}
            style={styles.currentUserSmallAvatar}
          />
          <Text style={styles.currentUserNameSmall}>You</Text>
          <Text style={styles.currentUserScore}>{formatNumber(userEntry.score)} pts</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Icon name="information-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'global' && styles.activeTab]}
          onPress={() => setActiveTab('global')}
        >
          <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Period Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.filterChip,
              timePeriod === period && styles.selectedFilterChip
            ]}
            onPress={() => setTimePeriod(period)}
          >
            <Text style={[
              styles.filterChipText,
              timePeriod === period && styles.selectedFilterChipText
            ]}>
              {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Filter */}
      {activeTab !== 'challenges' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {(['overall', 'workouts', 'calories', 'duration', 'streak'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.selectedCategoryChip
              ]}
              onPress={() => setCategory(cat)}
            >
              <Icon
                name={getCategoryIcon(cat)}
                size={16}
                color={category === cat ? 'white' : '#666'}
              />
              <Text style={[
                styles.categoryChipText,
                category === cat && styles.selectedCategoryChipText
              ]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Leaderboard Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Top 3 Podium */}
          {renderTopThree()}

          {/* Leaderboard List */}
          <FlatList
            data={leaderboard.slice(3)}
            renderItem={({ item, index }) => renderLeaderboardItem({ item, index: index + 3 })}
            keyExtractor={item => item.userId}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="trophy-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No rankings available</Text>
                <Text style={styles.emptySubtext}>
                  {activeTab === 'friends' 
                    ? 'Follow some friends to see their rankings'
                    : 'Start working out to appear on the leaderboard'}
                </Text>
              </View>
            }
          />

          {/* Current User Position (if not in top 10) */}
          {renderCurrentUserPosition()}
        </ScrollView>
      )}
    </View>
  );
};

const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    overall: 'trophy',
    workouts: 'fitness',
    calories: 'flame',
    duration: 'time',
    streak: 'calendar',
  };
  return icons[category] || 'star';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  infoButton: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  selectedCategoryChip: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryChipText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  topThreeItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  firstPlace: {
    marginBottom: 20,
  },
  crown: {
    position: 'absolute',
    top: -25,
    zIndex: 1,
  },
  goldMedal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -20,
    zIndex: 1,
  },
  silverMedal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -18,
    zIndex: 1,
  },
  bronzeMedal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CD7F32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -18,
    zIndex: 1,
  },
  medalNumber: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  topThreeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  firstPlaceAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#FFD700',
  },
  topThreeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  topThreeScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  topThreeItem: {
    backgroundColor: '#FFF9E6',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  medalContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentUserName: {
    color: '#4CAF50',
  },
  userStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  topThreeScore: {
    color: '#FFD700',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  currentUserPosition: {
    margin: 16,
  },
  currentUserGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  currentUserRank: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginRight: 12,
  },
  currentUserSmallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  currentUserNameSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  currentUserScore: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});