/**
 * Catalyft Fitness App - Design System Demo
 * Comprehensive showcase of all enhanced design system components
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, CircularProgress, ProgressBar } from './index';
import { theme } from '../../theme';

export const DesignSystemDemo: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // State for interactive demos
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0.3);
  const [circularProgress, setCircularProgress] = useState(0.6);
  
  // Demo sections
  const renderColorPalette = () => (
    <Card variant="elevated" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral.textHeading }]}>
        Color Palette
      </Text>
      <View style={styles.colorGrid}>
        <View style={styles.colorItem}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.brand.primaryBlue }]} />
          <Text style={[styles.colorLabel, { color: colors.neutral.textBody }]}>Primary Blue</Text>
        </View>
        <View style={styles.colorItem}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.brand.primaryGreen }]} />
          <Text style={[styles.colorLabel, { color: colors.neutral.textBody }]}>Primary Green</Text>
        </View>
        <View style={styles.colorItem}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.brand.accentOrange }]} />
          <Text style={[styles.colorLabel, { color: colors.neutral.textBody }]}>Accent Orange</Text>
        </View>
        <View style={styles.colorItem}>
          <View style={[styles.colorSwatch, { backgroundColor: colors.brand.dangerRed }]} />
          <Text style={[styles.colorLabel, { color: colors.neutral.textBody }]}>Danger Red</Text>
        </View>
      </View>
    </Card>
  );
  
  const renderTypography = () => (
    <Card variant="elevated" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral.textHeading }]}>
        Typography
      </Text>
      <Text style={[styles.h1, { color: colors.neutral.textHeading }]}>
        Heading 1 - 32px Bold
      </Text>
      <Text style={[styles.h2, { color: colors.neutral.textHeading }]}>
        Heading 2 - 24px Semibold
      </Text>
      <Text style={[styles.h3, { color: colors.neutral.textHeading }]}>
        Heading 3 - 20px Medium
      </Text>
      <Text style={[styles.body, { color: colors.neutral.textBody }]}>
        Body text - 16px Regular with proper line height for optimal readability
      </Text>
      <Text style={[styles.caption, { color: colors.neutral.textMuted }]}>
        Caption - 14px Regular for secondary information
      </Text>
      <Text style={[styles.label, { color: colors.neutral.textBody }]}>
        LABEL - 12px Semibold Uppercase
      </Text>
    </Card>
  );
  
  const renderButtons = () => (
    <Card variant="elevated" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral.textHeading }]}>
        Buttons
      </Text>
      
      {/* Button Variants */}
      <Text style={[styles.subsectionTitle, { color: colors.neutral.textBody }]}>
        Variants
      </Text>
      <View style={styles.buttonRow}>
        <Button
          title="Primary"
          variant="primary"
          size="md"
          onPress={() => {}}
        />
        <Button
          title="Secondary"
          variant="secondary"
          size="md"
          onPress={() => {}}
        />
        <Button
          title="Outline"
          variant="outline"
          size="md"
          onPress={() => {}}
        />
        <Button
          title="Ghost"
          variant="ghost"
          size="md"
          onPress={() => {}}
        />
      </View>
      
      {/* Button Sizes */}
      <Text style={[styles.subsectionTitle, { color: colors.neutral.textBody }]}>
        Sizes
      </Text>
      <View style={styles.buttonRow}>
        <Button title="Small" variant="primary" size="sm" onPress={() => {}} />
        <Button title="Medium" variant="primary" size="md" onPress={() => {}} />
        <Button title="Large" variant="primary" size="lg" onPress={() => {}} />
        <Button title="XLarge" variant="primary" size="xl" onPress={() => {}} />
      </View>
      
      {/* Button States */}
      <Text style={[styles.subsectionTitle, { color: colors.neutral.textBody }]}>
        States
      </Text>
      <View style={styles.buttonRow}>
        <Button title="Loading" variant="primary" loading onPress={() => {}} />
        <Button title="Disabled" variant="primary" disabled onPress={() => {}} />
        <Button
          title="With Icon"
          variant="primary"
          icon={<Ionicons name="star" size={20} color="#FFFFFF" />}
          onPress={() => {}}
        />
      </View>
    </Card>
  );
  
  const renderCards = () => (
    <Card variant="elevated" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral.textHeading }]}>
        Cards
      </Text>
      
      <View style={styles.cardRow}>
        <Card variant="elevated" size="small" style={styles.demoCard}>
          <Text style={[styles.cardTitle, { color: colors.neutral.textHeading }]}>
            Elevated Card
          </Text>
          <Text style={[styles.cardText, { color: colors.neutral.textBody }]}>
            With shadow and elevation
          </Text>
        </Card>
        
        <Card variant="outlined" size="small" style={styles.demoCard}>
          <Text style={[styles.cardTitle, { color: colors.neutral.textHeading }]}>
            Outlined Card
          </Text>
          <Text style={[styles.cardText, { color: colors.neutral.textBody }]}>
            With border outline
          </Text>
        </Card>
      </View>
      
      <Card variant="glass" size="medium" style={styles.glassCard}>
        <Text style={[styles.cardTitle, { color: colors.neutral.textHeading }]}>
          Glass Card
        </Text>
        <Text style={[styles.cardText, { color: colors.neutral.textBody }]}>
          With blur effect and transparency
        </Text>
      </Card>
    </Card>
  );
  
  const renderInputs = () => (
    <Card variant="elevated" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral.textHeading }]}>
        Input Fields
      </Text>
      
      <Input
        label="Floating Label"
        placeholder="Type something..."
        value={inputValue}
        onChangeText={setInputValue}
        size="md"
        style={styles.input}
      />
      
      <Input
        label="With Left Icon"
        placeholder="Search..."
        leftIcon={<Ionicons name="search" size={20} color={colors.neutral.textMuted} />}
        size="md"
        style={styles.input}
      />
      
      <Input
        label="With Right Icon"
        placeholder="Password"
        rightIcon={<Ionicons name="eye" size={20} color={colors.neutral.textMuted} />}
        size="md"
        style={styles.input}
      />
      
      <Input
        label="Clearable Input"
        placeholder="Clear me..."
        value={inputValue}
        onChangeText={setInputValue}
        clearable
        size="md"
        style={styles.input}
      />
      
      <Input
        label="Error State"
        placeholder="This has an error"
        error="This field is required"
        size="md"
        style={styles.input}
      />
      
      <Input
        label="Success State"
        placeholder="This is valid"
        success
        size="md"
        style={styles.input}
      />
    </Card>
  );
  
  const renderProgress = () => (
    <Card variant="elevated" style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.neutral.textHeading }]}>
        Progress Components
      </Text>
      
      {/* Circular Progress */}
      <Text style={[styles.subsectionTitle, { color: colors.neutral.textBody }]}>
        Circular Progress
      </Text>
      <View style={styles.progressRow}>
        <CircularProgress
          progress={circularProgress}
          size="sm"
          label="Small"
        />
        <CircularProgress
          progress={circularProgress}
          size="md"
          showPercentage
        />
        <CircularProgress
          progress={circularProgress}
          size="lg"
          strokeGradient={[colors.brand.primaryBlue, colors.brand.primaryGreen]}
          label="Gradient"
        />
      </View>
      
      {/* Progress Bars */}
      <Text style={[styles.subsectionTitle, { color: colors.neutral.textBody }]}>
        Progress Bars
      </Text>
      <ProgressBar
        progress={progress}
        showLabel
        label="Basic Progress"
        style={styles.progressBar}
      />
      
      <ProgressBar
        progress={progress}
        showLabel
        showValue
        label="With Value"
        style={styles.progressBar}
      />
      
      <ProgressBar
        progress={progress}
        showLabel
        label="Gradient Progress"
        progressGradient={[colors.brand.primaryBlue, colors.brand.primaryGreen]}
        style={styles.progressBar}
      />
      
      {/* Interactive Progress */}
      <View style={styles.progressControls}>
        <Button
          title="Increase"
          variant="outline"
          size="sm"
          onPress={() => setProgress(Math.min(1, progress + 0.1))}
        />
        <Button
          title="Decrease"
          variant="outline"
          size="sm"
          onPress={() => setProgress(Math.max(0, progress - 0.1))}
        />
        <Button
          title="Reset"
          variant="ghost"
          size="sm"
          onPress={() => setProgress(0.3)}
        />
      </View>
    </Card>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.neutral.textHeading }]}>
            CataLyft Design System
          </Text>
          <Text style={[styles.subtitle, { color: colors.neutral.textMuted }]}>
            Enhanced UI Components & Theme
          </Text>
        </View>
        
        {renderColorPalette()}
        {renderTypography()}
        {renderButtons()}
        {renderCards()}
        {renderInputs()}
        {renderProgress()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  section: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.md,
  },
  subsectionTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  colorItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
  },
  colorLabel: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  demoCard: {
    flex: 1,
    minHeight: 100,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  cardTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    ...theme.typography.body,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    marginBottom: theme.spacing.md,
  },
  progressControls: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  h1: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  h2: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.sm,
  },
  h3: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  body: {
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  caption: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.sm,
  },
});