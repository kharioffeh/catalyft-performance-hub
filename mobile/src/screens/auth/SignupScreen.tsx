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
      { strength: 1, text: 'Weak', color: '#EF4444' },
      { strength: 2, text: 'Fair', color: '#F59E0B' },
      { strength: 3, text: 'Good', color: '#EAB308' },
      { strength: 4, text: 'Strong', color: '#84CC16' },
      { strength: 5, text: 'Very Strong', color: '#22C55E' },
    ];

    return strengthLevels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Create Account"
          subtitle="Start your fitness transformation today"
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput
                label="Full Name (Optional)"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={() => setFocus('email')}
                autoComplete="name"
                textContentType="name"
                error={errors.fullName?.message}
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput
                label="Email"
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
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <AuthInput
                  label="Password"
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
                  rightIcon={
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                      <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  }
                />
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
              </>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput
                label="Confirm Password"
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
                rightIcon={
                  <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                    <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                }
              />
            )}
          />

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <AuthButton
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />
        </View>

        <AuthDivider />

        <View style={styles.socialButtons}>
          <SocialButton
            provider="google"
            onPress={handleGoogleSignUp}
            loading={isSubmitting}
          />
          
          {Platform.OS === 'ios' && (
            <SocialButton
              provider="apple"
              onPress={handleAppleSignUp}
              loading={isSubmitting}
            />
          )}
        </View>

        <AuthLink
          text="Already have an account?"
          linkText="Sign In"
          onPress={handleSignIn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  passwordStrength: {
    marginTop: -8,
    marginBottom: 16,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  termsContainer: {
    marginVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  socialButtons: {
    marginBottom: 24,
  },
});

export default SignupScreen;