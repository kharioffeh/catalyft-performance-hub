import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';
import { UserProfile } from '../../types/social';
import { formatNumber } from '../../utils/formatters';
import { useNavigation } from '@react-navigation/native';

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'suggested' | 'trending' | 'nearby'>('suggested');
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    suggestedUsers,
    searchResults,
    isLoading,
    searchUsers,
    loadSuggestedUsers,
    followUser,
    unfollowUser,
    loadUserProfile,
  } = useStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await loadSuggestedUsers();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSuggestedUsers();
    setRefreshing(false);
  }, [loadSuggestedUsers]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      await searchUsers(query);
      setIsSearching(false);
    }
  }, [searchUsers]);

  const handleFollowToggle = async (user: UserProfile) => {
    if (user.isFollowing) {
      await unfollowUser(user.userId);
    } else {
      await followUser(user.userId);
    }
  };

  const navigateToProfile = (userId: string) => {
    // navigation.navigate('Profile', { userId });
    console.log('Navigate to profile:', userId);
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigateToProfile(item.userId)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/100' }}
        style={styles.userAvatar}
      />
      
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.fullName || item.username}</Text>
          {item.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          )}
        </View>
        
        <Text style={styles.userUsername}>@{item.username}</Text>
        
        {item.bio && (
          <Text style={styles.userBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
        
        <View style={styles.userStats}>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{formatNumber(item.followersCount || 0)}</Text> followers
          </Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{formatNumber(item.workoutsCount || 0)}</Text> workouts
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton
        ]}
        onPress={() => handleFollowToggle(item)}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTrendingContent = () => (
    <View style={styles.trendingSection}>
      <Text style={styles.sectionTitle}>Trending Challenges</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['30 Day Abs', 'Morning Run Club', 'Push-up Challenge', 'Yoga Flow'].map((challenge, index) => (
          <TouchableOpacity key={index} style={styles.trendingCard}>
            <View style={styles.trendingCardContent}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.trendingTitle}>{challenge}</Text>
              <Text style={styles.trendingParticipants}>
                {formatNumber(Math.floor(Math.random() * 10000))} participants
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Popular Workouts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['HIIT Blast', 'Strength Training', 'Cardio Mix', 'Flexibility Flow'].map((workout, index) => (
          <TouchableOpacity key={index} style={styles.workoutCard}>
            <View style={styles.workoutCardContent}>
              <Ionicons name="fitness" size={24} color="#FF6B6B" />
              <Text style={styles.workoutTitle}>{workout}</Text>
              <View style={styles.workoutStats}>
                                  <Ionicons name="flame" size={14} color="#FF6B6B" />
                <Text style={styles.workoutCalories}>
                  {200 + Math.floor(Math.random() * 300)} cal
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNearbyUsers = () => (
    <View style={styles.nearbySection}>
      <View style={styles.locationHeader}>
        <Ionicons name="location" size={20} color="#4CAF50" />
        <Text style={styles.locationText}>San Francisco, CA</Text>
        <TouchableOpacity>
          <Text style={styles.changeLocation}>Change</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.nearbyDescription}>
        Connect with fitness enthusiasts in your area
      </Text>
      
      {suggestedUsers.length > 0 ? (
        <FlatList
          data={suggestedUsers.filter((_, index) => index < 5)}
          renderItem={renderUserCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No nearby users found</Text>
          <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
        </View>
      )}
    </View>
  );

  const displayUsers = searchQuery.trim() ? (searchResults as UserProfile[]) : suggestedUsers;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, workouts, or challenges..."
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Bar */}
      {!searchQuery && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'suggested' && styles.activeTab]}
            onPress={() => setActiveTab('suggested')}
          >
            <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTabText]}>
              Suggested
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => setActiveTab('trending')}
          >
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
            onPress={() => setActiveTab('nearby')}
          >
            <Text style={[styles.tabText, activeTab === 'nearby' && styles.activeTabText]}>
              Nearby
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading || isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : searchQuery ? (
        // Search Results
        <FlatList
          data={displayUsers}
          renderItem={renderUserCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try searching for something else</Text>
            </View>
          }
        />
      ) : (
        // Tab Content
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {activeTab === 'suggested' && (
            <FlatList
              data={displayUsers}
              renderItem={renderUserCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No suggestions yet</Text>
                  <Text style={styles.emptySubtext}>Complete your profile to get personalized suggestions</Text>
                </View>
              }
            />
          )}
          
          {activeTab === 'trending' && renderTrendingContent()}
          {activeTab === 'nearby' && renderNearbyUsers()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  statNumber: {
    fontWeight: '600',
    color: '#333',
  },
  statDivider: {
    marginHorizontal: 8,
    color: '#CCC',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    alignSelf: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  followingButtonText: {
    color: '#4CAF50',
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
  },
  trendingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  trendingCard: {
    width: 150,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingCardContent: {
    alignItems: 'center',
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  trendingParticipants: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  workoutCard: {
    width: 140,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutCardContent: {
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  workoutCalories: {
    fontSize: 12,
    color: '#666',
  },
  nearbySection: {
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  changeLocation: {
    fontSize: 14,
    color: '#4CAF50',
  },
  nearbyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});