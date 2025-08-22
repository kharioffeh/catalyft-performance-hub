import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syncEngine, SyncConflict } from '../../services/offline/syncEngine';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ConflictResolutionScreenProps {
  route?: {
    params?: {
      conflictId?: string;
    };
  };
}

export const ConflictResolutionScreen: React.FC<ConflictResolutionScreenProps> = ({ route }) => {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadConflicts();
    
    // If specific conflict ID provided, select it
    if (route?.params?.conflictId) {
      const conflict = syncEngine.getConflicts().find(c => c.id === route.params?.conflictId);
      if (conflict) {
        setSelectedConflict(conflict);
      }
    }
  }, [route?.params?.conflictId]);

  const loadConflicts = () => {
    const allConflicts = syncEngine.getConflicts();
    setConflicts(allConflicts);
    
    if (allConflicts.length === 0) {
      Alert.alert('No Conflicts', 'All data is synchronized!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const handleResolve = async (resolution: 'local' | 'remote' | 'merged') => {
    if (!selectedConflict) return;

    Alert.alert(
      'Confirm Resolution',
      `Use ${resolution === 'local' ? 'your local' : resolution === 'remote' ? 'server' : 'merged'} version?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsResolving(true);
            try {
              await syncEngine.resolveConflict(selectedConflict.id, resolution);
              
              // Remove from list
              const updatedConflicts = conflicts.filter(c => c.id !== selectedConflict.id);
              setConflicts(updatedConflicts);
              
              if (updatedConflicts.length > 0) {
                setSelectedConflict(updatedConflicts[0]);
              } else {
                setSelectedConflict(null);
                Alert.alert('Success', 'All conflicts resolved!', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve conflict');
            } finally {
              setIsResolving(false);
            }
          },
        },
      ]
    );
  };

  const handleBulkResolve = (strategy: 'local' | 'remote') => {
    Alert.alert(
      'Bulk Resolve',
      `Use ${strategy === 'local' ? 'all local' : 'all server'} versions for ${conflicts.length} conflicts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: strategy === 'local' ? 'default' : 'destructive',
          onPress: async () => {
            setIsResolving(true);
            try {
              for (const conflict of conflicts) {
                await syncEngine.resolveConflict(conflict.id, strategy);
              }
              setConflicts([]);
              setSelectedConflict(null);
              Alert.alert('Success', 'All conflicts resolved!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve some conflicts');
              loadConflicts();
            } finally {
              setIsResolving(false);
            }
          },
        },
      ]
    );
  };

  const renderConflictList = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Conflicts ({conflicts.length})</Text>
        {conflicts.length > 1 && (
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={styles.bulkButton}
              onPress={() => handleBulkResolve('local')}
            >
              <Text style={styles.bulkButtonText}>Use All Local</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkButton, styles.bulkButtonRemote]}
              onPress={() => handleBulkResolve('remote')}
            >
              <Text style={styles.bulkButtonText}>Use All Server</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.conflictList}>
        {conflicts.map((conflict) => (
          <TouchableOpacity
            key={conflict.id}
            style={[
              styles.conflictItem,
              selectedConflict?.id === conflict.id && styles.selectedConflict
            ]}
            onPress={() => setSelectedConflict(conflict)}
          >
            <View style={styles.conflictItemHeader}>
              <Text style={styles.conflictEntity}>{conflict.entity}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={selectedConflict?.id === conflict.id ? '#007AFF' : '#999'}
              />
            </View>
            <Text style={styles.conflictTime}>
              Local: {formatDistanceToNow(conflict.localTimestamp, { addSuffix: true })}
            </Text>
            <Text style={styles.conflictTime}>
              Server: {formatDistanceToNow(conflict.remoteTimestamp, { addSuffix: true })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderConflictDetails = () => {
    if (!selectedConflict) {
      return (
        <View style={styles.noSelection}>
          <Ionicons name="git-compare" size={48} color="#CCC" />
          <Text style={styles.noSelectionText}>Select a conflict to view details</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.detailsContainer}>
        {/* Conflict Header */}
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>
            {selectedConflict.entity} Conflict
          </Text>
          <TouchableOpacity
            onPress={() => setCompareMode(
              compareMode === 'side-by-side' ? 'unified' : 'side-by-side'
            )}
          >
            <Ionicons
              name={compareMode === 'side-by-side' ? 'git-compare' : 'list'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>

        {/* Timestamps */}
        <View style={styles.timestampContainer}>
          <View style={styles.timestampBox}>
            <Text style={styles.timestampLabel}>Local Version</Text>
            <Text style={styles.timestampValue}>
              {format(selectedConflict.localTimestamp, 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
          <View style={styles.timestampBox}>
            <Text style={styles.timestampLabel}>Server Version</Text>
            <Text style={styles.timestampValue}>
              {format(selectedConflict.remoteTimestamp, 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
        </View>

        {/* Data Comparison */}
        {compareMode === 'side-by-side' ? (
          <View style={styles.comparisonContainer}>
            <View style={styles.dataColumn}>
              <Text style={styles.columnHeader}>Local Version</Text>
              <View style={styles.dataBox}>
                {renderDataPreview(selectedConflict.localData, selectedConflict.entity)}
              </View>
            </View>
            <View style={styles.dataColumn}>
              <Text style={styles.columnHeader}>Server Version</Text>
              <View style={styles.dataBox}>
                {renderDataPreview(selectedConflict.remoteData, selectedConflict.entity)}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.unifiedContainer}>
            <View style={styles.unifiedSection}>
              <Text style={[styles.columnHeader, { color: '#4ECDC4' }]}>Local Version</Text>
              <View style={[styles.dataBox, styles.localDataBox]}>
                {renderDataPreview(selectedConflict.localData, selectedConflict.entity)}
              </View>
            </View>
            <View style={styles.unifiedSection}>
              <Text style={[styles.columnHeader, { color: '#FFD93D' }]}>Server Version</Text>
              <View style={[styles.dataBox, styles.remoteDataBox]}>
                {renderDataPreview(selectedConflict.remoteData, selectedConflict.entity)}
              </View>
            </View>
          </View>
        )}

        {/* Resolution Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.localButton]}
            onPress={() => handleResolve('local')}
            disabled={isResolving}
          >
            <Ionicons name="phone-portrait" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Use Local</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.remoteButton]}
            onPress={() => handleResolve('remote')}
            disabled={isResolving}
          >
            <Ionicons name="cloud" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Use Server</Text>
          </TouchableOpacity>
          
          {canMerge(selectedConflict.entity) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.mergeButton]}
              onPress={() => handleResolve('merged')}
              disabled={isResolving}
            >
              <Ionicons name="git-merge" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Merge</Text>
            </TouchableOpacity>
          )}
        </View>

        {isResolving && (
          <View style={styles.resolvingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.resolvingText}>Resolving conflict...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderDataPreview = (data: any, entity: string) => {
    switch (entity) {
      case 'workout':
        return (
          <>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Name:</Text> {data.name || 'Untitled'}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Duration:</Text> {data.duration || 0} min
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Exercises:</Text> {data.exercises?.length || 0}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Sets:</Text> {data.sets?.length || 0}
            </Text>
          </>
        );
      
      case 'food_log':
        return (
          <>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Food:</Text> {data.food_name || 'Unknown'}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Calories:</Text> {data.calories || 0}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Quantity:</Text> {data.quantity || 0} {data.unit || ''}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Meal:</Text> {data.meal_type || 'Other'}
            </Text>
          </>
        );
      
      case 'recipe':
        return (
          <>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Name:</Text> {data.name || 'Untitled'}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Calories:</Text> {data.calories || 0}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Ingredients:</Text> {data.ingredients?.length || 0}
            </Text>
            <Text style={styles.dataField}>
              <Text style={styles.dataLabel}>Servings:</Text> {data.servings || 1}
            </Text>
          </>
        );
      
      default:
        return (
          <Text style={styles.dataField}>
            {JSON.stringify(data, null, 2).substring(0, 200)}...
          </Text>
        );
    }
  };

  const canMerge = (entity: string): boolean => {
    return ['workout', 'recipe', 'template'].includes(entity);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Resolve Sync Conflicts</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {conflicts.length > 0 ? (
          <>
            {renderConflictList()}
            {renderConflictDetails()}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#6BCF7F" />
            <Text style={styles.emptyStateText}>No conflicts to resolve!</Text>
          </View>
        )}
      </View>
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
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    width: '35%',
    backgroundColor: '#FFF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  listHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
    alignItems: 'center',
  },
  bulkButtonRemote: {
    backgroundColor: '#FFD93D',
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  conflictList: {
    flex: 1,
  },
  conflictItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedConflict: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  conflictItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conflictEntity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  conflictTime: {
    fontSize: 11,
    color: '#666',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  noSelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
  },
  timestampContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timestampBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
  },
  timestampLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dataColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dataBox: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
  },
  localDataBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  remoteDataBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFD93D',
  },
  unifiedContainer: {
    marginBottom: 16,
  },
  unifiedSection: {
    marginBottom: 12,
  },
  dataField: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  dataLabel: {
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  localButton: {
    backgroundColor: '#4ECDC4',
  },
  remoteButton: {
    backgroundColor: '#FFD93D',
  },
  mergeButton: {
    backgroundColor: '#6BCF7F',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  resolvingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolvingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
});