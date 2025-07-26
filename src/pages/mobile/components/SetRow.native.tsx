import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet 
} from 'react-native';
import { Trash2, ChevronDown } from 'lucide-react';
import { Exercise } from '@/types/exercise';

interface SetRowProps {
  set: {
    id: string;
    exercise: string;
    weight: number;
    reps: number;
    rpe?: number;
    tempo?: string;
    velocity?: number;
  };
  exercises: Exercise[];
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
}

export const SetRowNative: React.FC<SetRowProps> = ({ set, exercises, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Exercise Selection */}
      <View style={styles.field}>
        <Text style={styles.label}>Exercise</Text>
        {/* Simple text input for now - in production you'd want a proper picker */}
        <TextInput
          style={styles.input}
          value={set.exercise}
          onChangeText={(value) => onUpdate('exercise', value)}
          placeholder="Enter exercise name..."
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>

      {/* Main Set Data - Weight and Reps */}
      <View style={styles.row}>
        <View style={[styles.field, styles.halfWidth]}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={set.weight ? set.weight.toString() : ''}
            onChangeText={(value) => onUpdate('weight', parseFloat(value) || 0)}
            placeholder="0"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.field, styles.halfWidth]}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={set.reps ? set.reps.toString() : ''}
            onChangeText={(value) => onUpdate('reps', parseInt(value) || 0)}
            placeholder="0"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Expandable Advanced Options */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <ChevronDown 
          size={16} 
          color="rgba(255,255,255,0.7)" 
          style={styles.chevron} 
        />
        <Text style={styles.expandText}>
          {isExpanded ? 'Hide' : 'Show'} Advanced Options
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* RPE */}
          <View style={styles.field}>
            <Text style={styles.label}>
              RPE (Rate of Perceived Exertion): {set.rpe || 'Not set'}
            </Text>
            <TextInput
              style={styles.input}
              value={set.rpe ? set.rpe.toString() : ''}
              onChangeText={(value) => onUpdate('rpe', parseInt(value) || undefined)}
              placeholder="1-10"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numeric"
            />
          </View>

          {/* Tempo */}
          <View style={styles.field}>
            <Text style={styles.label}>Tempo (e.g., 3-1-2-0)</Text>
            <TextInput
              style={styles.input}
              value={set.tempo || ''}
              onChangeText={(value) => onUpdate('tempo', value)}
              placeholder="3-1-2-0"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          {/* Velocity */}
          <View style={styles.field}>
            <Text style={styles.label}>Velocity (m/s)</Text>
            <TextInput
              style={styles.input}
              value={set.velocity ? set.velocity.toString() : ''}
              onChangeText={(value) => onUpdate('velocity', parseFloat(value) || undefined)}
              placeholder="0.75"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {/* Remove Button */}
      <View style={styles.removeSection}>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Trash2 size={16} color="#ef4444" />
          <Text style={styles.removeText}>Remove Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chevron: {
    marginRight: 8,
  },
  chevronExpanded: {
    marginRight: 8,
  },
  expandText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    marginTop: 8,
  },
  removeSection: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  removeText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
  },
});