import React, { useState } from 'react';
import Modal from 'react-native-modal';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { X, CheckSquare, Square, Users } from 'lucide-react';
import { useAthletes } from '@/hooks/useAthletes';
import { assignProgram } from '@/lib/api/program';
import { toast } from '@/hooks/use-toast';

interface AssignProgramModalProps {
  isVisible: boolean;
  onClose: () => void;
  programId?: string;
  programName?: string;
}

interface Athlete {
  id: string;
  name: string;
  avatar?: string;
}

export default function AssignProgramModal({
  isVisible,
  onClose,
  programId,
  programName
}: AssignProgramModalProps) {
  const { athletes, isLoading } = useAthletes();
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthleteIds(prev => 
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAthleteIds.length === athletes.length) {
      setSelectedAthleteIds([]);
    } else {
      setSelectedAthleteIds(athletes.map(athlete => athlete.id));
    }
  };

  const handleConfirm = async () => {
    if (!programId || selectedAthleteIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await assignProgram({
        programId,
        athleteIds: selectedAthleteIds
      });

      toast({
        title: "Assigned ✅",
        description: `Program assigned to ${selectedAthleteIds.length} athlete(s)`,
      });

      onClose();
      setSelectedAthleteIds([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign program';
      
      toast({
        title: "Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAthleteIds([]);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection="down"
      style={{ 
        justifyContent: 'flex-end', 
        margin: 0 
      }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Assign Program
            </Text>
            {programName && (
              <Text style={styles.subtitle}>
                {programName}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={handleClose}
            style={styles.closeButton}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#0066ff" />
              <Text style={styles.loadingText}>Loading athletes...</Text>
            </View>
          ) : athletes.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#666" />
              <Text style={styles.emptyTitle}>
                No Athletes Found
              </Text>
              <Text style={styles.emptyDescription}>
                Add athletes to your roster to assign programs
              </Text>
            </View>
          ) : (
            <>
              {/* Select All Button */}
              <View style={styles.selectAllContainer}>
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={styles.selectAllButton}
                >
                  {selectedAthleteIds.length === athletes.length ? (
                    <CheckSquare size={20} color="#0066ff" />
                  ) : (
                    <Square size={20} color="#666" />
                  )}
                  <Text style={styles.selectAllText}>
                    Select All ({athletes.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Athletes List */}
              <ScrollView style={styles.scrollView}>
                {athletes.map((athlete: Athlete) => (
                  <TouchableOpacity
                    key={athlete.id}
                    onPress={() => handleAthleteToggle(athlete.id)}
                    style={styles.athleteItem}
                  >
                    {selectedAthleteIds.includes(athlete.id) ? (
                      <CheckSquare size={20} color="#0066ff" />
                    ) : (
                      <Square size={20} color="#666" />
                    )}
                    
                    {/* Avatar placeholder */}
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {athlete.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.athleteInfo}>
                      <Text style={styles.athleteName}>
                        {athlete.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selectedAthleteIds.length === 0 || isSubmitting}
              style={[
                styles.confirmButton,
                (selectedAthleteIds.length === 0 || isSubmitting) && styles.confirmButtonDisabled
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[
                  styles.confirmButtonText,
                  (selectedAthleteIds.length === 0 || isSubmitting) && styles.confirmButtonTextDisabled
                ]}>
                  Assign to {selectedAthleteIds.length} athlete{selectedAthleteIds.length !== 1 ? 's' : ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyDescription: {
    color: '#6b7280',
    textAlign: 'center',
  },
  selectAllContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    color: '#111827',
    fontWeight: '500',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  athleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 12,
  },
  avatarText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    color: '#111827',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0066ff',
  },
  confirmButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  confirmButtonTextDisabled: {
    color: '#6b7280',
  },
});