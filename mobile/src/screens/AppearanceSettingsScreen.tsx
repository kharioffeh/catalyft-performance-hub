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
import Icon from 'react-native-vector-icons/Ionicons';

export const AppearanceSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const [autoTheme, setAutoTheme] = useState(true);
  const [accentColor, setAccentColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [boldText, setBoldText] = useState(false);

  const accentColors = [
    { id: 'blue', name: 'Blue', color: '#007AFF', icon: 'water' },
    { id: 'green', name: 'Green', color: '#34C759', icon: 'leaf' },
    { id: 'purple', name: 'Purple', color: '#AF52DE', icon: 'flower' },
    { id: 'orange', name: 'Orange', color: '#FF9500', icon: 'sunny' },
    { id: 'red', name: 'Red', color: '#FF3B30', icon: 'heart' },
    { id: 'pink', name: 'Pink', color: '#FF2D92', icon: 'rose' },
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', size: 14 },
    { id: 'medium', name: 'Medium', size: 16 },
    { id: 'large', name: 'Large', size: 18 },
    { id: 'extraLarge', name: 'Extra Large', size: 20 },
  ];

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    if (isDark) {
      setAutoTheme(false);
    }
  };

  const handleAutoThemeChange = (enabled: boolean) => {
    setAutoTheme(enabled);
    if (enabled) {
      // In a real app, this would detect system theme
      Alert.alert('Auto Theme', 'Theme will automatically adjust based on your system settings');
    }
  };

  const renderThemePreview = (isDark: boolean, label: string) => (
    <TouchableOpacity
      style={[
        styles.themePreview,
        isDark ? styles.darkPreview : styles.lightPreview,
        darkMode === isDark && styles.selectedTheme
      ]}
      onPress={() => handleThemeChange(isDark)}
    >
      <View style={[
        styles.previewHeader,
        isDark ? styles.darkPreviewHeader : styles.lightPreviewHeader
      ]}>
        <View style={[
          styles.previewStatusBar,
          isDark ? styles.darkStatusBar : styles.lightStatusBar
        ]}>
          <Text style={[
            styles.statusBarText,
            isDark ? styles.darkStatusBarText : styles.lightStatusBarText
          ]}>9:41</Text>
          <View style={styles.statusBarIcons}>
            <View style={[
              styles.statusBarIcon,
              isDark ? styles.darkStatusBarIcon : styles.lightStatusBarIcon
            ]} />
            <View style={[
              styles.statusBarIcon,
              isDark ? styles.darkStatusBarIcon : styles.lightStatusBarIcon
            ]} />
          </View>
        </View>
      </View>
      
      <View style={[
        styles.previewContent,
        isDark ? styles.darkPreviewContent : styles.lightPreviewContent
      ]}>
        <View style={[
          styles.previewCard,
          isDark ? styles.darkPreviewCard : styles.lightPreviewCard
        ]}>
          <View style={[
            styles.previewCardHeader,
            isDark ? styles.darkPreviewCardHeader : styles.lightPreviewCardHeader
          ]} />
          <View style={[
            styles.previewCardContent,
            isDark ? styles.darkPreviewCardContent : styles.lightPreviewCardContent
          ]} />
        </View>
        
        <View style={[
          styles.previewButton,
          isDark ? styles.darkPreviewButton : styles.lightPreviewButton
        ]}>
          <Text style={[
            styles.previewButtonText,
            isDark ? styles.darkPreviewButtonText : styles.lightPreviewButtonText
          ]}>Button</Text>
        </View>
      </View>
      
      <Text style={[
        styles.themeLabel,
        darkMode === isDark && styles.selectedThemeLabel
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderAccentColorOption = (colorOption: any) => (
    <TouchableOpacity
      key={colorOption.id}
      style={[
        styles.accentColorOption,
        accentColor === colorOption.id && styles.selectedAccentColor
      ]}
      onPress={() => setAccentColor(colorOption.id)}
    >
      <View style={[
        styles.accentColorCircle,
        { backgroundColor: colorOption.color }
      ]}>
        {accentColor === colorOption.id && (
          <Icon name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
      <Text style={[
        styles.accentColorName,
        accentColor === colorOption.id && styles.selectedAccentColorName
      ]}>{colorOption.name}</Text>
    </TouchableOpacity>
  );

  const renderFontSizeOption = (fontOption: any) => (
    <TouchableOpacity
      key={fontOption.id}
      style={[
        styles.fontSizeOption,
        fontSize === fontOption.id && styles.selectedFontSize
      ]}
      onPress={() => setFontSize(fontOption.id)}
    >
      <Text style={[
        styles.fontSizePreview,
        { fontSize: fontOption.size },
        fontSize === fontOption.id && styles.selectedFontSizePreview
      ]}>Aa</Text>
      <Text style={[
        styles.fontSizeName,
        fontSize === fontOption.id && styles.selectedFontSizeName
      ]}>{fontOption.name}</Text>
    </TouchableOpacity>
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
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appearance</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.sectionContent}>
            <View style={styles.themeToggleContainer}>
              <View style={styles.themeToggleInfo}>
                <Text style={styles.themeToggleTitle}>Dark Mode</Text>
                <Text style={styles.themeToggleSubtitle}>
                  Switch between light and dark themes
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleThemeChange}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>
            
            <View style={styles.themeToggleContainer}>
              <View style={styles.themeToggleInfo}>
                <Text style={styles.themeToggleTitle}>Auto Theme</Text>
                <Text style={styles.themeToggleSubtitle}>
                  Automatically adjust based on system
                </Text>
              </View>
              <Switch
                value={autoTheme}
                onValueChange={handleAutoThemeChange}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={autoTheme ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* Theme Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.themePreviewContainer}>
            {renderThemePreview(false, 'Light')}
            {renderThemePreview(true, 'Dark')}
          </View>
        </View>

        {/* Accent Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accent Color</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionDescription}>
              Choose your preferred accent color for buttons and highlights
            </Text>
            <View style={styles.accentColorGrid}>
              {accentColors.map(renderAccentColorOption)}
            </View>
          </View>
        </View>

        {/* Font Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionDescription}>
              Adjust the size of text throughout the app
            </Text>
            <View style={styles.fontSizeGrid}>
              {fontSizes.map(renderFontSizeOption)}
            </View>
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="eye-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Bold Text</Text>
                  <Text style={styles.settingSubtitle}>Make text bold throughout the app</Text>
                </View>
              </View>
              <Switch
                value={boldText}
                onValueChange={setBoldText}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={boldText ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="move-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Reduce Motion</Text>
                  <Text style={styles.settingSubtitle}>Minimize animations and transitions</Text>
                </View>
              </View>
              <Switch
                value={reducedMotion}
                onValueChange={setReducedMotion}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor={reducedMotion ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="grid-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Grid Layout</Text>
                  <Text style={styles.settingSubtitle}>Choose between list and grid views</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="image-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Image Quality</Text>
                  <Text style={styles.settingSubtitle}>Balance quality and performance</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  themeToggleInfo: {
    flex: 1,
  },
  themeToggleTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  themeToggleSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  themePreviewContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
  },
  themePreview: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  selectedTheme: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  lightPreview: {
    backgroundColor: '#FFFFFF',
  },
  darkPreview: {
    backgroundColor: '#1C1C1E',
  },
  previewHeader: {
    width: '100%',
    marginBottom: 12,
  },
  lightPreviewHeader: {
    backgroundColor: '#F2F2F7',
  },
  darkPreviewHeader: {
    backgroundColor: '#2C2C2E',
  },
  previewStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lightStatusBar: {
    backgroundColor: '#F2F2F7',
  },
  darkStatusBar: {
    backgroundColor: '#2C2C2E',
  },
  statusBarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lightStatusBarText: {
    color: '#000000',
  },
  darkStatusBarText: {
    color: '#FFFFFF',
  },
  statusBarIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBarIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  lightStatusBarIcon: {
    backgroundColor: '#000000',
  },
  darkStatusBarIcon: {
    backgroundColor: '#FFFFFF',
  },
  previewContent: {
    alignItems: 'center',
    gap: 8,
  },
  lightPreviewContent: {
    backgroundColor: '#FFFFFF',
  },
  darkPreviewContent: {
    backgroundColor: '#1C1C1E',
  },
  previewCard: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
  lightPreviewCard: {
    backgroundColor: '#F2F2F7',
  },
  darkPreviewCard: {
    backgroundColor: '#2C2C2E',
  },
  previewCardHeader: {
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lightPreviewCardHeader: {
    backgroundColor: '#007AFF',
  },
  darkPreviewCardHeader: {
    backgroundColor: '#0A84FF',
  },
  previewCardContent: {
    height: 32,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  lightPreviewCardContent: {
    backgroundColor: '#F2F2F7',
  },
  darkPreviewCardContent: {
    backgroundColor: '#2C2C2E',
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  lightPreviewButton: {
    backgroundColor: '#007AFF',
  },
  darkPreviewButton: {
    backgroundColor: '#0A84FF',
  },
  previewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lightPreviewButtonText: {
    color: '#FFFFFF',
  },
  darkPreviewButtonText: {
    color: '#FFFFFF',
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 8,
  },
  selectedThemeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  accentColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  accentColorOption: {
    alignItems: 'center',
    width: '30%',
  },
  selectedAccentColor: {
    transform: [{ scale: 1.05 }],
  },
  accentColorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  selectedAccentColor: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  accentColorName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedAccentColorName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  fontSizeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fontSizeOption: {
    alignItems: 'center',
    flex: 1,
  },
  selectedFontSize: {
    transform: [{ scale: 1.05 }],
  },
  fontSizePreview: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  selectedFontSizePreview: {
    color: '#007AFF',
  },
  fontSizeName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedFontSizeName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
});