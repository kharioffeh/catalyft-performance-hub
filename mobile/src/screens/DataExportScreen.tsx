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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export const DataExportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [exporting, setExporting] = useState(false);
  const [includeWorkouts, setIncludeWorkouts] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [includeBodyMetrics, setIncludeBodyMetrics] = useState(true);
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeSocial, setIncludeSocial] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [dateRange, setDateRange] = useState('all');

  const exportFormats = [
    { id: 'json', name: 'JSON', description: 'Machine-readable format', icon: 'code-outline' },
    { id: 'csv', name: 'CSV', description: 'Spreadsheet compatible', icon: 'grid-outline' },
    { id: 'pdf', name: 'PDF', description: 'Printable report', icon: 'document-outline' },
  ];

  const dateRanges = [
    { id: 'all', name: 'All Time', description: 'Complete data history' },
    { id: 'year', name: 'This Year', description: 'Data from current year' },
    { id: 'month', name: 'This Month', description: 'Data from current month' },
    { id: 'week', name: 'This Week', description: 'Data from current week' },
  ];

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setExporting(false);
      Alert.alert(
        'Export Complete',
        'Your data has been exported successfully! Check your email for the download link.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }, 3000);
  };

  const renderFormatOption = (format: any) => (
    <TouchableOpacity
      key={format.id}
      style={[
        styles.formatOption,
        exportFormat === format.id && styles.selectedFormat
      ]}
      onPress={() => setExportFormat(format.id)}
    >
      <View style={styles.formatOptionLeft}>
        <View style={[
          styles.formatIcon,
          exportFormat === format.id && styles.selectedFormatIcon
        ]}>
          <Icon 
            name={format.icon} 
            size={20} 
            color={exportFormat === format.id ? '#FFFFFF' : '#007AFF'} 
          />
        </View>
        <View style={styles.formatInfo}>
          <Text style={[
            styles.formatName,
            exportFormat === format.id && styles.selectedFormatName
          ]}>{format.name}</Text>
          <Text style={styles.formatDescription}>{format.description}</Text>
        </View>
      </View>
      {exportFormat === format.id && (
        <View style={styles.selectedFormatIndicator}>
          <Icon name="checkmark" size={20} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDateRangeOption = (range: any) => (
    <TouchableOpacity
      key={range.id}
      style={[
        styles.dateRangeOption,
        dateRange === range.id && styles.selectedDateRange
      ]}
      onPress={() => setDateRange(range.id)}
    >
      <View style={styles.dateRangeOptionLeft}>
        <View style={[
          styles.dateRangeIcon,
          dateRange === range.id && styles.selectedDateRangeIcon
        ]}>
          <Icon 
            name="calendar-outline" 
            size={20} 
            color={dateRange === range.id ? '#FFFFFF' : '#007AFF'} 
          />
        </View>
        <View style={styles.dateRangeInfo}>
          <Text style={[
            styles.dateRangeName,
            dateRange === range.id && styles.selectedDateRangeName
          ]}>{range.name}</Text>
          <Text style={styles.dateRangeDescription}>{range.description}</Text>
        </View>
      </View>
      {dateRange === range.id && (
        <View style={styles.selectedDateRangeIndicator}>
          <Icon name="checkmark" size={20} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const getSelectedDataSize = () => {
    let size = 0;
    if (includeWorkouts) size += 45;
    if (includeNutrition) size += 32;
    if (includeBodyMetrics) size += 18;
    if (includeProgress) size += 28;
    if (includeSocial) size += 15;
    return size;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Data</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Export Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Icon name="download" size={32} color="#007AFF" />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewTitle}>Export Your Fitness Data</Text>
              <Text style={styles.overviewSubtitle}>
                Download your complete fitness journey in your preferred format
              </Text>
            </View>
          </View>
          
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getSelectedDataSize()}</Text>
              <Text style={styles.statLabel}>MB</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Formats</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24h</Text>
              <Text style={styles.statLabel}>Processing</Text>
            </View>
          </View>
        </View>

        {/* Data Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Export</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="fitness-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Workout Data</Text>
                  <Text style={styles.settingSubtitle}>
                    All your workout sessions, exercises, and performance metrics
                  </Text>
                </View>
              </View>
              <Switch
                value={includeWorkouts}
                onValueChange={setIncludeWorkouts}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={includeWorkouts ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="nutrition-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Nutrition Data</Text>
                  <Text style={styles.settingSubtitle}>
                    Meal logs, calorie tracking, and nutrition goals
                  </Text>
                </View>
              </View>
              <Switch
                value={includeNutrition}
                onValueChange={setIncludeNutrition}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={includeNutrition ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="body-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Body Metrics</Text>
                  <Text style={styles.settingSubtitle}>
                    Weight, measurements, and body composition data
                  </Text>
                </View>
              </View>
              <Switch
                value={includeBodyMetrics}
                onValueChange={setIncludeBodyMetrics}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={includeBodyMetrics ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="trending-up-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Progress Tracking</Text>
                  <Text style={styles.settingSubtitle}>
                    Goals, achievements, and progress over time
                  </Text>
                </View>
              </View>
              <Switch
                value={includeProgress}
                onValueChange={setIncludeProgress}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={includeProgress ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="people-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Social Data</Text>
                  <Text style={styles.settingSubtitle}>
                    Friends, challenges, and social interactions
                  </Text>
                </View>
              </View>
              <Switch
                value={includeSocial}
                onValueChange={setIncludeSocial}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={includeSocial ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* Export Format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.sectionContent}>
            {exportFormats.map(renderFormatOption)}
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.sectionContent}>
            {dateRanges.map(renderDateRangeOption)}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="mail-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Email Export</Text>
                  <Text style={styles.settingSubtitle}>
                    Receive download link via email
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="cloud-upload-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Cloud Storage</Text>
                  <Text style={styles.settingSubtitle}>
                    Save directly to iCloud, Google Drive, or Dropbox
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.exportButtonSection}>
          <TouchableOpacity
            style={[
              styles.exportButton,
              exporting && styles.exportButtonDisabled
            ]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Icon name="download" size={24} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export Data</Text>
              </>
            )}
          </TouchableOpacity>
          
          {exporting && (
            <Text style={styles.exportStatus}>
              Preparing your export... This may take a few minutes.
            </Text>
          )}
        </View>

        {/* Export Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Icon name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Export Information</Text>
          </View>
          <Text style={styles.infoText}>
            Your data will be processed and prepared for download. Large exports may take up to 24 hours to process. You'll receive an email notification when your export is ready.
          </Text>
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
  overviewSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
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
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedFormat: {
    backgroundColor: '#F0F8FF',
  },
  formatOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  formatIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedFormatIcon: {
    backgroundColor: '#007AFF',
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  selectedFormatName: {
    color: '#007AFF',
    fontWeight: '500',
  },
  formatDescription: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectedFormatIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedDateRange: {
    backgroundColor: '#F0F8FF',
  },
  dateRangeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateRangeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedDateRangeIcon: {
    backgroundColor: '#007AFF',
  },
  dateRangeInfo: {
    flex: 1,
  },
  dateRangeName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  selectedDateRangeName: {
    color: '#007AFF',
    fontWeight: '500',
  },
  dateRangeDescription: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectedDateRangeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonSection: {
    margin: 16,
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  exportButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  exportStatus: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  infoSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
});