import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const UnitsSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [useMetric, setUseMetric] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [heightUnit, setHeightUnit] = useState('ft');
  const [distanceUnit, setDistanceUnit] = useState('miles');
  const [temperatureUnit, setTemperatureUnit] = useState('fahrenheit');

  const weightUnits = [
    { id: 'lbs', name: 'Pounds (lbs)', symbol: 'lbs', example: '165 lbs' },
    { id: 'kg', name: 'Kilograms (kg)', symbol: 'kg', example: '75 kg' },
    { id: 'st', name: 'Stone (st)', symbol: 'st', example: '11 st 9 lbs' },
  ];

  const heightUnits = [
    { id: 'ft', name: 'Feet & Inches', symbol: 'ft', example: '5\'10"' },
    { id: 'cm', name: 'Centimeters', symbol: 'cm', example: '178 cm' },
    { id: 'm', name: 'Meters', symbol: 'm', example: '1.78 m' },
  ];

  const distanceUnits = [
    { id: 'miles', name: 'Miles', symbol: 'mi', example: '3.2 mi' },
    { id: 'km', name: 'Kilometers', symbol: 'km', example: '5.1 km' },
    { id: 'm', name: 'Meters', symbol: 'm', example: '5100 m' },
  ];

  const temperatureUnits = [
    { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', example: '72°F' },
    { id: 'celsius', name: 'Celsius', symbol: '°C', example: '22°C' },
  ];

  const handleUnitChange = (category: string, unit: string) => {
    switch (category) {
      case 'weight':
        setWeightUnit(unit);
        break;
      case 'height':
        setHeightUnit(unit);
        break;
      case 'distance':
        setDistanceUnit(unit);
        break;
      case 'temperature':
        setTemperatureUnit(unit);
        break;
    }
  };

  const handleMetricToggle = (enabled: boolean) => {
    setUseMetric(enabled);
    if (enabled) {
      // Auto-convert to metric units
      setWeightUnit('kg');
      setHeightUnit('cm');
      setDistanceUnit('km');
      setTemperatureUnit('celsius');
    } else {
      // Auto-convert to imperial units
      setWeightUnit('lbs');
      setHeightUnit('ft');
      setDistanceUnit('miles');
      setTemperatureUnit('fahrenheit');
    }
  };

  const handleAutoDetect = (enabled: boolean) => {
    setAutoDetect(enabled);
    if (enabled) {
      Alert.alert(
        'Auto-Detect Units',
        'Units will automatically adjust based on your location and system preferences'
      );
    }
  };

  const renderUnitOption = (unit: any, category: string, currentUnit: string) => (
    <TouchableOpacity
      key={unit.id}
      style={[
        styles.unitOption,
        currentUnit === unit.id && styles.selectedUnit
      ]}
      onPress={() => handleUnitChange(category, unit.id)}
    >
      <View style={styles.unitOptionLeft}>
        <View style={styles.unitIcon}>
          <Ionicons 
            name={category === 'weight' ? 'scale-outline' : 
                  category === 'height' ? 'resize-outline' :
                  category === 'distance' ? 'map-outline' : 'thermometer-outline'} 
            size={20} 
            color={currentUnit === unit.id ? '#007AFF' : '#8E8E93'} 
          />
        </View>
        <View style={styles.unitInfo}>
          <Text style={[
            styles.unitName,
            currentUnit === unit.id && styles.selectedUnitName
          ]}>{unit.name}</Text>
          <Text style={styles.unitExample}>{unit.example}</Text>
        </View>
      </View>
      {currentUnit === unit.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark" size={20} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderUnitSection = (title: string, units: any[], category: string, currentUnit: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {units.map((unit) => renderUnitOption(unit, category, currentUnit))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Units & Measurements</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Global Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Settings</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="globe-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Use Metric System</Text>
                  <Text style={styles.settingSubtitle}>
                    Automatically convert all measurements to metric units
                  </Text>
                </View>
              </View>
              <Switch
                value={useMetric}
                onValueChange={handleMetricToggle}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={useMetric ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="location-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Auto-Detect Units</Text>
                  <Text style={styles.settingSubtitle}>
                    Automatically detect units based on your location
                  </Text>
                </View>
              </View>
              <Switch
                value={autoDetect}
                onValueChange={handleAutoDetect}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={autoDetect ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* Weight Units */}
        {renderUnitSection('Weight', weightUnits, 'weight', weightUnit)}

        {/* Height Units */}
        {renderUnitSection('Height', heightUnits, 'height', heightUnit)}

        {/* Distance Units */}
        {renderUnitSection('Distance', distanceUnits, 'distance', distanceUnit)}

        {/* Temperature Units */}
        {renderUnitSection('Temperature', temperatureUnits, 'temperature', temperatureUnit)}

        {/* Conversion Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversion Examples</Text>
          <View style={styles.sectionContent}>
            <View style={styles.conversionCard}>
              <View style={styles.conversionHeader}>
                <Ionicons name="calculator-outline" size={20} color="#007AFF" />
                <Text style={styles.conversionTitle}>Quick Conversions</Text>
              </View>
              
              <View style={styles.conversionExamples}>
                <View style={styles.conversionExample}>
                  <Text style={styles.conversionLabel}>Weight:</Text>
                  <Text style={styles.conversionValue}>165 lbs ≈ 75 kg</Text>
                </View>
                
                <View style={styles.conversionExample}>
                  <Text style={styles.conversionLabel}>Height:</Text>
                  <Text style={styles.conversionValue}>5'10" ≈ 178 cm</Text>
                </View>
                
                <View style={styles.conversionExample}>
                  <Text style={styles.conversionLabel}>Distance:</Text>
                  <Text style={styles.conversionValue}>3.2 mi ≈ 5.1 km</Text>
                </View>
                
                <View style={styles.conversionExample}>
                  <Text style={styles.conversionLabel}>Temperature:</Text>
                  <Text style={styles.conversionValue}>72°F ≈ 22°C</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="sync-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Sync with Device</Text>
                  <Text style={styles.settingSubtitle}>
                    Use the same units as your device settings
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Unit Help</Text>
                  <Text style={styles.settingSubtitle}>
                    Learn about different measurement systems
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    margin: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    color: '#000000',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedUnit: {
    backgroundColor: '#F0F8FF',
  },
  unitOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  selectedUnitName: {
    color: '#007AFF',
    fontWeight: '500',
  },
  unitExample: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversionCard: {
    padding: 20,
  },
  conversionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  conversionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  conversionExamples: {
    gap: 12,
  },
  conversionExample: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  conversionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  conversionValue: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
});