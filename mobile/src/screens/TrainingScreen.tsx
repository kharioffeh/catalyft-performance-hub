import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';

export default function TrainingScreen() {
  const [liftModalVisible, setLiftModalVisible] = React.useState(false);
  const [ariaModalVisible, setAriaModalVisible] = React.useState(false);
  const [workoutActive, setWorkoutActive] = React.useState(false);
  const [exercise, setExercise] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [reps, setReps] = React.useState('');
  const [sets, setSets] = React.useState('');
  const [chatInput, setChatInput] = React.useState('');

  const handleStartWorkout = () => {
    setWorkoutActive(true);
    Alert.alert('Workout Started', 'Your workout session has begun!');
  };

  const handleFinishSession = () => {
    Alert.alert(
      'Finish Session',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Finish', 
          onPress: () => {
            setWorkoutActive(false);
            Alert.alert('Session Completed', 'Great work! Your session has been saved.');
          }
        }
      ]
    );
  };

  const handleSaveLift = () => {
    if (exercise && weight && reps) {
      Alert.alert('Lift Saved', `${exercise}: ${weight}lbs x ${reps} reps`);
      setLiftModalVisible(false);
      setExercise('');
      setWeight('');
      setReps('');
      setSets('');
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      Alert.alert('ARIA Response', 'Here\'s your customized workout program...');
      setChatInput('');
    }
  };

  return (
    <ScrollView style={styles.container} testID="training-container">
      <View style={styles.header}>
        <Text style={styles.title}>Training</Text>
        <TouchableOpacity 
          style={styles.calendarButton}
          testID="calendar-view-button"
        >
          <Text style={styles.buttonText}>📅 Calendar</Text>
        </TouchableOpacity>
      </View>

      {!workoutActive ? (
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartWorkout}
          testID="start-workout-button"
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.liveSession} testID="live-session-container">
          <Text style={styles.sessionTitle}>🔥 Live Session</Text>
          <TouchableOpacity 
            style={styles.logSetButton}
            testID="log-set-button"
          >
            <Text style={styles.buttonText}>Log Set</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={handleFinishSession}
            testID="session-finish-button"
          >
            <Text style={styles.buttonText}>Finish Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setLiftModalVisible(true)}
          testID="lift-create-button"
        >
          <Text style={styles.actionButtonText}>➕ Log Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setAriaModalVisible(true)}
          testID="aria-chat-button"
        >
          <Text style={styles.actionButtonText}>🤖 ARIA Coach</Text>
        </TouchableOpacity>
      </View>

      {/* Lift Entry Modal */}
      <Modal
        visible={liftModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} testID="lift-create-modal">
            <Text style={styles.modalTitle}>Log Exercise</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Exercise"
              value={exercise}
              onChangeText={setExercise}
              testID="lift-exercise-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Weight (lbs)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              testID="lift-weight-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Reps"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              testID="lift-reps-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Sets"
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
              testID="lift-sets-input"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveLift}
                testID="lift-save-button"
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setLiftModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ARIA Chat Modal */}
      <Modal
        visible={ariaModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} testID="aria-chat-modal">
            <Text style={styles.modalTitle}>ARIA AI Coach</Text>
            
            <View style={styles.chatContainer} testID="aria-chat-container">
              <Text style={styles.chatMessage}>
                Hi! I'm ARIA, your AI fitness coach. How can I help you today?
              </Text>
            </View>
            
            <TextInput
              style={styles.chatInput}
              placeholder="Ask for a workout program..."
              value={chatInput}
              onChangeText={setChatInput}
              multiline
              testID="aria-chat-input"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSendChat}
                testID="aria-send-button"
              >
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setAriaModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarButton: {
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  liveSession: {
    backgroundColor: '#FEF3C7',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  logSetButton: {
    backgroundColor: '#F59E0B',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  chatContainer: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  chatMessage: {
    fontSize: 16,
    color: '#333',
  },
  chatInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    flex: 0.4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 8,
    flex: 0.4,
    alignItems: 'center',
  },
});