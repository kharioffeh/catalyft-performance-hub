import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import {
  Play,
  Pause,
  Square,
  MessageSquare,
  Activity,
  X,
} from 'lucide-react-native';

interface SessionControlsProps {
  status: 'planned' | 'active' | 'paused' | 'completed';
  rpe?: number;
  notes?: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onRPEChange: (rpe: number) => void;
  onNotesChange: (notes: string) => void;
  isLoading?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  status,
  rpe,
  notes,
  onStart,
  onPause,
  onResume,
  onEnd,
  onRPEChange,
  onNotesChange,
  isLoading = false,
}) => {
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes || '');

  const rpeLabels = [
    { value: 1, label: 'Very Light', description: 'Could continue for hours' },
    { value: 2, label: 'Light', description: 'Easy to continue' },
    { value: 3, label: 'Moderate', description: 'Getting a bit harder' },
    { value: 4, label: 'Somewhat Hard', description: 'Starting to feel it' },
    { value: 5, label: 'Hard', description: 'Challenging but manageable' },
    { value: 6, label: 'Hard+', description: 'Definitely working hard' },
    { value: 7, label: 'Very Hard', description: 'Very demanding' },
    { value: 8, label: 'Very Hard+', description: 'Close to max effort' },
    { value: 9, label: 'Extremely Hard', description: 'Almost at limit' },
    { value: 10, label: 'Maximal', description: 'Maximum possible effort' },
  ];

  const handleSaveNotes = () => {
    onNotesChange(tempNotes);
    setShowNotesModal(false);
  };

  const renderMainControls = () => {
    switch (status) {
      case 'planned':
        return (
          <TouchableOpacity
            style={[styles.primaryButton, styles.startButton]}
            onPress={onStart}
            disabled={isLoading}
          >
            <Play size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Start Session</Text>
          </TouchableOpacity>
        );

      case 'active':
        return (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.pauseButton]}
              onPress={onPause}
              disabled={isLoading}
            >
              <Pause size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, styles.endButton]}
              onPress={onEnd}
              disabled={isLoading}
            >
              <Square size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>End</Text>
            </TouchableOpacity>
          </View>
        );

      case 'paused':
        return (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.resumeButton]}
              onPress={onResume}
              disabled={isLoading}
            >
              <Play size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.endButton]}
              onPress={onEnd}
              disabled={isLoading}
            >
              <Square size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>End</Text>
            </TouchableOpacity>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Session Completed! 🎉</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Controls */}
      {renderMainControls()}

      {/* Secondary Controls - RPE & Notes */}
      {status !== 'planned' && status !== 'completed' && (
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={styles.metricButton}
            onPress={() => setShowRPEModal(true)}
          >
            <Activity size={16} color="#3b82f6" />
            <Text style={styles.metricButtonText}>
              RPE: {rpe ? rpe.toString() : '--'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricButton}
            onPress={() => {
              setTempNotes(notes || '');
              setShowNotesModal(true);
            }}
          >
            <MessageSquare size={16} color="#3b82f6" />
            <Text style={styles.metricButtonText}>
              {notes ? 'Notes ✓' : 'Notes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RPE Modal */}
      <Modal
        visible={showRPEModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRPEModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rate of Perceived Exertion</Text>
            <TouchableOpacity onPress={() => setShowRPEModal(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              How hard does this session feel right now?
            </Text>

            <View style={styles.rpeGrid}>
              {rpeLabels.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.rpeItem,
                    rpe === item.value && styles.rpeItemSelected,
                  ]}
                  onPress={() => {
                    onRPEChange(item.value);
                    setShowRPEModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.rpeValue,
                      rpe === item.value && styles.rpeValueSelected,
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={[
                      styles.rpeLabel,
                      rpe === item.value && styles.rpeLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.rpeDescription,
                      rpe === item.value && styles.rpeDescriptionSelected,
                    ]}
                  >
                    {item.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Session Notes</Text>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Add notes about your session, how you're feeling, or observations.
            </Text>

            <TextInput
              style={styles.notesInput}
              value={tempNotes}
              onChangeText={setTempNotes}
              placeholder="Enter your notes here..."
              placeholderTextColor="#888"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.notesActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => setShowNotesModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={handleSaveNotes}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#22c55e',
  },
  resumeButton: {
    backgroundColor: '#22c55e',
  },
  endButton: {
    backgroundColor: '#ef4444',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: 12,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 6,
  },
  metricButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
    lineHeight: 22,
  },
  rpeGrid: {
    gap: 12,
  },
  rpeItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rpeItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  rpeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  rpeValueSelected: {
    color: '#3b82f6',
  },
  rpeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  rpeLabelSelected: {
    color: '#3b82f6',
  },
  rpeDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  rpeDescriptionSelected: {
    color: '#93c5fd',
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    height: 120,
    marginBottom: 24,
  },
  notesActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default SessionControls;