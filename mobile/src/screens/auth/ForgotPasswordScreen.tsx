import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
  AuthLink,
} from '../../components/auth/AuthComponents';
import { useAuth, useAuthForm, resetPasswordSchema } from '../../hooks/useAuth';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const { isSubmitting, error, handleSubmit: handleFormSubmit } = useAuthForm();
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const success = await handleFormSubmit(async () => {
      return await auth.resetPassword(data.email);
    });

    if (success) {
      setEmailSent(true);
      reset();
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const handleResendEmail = () => {
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to your email address. 
              Please check your inbox and follow the link to reset your password.
            </Text>
            <Text style={styles.successNote}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </View>

          <AuthButton
            title="Back to Sign In"
            onPress={handleBackToLogin}
          />

          <AuthButton
            title="Resend Email"
            onPress={handleResendEmail}
            variant="outline"
          />
        </ScrollView>
      </View>
    );
  }

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
          title="Forgot Password?"
          subtitle="No worries, we'll send you reset instructions"
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
                placeholder="Enter your registered email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.email?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <View style={styles.infoContainer}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </Text>
          </View>

          <AuthButton
            title="Send Reset Link"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          <AuthButton
            title="Back to Sign In"
            onPress={handleBackToLogin}
            variant="outline"
          />
        </View>

        <AuthLink
          text="Remember your password?"
          linkText="Sign In"
          onPress={handleBackToLogin}
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
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    color: '#1E40AF',
    fontSize: 14,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  successNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ForgotPasswordScreen;