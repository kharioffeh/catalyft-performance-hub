/**
 * Formatting utilities for the Catalyft app
 */

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Format duration in minutes to human-readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (days === 1) {
    return remainingHours > 0 ? `1d ${remainingHours}h` : '1 day';
  }
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  } else {
    return `${diffYears}y ago`;
  }
};

/**
 * Format calories with appropriate units
 */
export const formatCalories = (calories: number): string => {
  if (calories >= 1000) {
    return `${(calories / 1000).toFixed(1)}k cal`;
  }
  return `${calories} cal`;
};

/**
 * Format weight with units
 */
export const formatWeight = (weight: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  if (unit === 'kg') {
    return `${weight.toFixed(1)} kg`;
  }
  return `${weight.toFixed(0)} lbs`;
};

/**
 * Format distance with units
 */
export const formatDistance = (distance: number, unit: 'km' | 'mi' = 'km'): string => {
  if (unit === 'km') {
    return distance >= 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} mi`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(0)}%`;
};

/**
 * Format date to readable format
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string => {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    case 'full':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Format time to readable format
 */
export const formatTime = (date: Date | string, includeSeconds = false): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  if (includeSeconds) {
    options.second = '2-digit';
  }
  
  return d.toLocaleTimeString('en-US', options);
};

/**
 * Pluralize word based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
};