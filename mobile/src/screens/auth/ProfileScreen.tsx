import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import ReactNativeBiometrics from 'react-native-biometrics';
import {
  AuthInput,
  AuthButton,
} from '../../components/auth/AuthComponents';
import { useAuth, profileSchema, updatePasswordSchema } from '../../hooks/useAuth';

interface ProfileFormData {
  fullName?: string;
  phone?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: auth.user?.user_metadata?.full_name || '',
      phone: auth.user?.user_metadata?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    checkBiometricAvailability();
    if (auth.user?.user_metadata?.avatar_url) {
      setAvatarUri(auth.user.user_metadata.avatar_url);
    }
  }, [auth.user]);

  const checkBiometricAvailability = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    setBiometricAvailable(available);
    if (biometryType) {
      setBiometricType(biometryType === 'FaceID' ? 'Face ID' : 
                       biometryType === 'TouchID' ? 'Touch ID' : 
                       biometryType);
    }
  };

  const handleProfileSubmit = async (data: ProfileFormData) => {
    const result = await auth.updateProfile({
      full_name: data.fullName,
      phone: data.phone,
    });

    if (result.success) {
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    const result = await auth.updatePassword(data.newPassword);

    if (result.success) {
      setIsChangingPassword(false);
      passwordForm.reset();
      Alert.alert('Success', 'Password updated successfully');
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to update password');
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 512,
      maxWidth: 512,
      quality: 0.8,
    };

    launchImageLibrary(options as any, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage || !response.assets?.[0]) {
        return;
      }

      const asset = response.assets[0];
      if (asset.uri) {
        const result = await auth.uploadAvatar({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'avatar.jpg',
        });

        if (result.success && result.url) {
          setAvatarUri(result.url);
          Alert.alert('Success', 'Profile photo updated successfully');
        } else {
          Alert.alert('Error', result.error?.message || 'Failed to upload photo');
        }
      }
    });
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await auth.enableBiometric();
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to enable biometric authentication');
      }
    } else {
      await auth.disableBiometric();
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await auth.signOut();
            // Navigation will be handled by AuthContext
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            // Implement account deletion
            Alert.alert('Info', 'Account deletion will be implemented soon');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePicker} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {auth.user?.email?.[0].toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.email}>{auth.user?.email}</Text>
        <Text style={styles.memberSince}>
          Member since {new Date(auth.user?.created_at || '').toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.tabActive]}
          onPress={() => setActiveTab('security')}
        >
          <Text style={[styles.tabText, activeTab === 'security' && styles.tabTextActive]}>
            Security
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditingProfile && (
              <TouchableOpacity onPress={() => setIsEditingProfile(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingProfile ? (
            <View style={styles.form}>
              <Controller
                control={profileForm.control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={profileForm.formState.errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={profileForm.control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Phone Number"
                    placeholder="+1234567890"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    error={profileForm.formState.errors.phone?.message}
                  />
                )}
              />

              <View style={styles.formButtons}>
                <AuthButton
                  title="Save Changes"
                  onPress={profileForm.handleSubmit(handleProfileSubmit)}
                  loading={auth.isLoading}
                />
                <AuthButton
                  title="Cancel"
                  onPress={() => {
                    setIsEditingProfile(false);
                    profileForm.reset();
                  }}
                  variant="outline"
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>
                  {auth.user?.user_metadata?.full_name || 'Not set'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>
                  {auth.user?.user_metadata?.phone || 'Not set'}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>

          {biometricAvailable && (
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{biometricType} Authentication</Text>
                <Text style={styles.settingDescription}>
                  Use {biometricType} for quick and secure sign in
                </Text>
              </View>
              <Switch
                value={auth.biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          <View style={styles.settingItem}>
            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => setIsChangingPassword(!isChangingPassword)}
            >
              <Text style={styles.settingButtonText}>Change Password</Text>
              <Text style={styles.settingButtonIcon}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {isChangingPassword && (
            <View style={styles.form}>
              <Controller
                control={passwordForm.control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Current Password"
                    placeholder="Enter current password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={passwordForm.formState.errors.currentPassword?.message}
                  />
                )}
              />

              <Controller
                control={passwordForm.control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="New Password"
                    placeholder="Enter new password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={passwordForm.formState.errors.newPassword?.message}
                  />
                )}
              />

              <Controller
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={passwordForm.formState.errors.confirmPassword?.message}
                  />
                )}
              />

              <View style={styles.formButtons}>
                <AuthButton
                  title="Update Password"
                  onPress={passwordForm.handleSubmit(handlePasswordSubmit)}
                  loading={auth.isLoading}
                />
                <AuthButton
                  title="Cancel"
                  onPress={() => {
                    setIsChangingPassword(false);
                    passwordForm.reset();
                  }}
                  variant="outline"
                />
              </View>
            </View>
          )}

          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
            <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut}>
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarBadgeText: {
    fontSize: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4F46E5',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    marginTop: 16,
  },
  formButtons: {
    marginTop: 16,
  },
  infoList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  settingButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  settingButtonIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  dangerZone: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;