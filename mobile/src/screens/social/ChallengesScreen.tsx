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
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useStore } from '../../store';
import { Challenge } from '../../types/social';
import { formatNumber, formatDuration } from '../../utils/formatters';
import { useNavigation } from '@react-navigation/native';

export const ChallengesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    challenges,
    userChallenges,
    isLoading,
    loadChallenges,
    loadUserChallenges,
    joinChallenge,
    leaveChallenge,
    createChallenge,
  } = useStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadChallenges(),
      loadUserChallenges(),
    ]);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    await joinChallenge(challengeId);
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    await leaveChallenge(challengeId);
  };

  const navigateToChallengeDetails = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetails', { challengeId: challenge.id });
  };

  const getFilteredChallenges = () => {
    let filtered = activeTab === 'active' 
      ? challenges.filter(c => c.status === 'active')
      : activeTab === 'upcoming'
      ? challenges.filter(c => c.status === 'upcoming')
      : challenges.filter(c => c.status === 'completed');

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    return filtered;
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => {
    const progress = item.userProgress || 0;
    const daysLeft = Math.ceil((new Date(item.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => navigateToChallengeDetails(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getChallengeGradient(item.category)}
          style={styles.challengeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIconContainer}>
              <Icon name={getChallengeIcon(item.type)} size={24} color="white" />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>{item.name}</Text>
              <Text style={styles.challengeDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>

          <View style={styles.challengeStats}>
            <View style={styles.statItem}>
              <Icon name="people" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{formatNumber(item.participantsCount || 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{daysLeft}d left</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{item.points} pts</Text>
            </View>
          </View>

          {item.isJoined ? (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressValue}>{progress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              {item.userRank && (
                <Text style={styles.rankText}>Rank: #{item.userRank}</Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinChallenge(item.id)}
            >
              <Text style={styles.joinButtonText}>Join Challenge</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getChallengeGradient = (category: string): string[] => {
    const gradients: { [key: string]: string[] } = {
      strength: ['#FF6B6B', '#FF8E53'],
      cardio: ['#4ECDC4', '#44A08D'],
      flexibility: ['#A8E6CF', '#7FD5B5'],
      endurance: ['#667EEA', '#764BA2'],
      nutrition: ['#F093FB', '#F5576C'],
      mindfulness: ['#4FACFE', '#00F2FE'],
      default: ['#4CAF50', '#45B545'],
    };
    return gradients[category] || gradients.default;
  };

  const getChallengeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      workouts: 'fitness',
      distance: 'walk',
      calories: 'flame',
      duration: 'time',
      streak: 'calendar',
      custom: 'star',
    };
    return icons[type] || 'trophy';
  };

  const renderCreateChallengeModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Challenge</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <TextInput
              style={styles.input}
              placeholder="Challenge Name"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Challenge Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {['Workouts', 'Distance', 'Calories', 'Duration', 'Streak'].map((type) => (
                <TouchableOpacity key={type} style={styles.typeOption}>
                  <Text style={styles.typeOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Goal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration (days)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Public Challenge</Text>
              <TouchableOpacity style={styles.switch}>
                <View style={styles.switchThumb} />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Invite Only</Text>
              <TouchableOpacity style={styles.switch}>
                <View style={styles.switchThumb} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const categories = ['all', 'strength', 'cardio', 'flexibility', 'endurance', 'nutrition', 'mindfulness'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
        <TouchableOpacity
          style={styles.createChallengeButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.selectedCategoryChipText
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Challenges List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={getFilteredChallenges()}
          renderItem={renderChallengeCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="trophy-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No challenges found</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'active' 
                  ? 'Join a challenge to get started!'
                  : activeTab === 'upcoming'
                  ? 'Check back soon for new challenges'
                  : 'Complete some challenges to see them here'}
              </Text>
              {activeTab === 'active' && (
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={styles.browseButtonText}>Browse All Challenges</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* My Challenges Section */}
      {userChallenges.length > 0 && activeTab === 'active' && (
        <View style={styles.myChallengesSection}>
          <Text style={styles.sectionTitle}>My Active Challenges</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userChallenges.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={styles.miniChallengeCard}
                onPress={() => navigateToChallengeDetails(challenge)}
              >
                <LinearGradient
                  colors={getChallengeGradient(challenge.category)}
                  style={styles.miniChallengeGradient}
                >
                  <Icon name={getChallengeIcon(challenge.type)} size={20} color="white" />
                  <Text style={styles.miniChallengeName}>{challenge.name}</Text>
                  <View style={styles.miniProgressBar}>
                    <View
                      style={[
                        styles.miniProgress,
                        { width: `${challenge.userProgress || 0}%` }
                      ]}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {renderCreateChallengeModal()}
    </View>
  );
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
  createChallengeButton: {
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
  categoryFilter: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 60,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
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
  },
  listContent: {
    padding: 16,
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  progressValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  rankText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
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
  browseButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  myChallengesSection: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  miniChallengeCard: {
    width: 140,
    height: 120,
    marginLeft: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniChallengeGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  miniChallengeName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgress: {
    height: '100%',
    backgroundColor: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    width: 50,
    height: 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    padding: 2,
  },
  switchThumb: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 13,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});