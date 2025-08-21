/**
 * Catalyft Fitness App - UI Components Export
 * Central export for all design system components
 */

// Core UI Components
export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { default as Input, type InputRef } from './Input';
export type { InputProps, InputSize, InputVariant } from './Input';

export { default as Card } from './Card';
export type { CardProps, CardVariant, CardSize } from './Card';

export { default as Modal } from './Modal';
export type { ModalProps, ModalType, ModalSize } from './Modal';

export { default as Toast, ToastManager } from './Toast';
export type { ToastConfig, ToastType, ToastPosition, ToastDuration, ToastRef } from './Toast';

// Fitness-Specific Components
export { default as WorkoutTimer, type WorkoutTimerRef } from './WorkoutTimer';
export type { WorkoutTimerProps, TimerMode, TimerInterval } from './WorkoutTimer';

export { default as RepCounter, type RepCounterRef } from './RepCounter';
export type { RepCounterProps } from './RepCounter';

export { default as MacroChart } from './MacroChart';
export type { MacroChartProps, MacroData } from './MacroChart';

export { default as ProgressRing } from './ProgressRing';
export type { ProgressRingProps } from './ProgressRing';

export { default as ExerciseCard } from './ExerciseCard';
export type { ExerciseCardProps, ExerciseData, ExerciseSet } from './ExerciseCard';

// Loading & Empty States
export { 
  default as Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonImage,
  SkeletonListItem,
  SkeletonExerciseCard,
} from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';

export { 
  default as EmptyState,
  NoWorkoutsEmptyState,
  NoExercisesEmptyState,
  NoMealsEmptyState,
  NoProgressEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
  SearchEmptyState,
} from './EmptyState';
export type { EmptyStateProps, EmptyStateType } from './EmptyState';

// Error Handling
export { default as ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Re-export theme for convenience
export { theme } from '../../theme';