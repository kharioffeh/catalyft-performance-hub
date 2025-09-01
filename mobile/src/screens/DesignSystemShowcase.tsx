/**
 * Catalyft Fitness App - Design System Showcase
 * Demo screen showcasing all UI components
 */

import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Switch,
} from 'react-native';
import {
  Button,
  Input,
  Card,
  Modal,
  Toast,
  SkeletonListItem,
  SkeletonExerciseCard,
  EmptyState,
  withErrorBoundary,
  theme,
  type ToastRef,
  ProgressRing,
  WorkoutTimer,
  RepCounter,
  MacroChart,
  ExerciseCard,
} from '../components/ui';

// Define ExerciseData type
type ExerciseData = {
  id: string;
  name: string;
  category: string;
  muscle: string;
  equipment: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  restTime: number;
  sets: Array<{
    reps: number;
    weight: number;
    completed: boolean;
  }>;
  notes: string;
};

export const DesignSystemShowcase: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // State for interactive components
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'bottom-sheet' | 'center' | 'full'>('bottom-sheet');
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  
  // Refs
  const toastRef = useRef<ToastRef>(null);
  
  // Sample data
  const macroData = {
    protein: 150,
    carbs: 200,
    fat: 65,
    calories: 1985,
  };
  
  const exerciseData: ExerciseData = {
    id: '1',
    name: 'Bench Press',
    category: 'Strength',
    muscle: 'Chest',
    equipment: 'Barbell',
    targetSets: 4,
    targetReps: 10,
    targetWeight: 80,
    restTime: 90,
    sets: [
      { reps: 10, weight: 80, completed: true },
      { reps: 10, weight: 80, completed: true },
      { reps: 8, weight: 85, completed: false },
      { reps: 8, weight: 85, completed: false },
    ],
    notes: 'Focus on controlled movement and full range of motion',
  };
  
  // Section component
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Catalyft Design System
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Component Showcase
          </Text>
        </View>
          
          {/* Theme Toggle */}
          <Section title="Theme">
            <Card variant="outlined">
              <View style={styles.row}>
                <Text style={{ color: colors.text }}>Current Mode: {isDark ? 'Dark' : 'Light'}</Text>
              </View>
            </Card>
          </Section>
          
          {/* Buttons */}
          <Section title="Buttons">
            <View style={styles.buttonGrid}>
              <Button title="Primary" variant="primary" />
              <Button title="Secondary" variant="secondary" />
              <Button title="Success" variant="success" />
              <Button title="Warning" variant="warning" />
              <Button title="Error" variant="error" />
              <Button title="Ghost" variant="ghost" />
              <Button title="Outline" variant="outline" />
              <Button title="Disabled" disabled />
              <Button title="Loading" loading />
              <Button title="Small" size="small" />
              <Button title="Large" size="large" />
              <Button title="Full Width" fullWidth />
            </View>
          </Section>
          
          {/* Inputs */}
          <Section title="Inputs">
            <Input
              label="Standard Input"
              placeholder="Enter text..."
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Input
              label="With Error"
              placeholder="Enter email..."
              error="Invalid email address"
            />
            <Input
              label="With Success"
              placeholder="Enter password..."
              success
              successMessage="Strong password!"
              secureTextEntry
            />
            <Input
              variant="filled"
              label="Filled Variant"
              placeholder="Filled input..."
            />
            <Input
              variant="underlined"
              label="Underlined Variant"
              placeholder="Underlined input..."
            />
          </Section>
          
          {/* Cards */}
          <Section title="Cards">
            <Card variant="elevated">
              <Text style={{ color: colors.text }}>Elevated Card</Text>
              <Text style={{ color: colors.textSecondary }}>
                This card has elevation and shadow
              </Text>
            </Card>
            
            <View style={{ marginTop: theme.spacing.md }}>
              <Card variant="outlined">
                <Text style={{ color: colors.text }}>Outlined Card</Text>
                <Text style={{ color: colors.textSecondary }}>
                  This card has a border
                </Text>
              </Card>
            </View>
            
            <View style={{ marginTop: theme.spacing.md }}>
              <Card variant="filled">
                <Text style={{ color: colors.text }}>Filled Card</Text>
                <Text style={{ color: colors.textSecondary }}>
                  This card has a filled background
                </Text>
              </Card>
            </View>
          </Section>
          
          {/* Modals */}
          <Section title="Modals">
            <View style={styles.buttonGrid}>
              <Button
                title="Bottom Sheet"
                onPress={() => {
                  setModalType('bottom-sheet');
                  setModalVisible(true);
                }}
              />
              <Button
                title="Center Modal"
                onPress={() => {
                  setModalType('center');
                  setModalVisible(true);
                }}
              />
              <Button
                title="Full Screen"
                onPress={() => {
                  setModalType('full');
                  setModalVisible(true);
                }}
              />
            </View>
            
            <Modal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              type={modalType}
              title="Modal Example"
            >
              <Text style={{ color: colors.text }}>
                This is a {modalType} modal
              </Text>
              <View style={{ marginTop: theme.spacing.md }}>
                <Button
                  title="Close Modal"
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </Modal>
          </Section>
          
          {/* Toast Notifications */}
          <Section title="Toast Notifications">
            <View style={styles.buttonGrid}>
              <Button
                title="Success"
                variant="success"
                onPress={() => toastRef.current?.show({
                  message: 'Operation successful!',
                  type: 'success',
                })}
              />
              <Button
                title="Error"
                variant="error"
                onPress={() => toastRef.current?.show({
                  message: 'Something went wrong',
                  type: 'error',
                })}
              />
              <Button
                title="Warning"
                variant="warning"
                onPress={() => toastRef.current?.show({
                  message: 'Please be careful',
                  type: 'warning',
                })}
              />
              <Button
                title="Info"
                onPress={() => toastRef.current?.show({
                  message: 'Here\'s some information',
                  type: 'info',
                })}
              />
            </View>
            <Toast ref={toastRef} />
          </Section>
          
          {/* Progress Rings */}
          <Section title="Progress Rings">
            <View style={styles.progressGrid}>
              <ProgressRing progress={75} label="Daily Goal" />
              <ProgressRing progress={45} size={100} label="Calories" value={1200} unit="kcal" />
              <ProgressRing progress={90} size={80} strokeWidth={8} showPercentage />
              <ProgressRing 
                progress={60} 
                colors={[colors.primary, colors.secondary]} 
                label="Custom"
              />
            </View>
          </Section>
          
          {/* Workout Timer */}
          <Section title="Workout Timer">
            <WorkoutTimer
              mode="countdown"
              initialTime={60}
              showControls
            />
          </Section>
          
          {/* Rep Counter */}
          <Section title="Rep Counter">
            <RepCounter
              targetCount={12}
              totalSets={3}
              showSetInfo
            />
          </Section>
          
          {/* Macro Chart */}
          <Section title="Macro Chart">
            <MacroChart
              data={macroData}
              variant="donut"
              showLabels
              showPercentages
              showCalories
            />
            <View style={{ marginTop: theme.spacing.lg }}>
              <MacroChart
                data={macroData}
                variant="bars"
                target={{ protein: 180, carbs: 250, fat: 70 }}
              />
            </View>
          </Section>
          
          {/* Exercise Card */}
          <Section title="Exercise Card">
            <ExerciseCard
              exercise={exerciseData}
              showProgress
              showDetails
            />
          </Section>
          
          {/* Loading States */}
          <Section title="Loading States">
            <View style={styles.skeletonContainer}>
              <SkeletonListItem />
              <View style={{ marginTop: theme.spacing.md }}>
                <SkeletonExerciseCard />
              </View>
            </View>
          </Section>
          
          {/* Empty States */}
          <Section title="Empty States">
            <View style={{ height: 300 }}>
              <EmptyState
                type="no-workouts"
                onAction={() => console.log('Create workout')}
              />
            </View>
          </Section>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.textSecondary,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  skeletonContainer: {
    padding: theme.spacing.sm,
  },
});

export default withErrorBoundary(DesignSystemShowcase);