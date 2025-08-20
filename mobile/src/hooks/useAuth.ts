import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { z } from 'zod';

// Validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

// Custom hook for auth operations with validation
export const useAuth = () => {
  const authContext = useAuthContext();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const clearErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const validateSignUp = useCallback((data: any) => {
    try {
      signUpSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  }, []);

  const validateSignIn = useCallback((data: any) => {
    try {
      signInSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  }, []);

  const validateResetPassword = useCallback((data: any) => {
    try {
      resetPasswordSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  }, []);

  const validateUpdatePassword = useCallback((data: any) => {
    try {
      updatePasswordSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  }, []);

  const validateProfile = useCallback((data: any) => {
    try {
      profileSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  }, []);

  return {
    ...authContext,
    validationErrors,
    clearErrors,
    validateSignUp,
    validateSignIn,
    validateResetPassword,
    validateUpdatePassword,
    validateProfile,
  };
};

// Hook for managing auth forms
export const useAuthForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (
    callback: () => Promise<{ success: boolean; error?: any }>
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await callback();
      
      if (!result.success && result.error) {
        setError(result.error.message || 'An error occurred');
        return false;
      }

      return result.success;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    error,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    clearError,
    handleSubmit,
  };
};

// Hook for session management
export const useSession = () => {
  const { session, user, isAuthenticated, checkInactivity } = useAuthContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Session refresh is handled automatically by Supabase
      await checkInactivity();
    } finally {
      setIsRefreshing(false);
    }
  }, [checkInactivity]);

  const getSessionToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  const getRefreshToken = useCallback(() => {
    return session?.refresh_token || null;
  }, [session]);

  const getSessionExpiry = useCallback(() => {
    if (!session) return null;
    
    // Calculate expiry time based on expires_in
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + session.expires_in);
    return expiryTime;
  }, [session]);

  const isSessionExpired = useCallback(() => {
    const expiry = getSessionExpiry();
    if (!expiry) return true;
    
    return new Date() >= expiry;
  }, [getSessionExpiry]);

  return {
    session,
    user,
    isAuthenticated,
    isRefreshing,
    refreshSession,
    getSessionToken,
    getRefreshToken,
    getSessionExpiry,
    isSessionExpired,
  };
};