
import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 px-4 mb-3 uppercase tracking-wider">
        {title}
      </h2>
      <div className="space-y-2 px-4">
        {children}
      </div>
    </div>
  );
};
