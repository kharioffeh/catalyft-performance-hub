import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showLabels?: boolean;
  stepLabels?: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  showLabels = false,
  stepLabels = [],
}) => {
  const renderStep = (index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const isUpcoming = index > currentStep;

    return (
      <View key={index} style={styles.stepContainer}>
        <View style={styles.stepWrapper}>
          {index > 0 && (
            <View
              style={[
                styles.connector,
                isCompleted && styles.connectorCompleted,
              ]}
            />
          )}
          <View
            style={[
              styles.step,
              isCompleted && styles.stepCompleted,
              isCurrent && styles.stepCurrent,
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  isCurrent && styles.stepNumberCurrent,
                ]}
              >
                {index + 1}
              </Text>
            )}
          </View>
        </View>
        {showLabels && stepLabels[index] && (
          <Text
            style={[
              styles.stepLabel,
              isCurrent && styles.stepLabelCurrent,
              isCompleted && styles.stepLabelCompleted,
            ]}
          >
            {stepLabels[index]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => renderStep(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCompleted: {
    backgroundColor: '#4ECDC4',
  },
  stepCurrent: {
    backgroundColor: '#6C63FF',
    elevation: 3,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  stepNumberCurrent: {
    color: 'white',
  },
  connector: {
    position: 'absolute',
    left: -50,
    right: 50,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  connectorCompleted: {
    backgroundColor: '#4ECDC4',
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#4ECDC4',
  },
});

export default ProgressIndicator;