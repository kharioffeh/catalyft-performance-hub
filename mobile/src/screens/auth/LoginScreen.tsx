import React, { useState, useEffect } from 'react';
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
import ReactNativeBiometrics from '../../utils/biometrics';
import {
  AuthHeader,
  AuthInput,
  AuthButton,
  SocialButton,
  AuthLink,
  AuthDivider,
} from '../../components/auth/AuthComponents';
import { useAuth, useAuthForm, signInSchema } from '../../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const { isSubmitting, error, showPassword, togglePasswordVisibility, handleSubmit: handleFormSubmit } = useAuthForm();
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available } = await rnBiometrics.isSensorAvailable();
    setBiometricAvailable(available && auth.biometricEnabled);
  };

  const onSubmit = async (data: LoginFormData) => {
    const success = await handleFormSubmit(async () => {
      return await auth.signIn(data.email, data.password);
    });

    if (success) {
      // Navigation will be handled by the AuthContext/Navigator
    }
  };

  const handleGoogleSignIn = async () => {
    const success = await handleFormSubmit(async () => {
      return await auth.signInWithGoogle();
    });

    if (success) {
      // Navigation will be handled by the AuthContext/Navigator
    }
  };

  const handleAppleSignIn = async () => {
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

  const handleBiometricSignIn = async () => {
    const success = await handleFormSubmit(async () => {
      return await auth.signInWithBiometric();
    });

    if (success) {
      // Navigation will be handled by the AuthContext/Navigator
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

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
          title="Welcome Back"
          subtitle="Sign in to continue your fitness journey"
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
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
              <AuthInput
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                error={errors.password?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                rightIcon={
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                }
              />
            )}
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AuthButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          {biometricAvailable && (
            <AuthButton
              title="Sign In with Biometrics"
              onPress={handleBiometricSignIn}
              loading={isSubmitting}
              variant="outline"
              icon={<Text>👆</Text>}
            />
          )}
        </View>

        <AuthDivider />

        <View style={styles.socialButtons}>
          <SocialButton
            provider="google"
            onPress={handleGoogleSignIn}
            loading={isSubmitting}
          />
          
          {Platform.OS === 'ios' && (
            <SocialButton
              provider="apple"
              onPress={handleAppleSignIn}
              loading={isSubmitting}
            />
          )}
        </View>

        <AuthLink
          text="Don't have an account?"
          linkText="Sign Up"
          onPress={handleSignUp}
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtons: {
    marginBottom: 24,
  },
});

export default LoginScreen;