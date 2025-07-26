import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SorenessScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

export const SorenessScreen: React.FC<SorenessScreenProps> = ({ navigation }) => {
  const { toast } = useToast();
  const [sorenessScore, setSorenessScore] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { error } = await supabase.functions.invoke('upsertSoreness', {
        body: {
          date: today,
          score: Math.round(sorenessScore)
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Soreness saved",
        description: `Logged soreness level ${Math.round(sorenessScore)} for today`,
      });

      // Navigate back
      navigation?.goBack();
    } catch (error) {
      console.error('Error saving soreness:', error);
      
      Alert.alert(
        "Error",
        "Failed to save soreness data. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glassPanel}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Daily Soreness</Text>
          <View style={styles.spacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Rate your overall muscle soreness level
          </Text>

          {/* Live Score Display */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Soreness Level</Text>
            <Text style={styles.scoreValue}>{Math.round(sorenessScore)}</Text>
            <Text style={styles.scoreSubtext}>out of 10</Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={sorenessScore}
              onValueChange={setSorenessScore}
              step={1}
              thumbTintColor="#00D4FF" // Electric blue
              minimumTrackTintColor="#00D4FF" // Electric blue
              maximumTrackTintColor="rgba(255,255,255,0.2)" // Charcoal
            />
            
            {/* Scale Labels */}
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>1</Text>
              <Text style={styles.scaleLabel}>No Pain</Text>
              <Text style={styles.scaleLabel}>10</Text>
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}></Text>
              <Text style={styles.scaleLabel}>Extreme Pain</Text>
              <Text style={styles.scaleLabel}></Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Soreness'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B23', // Brand charcoal
  },
  glassPanel: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    margin: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    color: '#00D4FF', // Electric blue
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  scoreSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginTop: 4,
  },
  sliderContainer: {
    marginBottom: 64,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scaleLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#00D4FF', // Electric blue
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(0, 212, 255, 0.5)',
  },
  saveButtonText: {
    color: '#1A1B23', // Dark text on blue background
    fontSize: 18,
    fontWeight: '600',
  },
});