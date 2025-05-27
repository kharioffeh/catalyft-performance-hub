
export const getFlagIcon = (flag: string) => {
  const icons = {
    red: 'AlertTriangle',
    amber: 'TrendingDown', 
    green: 'TrendingUp'
  };
  return icons[flag as keyof typeof icons] || null;
};

export const getFlagBadgeColor = (flag: string) => {
  const colors = {
    red: 'bg-red-100 text-red-800',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800'
  };
  return colors[flag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getReadinessBadgeColor = (readiness: number) => {
  if (readiness >= 80) return 'bg-green-100 text-green-800';
  if (readiness >= 60) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
};
