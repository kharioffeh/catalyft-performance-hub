
import { useGlassToast as useGlassToastContext } from '@/components/ui/GlassToastProvider';

export const useGlassToast = () => {
  const toast = useGlassToastContext();

  return {
    success: (title: string, message?: string) => toast.push('success', title, message),
    error: (title: string, message?: string) => toast.push('error', title, message),
    info: (title: string, message?: string) => toast.push('info', title, message),
    warning: (title: string, message?: string) => toast.push('warning', title, message),
    push: toast.push,
    dismiss: toast.dismiss,
    clear: toast.clear,
  };
};
