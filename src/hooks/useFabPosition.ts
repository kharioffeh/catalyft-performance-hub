import { useIsMobile } from '@/hooks/use-mobile';

export const useFabPosition = () => {
  const isMobile = useIsMobile();

  const getFabClasses = () => {
    const baseClasses = "fixed right-4 z-50";
    
    if (isMobile) {
      // On mobile, position above bottom tab bar (64px height + 16px padding)
      return `${baseClasses} bottom-20`;
    } else {
      // On desktop, standard positioning
      return `${baseClasses} bottom-6`;
    }
  };

  const getContentPadding = () => {
    // Add bottom padding to content when FAB is present
    return isMobile ? "pb-24" : "pb-20";
  };

  return {
    fabClasses: getFabClasses(),
    contentPadding: getContentPadding(),
    isMobile
  };
};