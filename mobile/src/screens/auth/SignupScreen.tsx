import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  AuthHeader,
  AuthInput,
  AuthButton,
  SocialButton,
  AuthLink,
  AuthDivider,
} from '../../components/auth/AuthComponents';
import { useAuth, useAuthForm, signUpSchema } from '../../hooks/useAuth';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const { 
    isSubmitting, 
    error, 
    showPassword, 
    showConfirmPassword,
    togglePasswordVisibility, 
    toggleConfirmPasswordVisibility,
    handleSubmit: handleFormSubmit 
  } = useAuthForm();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    const success = await handleFormSubmit(async () => {
      return await auth.signUp(data.email, data.password, data.fullName);
    });

    if (success) {
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account before signing in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    }
  };

  const handleGoogleSignUp = async () => {
    const success = await handleFormSubmit(async () => {
      return await auth.signInWithGoogle();
    });

    if (success) {
      // Navigation will be handled by the AuthContext/Navigator
    }
  };

  const handleAppleSignUp = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign In is only available on iOS devices.');
      return;
    }

    const success = await handleFormSubmit(async () => {
      return await auth.signInWithApple();
    });

    if (success) {
      // Navigation will be handled by the AuthContext/Navigator
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login' as never);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '#E5E7EB' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthLevels = [
      { strength: 0, text: '', color: '#E5E7EB' },
      { strength: 1, text: 'Weak', color: '#FF6B6B' },
      { strength: 2, text: 'Fair', color: '#FF9F1C' },
      { strength: 3, text: 'Good', color: '#00D4FF' },
      { strength: 4, text: 'Strong', color: '#00FF88' },
      { strength: 5, text: 'Very Strong', color: '#22C55E' },
    ];

    return strengthLevels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <LinearGradient
      colors={['#121212', '#1a1a1a', '#0f0f0f']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="fitness" size={48} color="#00D4FF" />
            </View>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Start your fitness transformation today</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <AuthInput
                      label=""
                      placeholder="Enter your full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={() => setFocus('email')}
                      autoComplete="name"
                      textContentType="name"
                      error={errors.fullName?.message}
                      returnKeyType="next"
                      containerStyle={styles.customInput}
                    />
                  </View>
                  {errors.fullName?.message && (
                    <Text style={styles.errorMessage}>{errors.fullName.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <AuthInput
                      label=""
                      placeholder="Enter your email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={() => setFocus('password')}
                      keyboardType="email-address"
                      autoComplete="email"
                      textContentType="emailAddress"
                      error={errors.email?.message}
                      returnKeyType="next"
                      containerStyle={styles.customInput}
                    />
                  </View>
                  {errors.email?.message && (
                    <Text style={styles.errorMessage}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <AuthInput
                      label=""
                      placeholder="Create a strong password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={() => setFocus('confirmPassword')}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                      textContentType="newPassword"
                      error={errors.password?.message}
                      returnKeyType="next"
                      containerStyle={styles.customInput}
                      rightIcon={
                        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                          <Ionicons 
                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#666" 
                          />
                        </TouchableOpacity>
                      }
                    />
                  </View>
                  {password && (
                    <View style={styles.passwordStrength}>
                      <View style={styles.passwordStrengthBar}>
                        <View
                          style={[
                            styles.passwordStrengthFill,
                            {
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                              backgroundColor: passwordStrength.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                        {passwordStrength.text}
                      </Text>
                    </View>
                  )}
                  {errors.password?.message && (
                    <Text style={styles.errorMessage}>{errors.password.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <AuthInput
                      label=""
                      placeholder="Re-enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="password-new"
                      textContentType="newPassword"
                      error={errors.confirmPassword?.message}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      containerStyle={styles.customInput}
                      rightIcon={
                        <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                          <Ionicons 
                            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#666" 
                          />
                        </TouchableOpacity>
                      }
                    />
                  </View>
                  {errors.confirmPassword?.message && (
                    <Text style={styles.errorMessage}>{errors.confirmPassword.message}</Text>
                  )}
                </View>
              )}
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00D4FF', '#00FF88']}
                style={styles.gradientButton}
              >
                {isSubmitting ? (
                  <Text style={styles.buttonText}>Creating Account...</Text>
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignUp}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>
            
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignUp}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={styles.appleButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  errorMessage: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  passwordStrength: {
    marginTop: 8,
    marginBottom: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  termsContainer: {
    marginVertical: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#00D4FF',
    fontWeight: '500',
  },
  createAccountButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#666666',
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#888888',
    fontSize: 14,
  },
  signInLink: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignupScreen;