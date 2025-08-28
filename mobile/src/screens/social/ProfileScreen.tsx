/**
 * Profile Screen - User profile with stats, bio, and social features
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { UserProfile, ActivityPost, Achievement } from '../../types/social';
import { formatNumber, formatDuration } from '../../utils/formatters';
import ImagePicker from 'react-native-image-crop-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 48) / 3;

type RootStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Followers: { userId: string };
  Following: { userId: string };
  PostDetail: { postId: string };
  WorkoutDetail: { workoutId: string };
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const userId = route.params?.userId;
  
  const {
    currentUser,
    loadUserProfile,
    loadUserPosts,
    loadUserAchievements,
    followUser,
    unfollowUser,
    uploadProfilePicture,
    userProfiles,
    userPosts,
    userAchievements,
    following,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'workouts' | 'achievements'>('posts');
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  const profileUserId = userId || currentUser?.id;
  const profile = profileUserId ? userProfiles.get(profileUserId) : null;
  const posts = profileUserId ? userPosts.get(profileUserId) || [] : [];
  const achievements = profileUserId ? userAchievements.get(profileUserId) || [] : [];
  const isOwnProfile = !userId || userId === currentUser?.id;
  const isFollowing = following.some(f => f.followingId === profileUserId);

  useEffect(() => {
    if (profileUserId) {
      loadData();
    }
  }, [profileUserId]);

  const loadData = async () => {
    if (!profileUserId) return;
    
    try {
      await Promise.all([
        loadUserProfile(profileUserId),
        loadUserPosts(profileUserId),
        loadUserAchievements(profileUserId),
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [profileUserId]);

  const handleFollowToggle = async () => {
    if (!profileUserId) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(profileUserId);
      } else {
        await followUser(profileUserId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleProfilePictureChange = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
      });
      
      if (image) {
        await uploadProfilePicture(image.path);
        await loadUserProfile(currentUser!.id);
      }
    } catch (error) {
      console.error('Error changing profile picture:', error);
    }
  };

  const handleCoverPhotoChange = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: SCREEN_WIDTH,
        height: 200,
        cropping: true,
      });
      
      if (image) {
        // Upload cover photo logic
        setIsEditingCover(false);
      }
    } catch (error) {
      console.error('Error changing cover photo:', error);
    }
  };

  const renderHeader = () => (
    <View>
      {/* Cover Photo */}
      <TouchableOpacity
        activeOpacity={isOwnProfile ? 0.8 : 1}
        onPress={isOwnProfile ? () => setIsEditingCover(true) : undefined}
      >
        <LinearGradient
          colors={profile?.coverPhoto ? ['transparent', 'transparent'] : ['#FF6B6B', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 200 }}
        >
          {profile?.coverPhoto && (
            <Image
              source={{ uri: profile.coverPhoto }}
              style={{ width: '100%', height: '100%' }}
            />
          )}
          {isOwnProfile && (
            <View style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              padding: 8,
            }}>
              <Icon name="camera" size={20} color="white" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Profile Info */}
      <View style={{ padding: 16, marginTop: -40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 }}>
          {/* Profile Picture */}
          <TouchableOpacity
            onPress={isOwnProfile ? handleProfilePictureChange : undefined}
            activeOpacity={isOwnProfile ? 0.8 : 1}
          >
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#E0E0E0',
              borderWidth: 4,
              borderColor: 'white',
              overflow: 'hidden',
            }}>
              {profile?.profilePicture ? (
                <Image
                  source={{ uri: profile.profilePicture }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#FF6B6B',
                }}>
                  <Text style={{ fontSize: 36, color: 'white', fontWeight: 'bold' }}>
                    {profile?.fullName?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {isOwnProfile && (
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#FF6B6B',
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: 'white',
                }}>
                  <Icon name="camera" size={16} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={{ flex: 1, marginLeft: 16 }}>
            {isOwnProfile ? (
              <TouchableOpacity
                onPress={handleEditProfile}
                style={{
                  backgroundColor: '#F0F0F0',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '600' }}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  style={{
                    flex: 1,
                    backgroundColor: isFollowing ? '#F0F0F0' : '#FF6B6B',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: isFollowing ? '#333' : 'white',
                    fontWeight: '600',
                  }}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F0F0F0',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                  }}
                >
                  <Icon name="chatbubble-outline" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Name and Bio */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
              {profile?.fullName || 'Unknown User'}
            </Text>
            {profile?.isVerified && (
              <Icon name="checkmark-circle" size={20} color="#4ECDC4" />
            )}
          </View>
          <Text style={{ color: '#666', marginTop: 2 }}>
            @{profile?.username || 'username'}
          </Text>
          {profile?.bio && (
            <Text style={{ marginTop: 8, color: '#333', lineHeight: 20 }}>
              {profile.bio}
            </Text>
          )}
          {profile?.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Icon name="location-outline" size={16} color="#666" />
              <Text style={{ color: '#666', marginLeft: 4 }}>{profile.location}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <TouchableOpacity
          onPress={() => setShowStatsModal(true)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 16,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#E0E0E0',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Followers', { userId: profileUserId! })}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {formatNumber(profile?.followersCount || 0)}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Following', { userId: profileUserId! })}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {formatNumber(profile?.followingCount || 0)}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Following</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {formatNumber(profile?.postsCount || 0)}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Posts</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {formatNumber(profile?.totalWorkouts || 0)}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Workouts</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        {profile?.showWorkoutStats && (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 16,
            gap: 8,
          }}>
            <View style={{
              backgroundColor: '#FFF3E0',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Icon name="flame" size={16} color="#FF6B6B" />
              <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '600' }}>
                {profile.currentStreak} day streak
              </Text>
            </View>
            <View style={{
              backgroundColor: '#E3F2FD',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Icon name="time" size={16} color="#2196F3" />
              <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '600' }}>
                {formatDuration(profile.totalWorkoutTime || 0)}
              </Text>
            </View>
            <View style={{
              backgroundColor: '#F3E5F5',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Icon name="flash" size={16} color="#9C27B0" />
              <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '600' }}>
                {formatNumber(profile.totalCaloriesBurned || 0)} cal
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('posts')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderColor: activeTab === 'posts' ? '#FF6B6B' : 'transparent',
          }}
        >
          <Icon
            name="grid-outline"
            size={24}
            color={activeTab === 'posts' ? '#FF6B6B' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('workouts')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderColor: activeTab === 'workouts' ? '#FF6B6B' : 'transparent',
          }}
        >
          <Icon
            name="barbell-outline"
            size={24}
            color={activeTab === 'workouts' ? '#FF6B6B' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('achievements')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderColor: activeTab === 'achievements' ? '#FF6B6B' : 'transparent',
          }}
        >
          <Icon
            name="trophy-outline"
            size={24}
            color={activeTab === 'achievements' ? '#FF6B6B' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPostGrid = () => {
    const workoutPosts = posts.filter(p => p.type === 'workout');
    
    return (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 16,
      }}>
        {workoutPosts.map((post, index) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
            style={{
              width: GRID_ITEM_SIZE,
              height: GRID_ITEM_SIZE,
              margin: 4,
              backgroundColor: '#F0F0F0',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {post.images?.[0] ? (
              <Image
                source={{ uri: post.images[0] }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Icon name="barbell" size={32} color="white" />
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                  marginTop: 4,
                  textAlign: 'center',
                }}>
                  {post.workoutData?.name || 'Workout'}
                </Text>
              </LinearGradient>
            )}
            {post.type === 'pr' && (
              <View style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: '#FFD700',
                borderRadius: 12,
                padding: 4,
              }}>
                <Icon name="star" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAchievements = () => {
    const rarityColors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FFD700',
    };

    return (
      <View style={{ padding: 16 }}>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={{
                width: (SCREEN_WIDTH - 48) / 4,
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: rarityColors[achievement.rarity],
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <Text style={{ fontSize: 24 }}>{achievement.icon}</Text>
              </View>
              <Text style={{
                fontSize: 10,
                textAlign: 'center',
                color: '#666',
              }}>
                {achievement.name}
              </Text>
            </View>
          ))}
        </View>
        {achievements.length === 0 && (
          <View style={{
            paddingVertical: 40,
            alignItems: 'center',
          }}>
            <Icon name="trophy-outline" size={48} color="#CCC" />
            <Text style={{ color: '#999', marginTop: 8 }}>
              No achievements yet
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPostGrid();
      case 'workouts':
        return renderPostGrid(); // Same as posts but filtered
      case 'achievements':
        return renderAchievements();
      default:
        return null;
    }
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'white' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {renderHeader()}
      {renderContent()}
      
      {/* Stats Modal */}
      <Modal
        visible={showStatsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '80%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                Detailed Stats
              </Text>
              <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {/* Personal Records */}
              {profile.personalRecords?.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                    Personal Records
                  </Text>
                  {profile.personalRecords.map((pr, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderColor: '#F0F0F0',
                      }}
                    >
                      <Text style={{ color: '#666' }}>{pr.exerciseName}</Text>
                      <Text style={{ fontWeight: '600' }}>
                        {pr.value} {pr.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Workout Stats */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                  Workout Statistics
                </Text>
                <View style={{ gap: 12 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{ color: '#666' }}>Total Workouts</Text>
                    <Text style={{ fontWeight: '600' }}>
                      {profile.totalWorkouts}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{ color: '#666' }}>Total Time</Text>
                    <Text style={{ fontWeight: '600' }}>
                      {formatDuration(profile.totalWorkoutTime || 0)}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{ color: '#666' }}>Calories Burned</Text>
                    <Text style={{ fontWeight: '600' }}>
                      {formatNumber(profile.totalCaloriesBurned || 0)}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{ color: '#666' }}>Current Streak</Text>
                    <Text style={{ fontWeight: '600' }}>
                      {profile.currentStreak} days
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{ color: '#666' }}>Longest Streak</Text>
                    <Text style={{ fontWeight: '600' }}>
                      {profile.longestStreak} days
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};