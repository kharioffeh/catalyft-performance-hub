
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLogout } from '@/hooks/useLogout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsCard } from './SettingsCard';
import { SettingsSection } from './SettingsSection';
import { SettingsSwitch } from './SettingsSwitch';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { WeeklySummarySettings } from '@/components/WeeklySummarySettings';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  Trash2,
  LogOut,
  Shield,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileSettingsLayout: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  
  // Use proper notification preferences hook
  const { 
    preferences: notificationPreferences, 
    isLoading: preferencesLoading,
    updatePreferences 
  } = useNotificationPreferences();

  // Profile editing modal state
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'This will permanently delete all your data. Type "DELETE" to confirm.'
    );

    if (!doubleConfirmed) return;

    try {
      // Note: In a real app, you'd want to handle this through an edge function
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
      });

      logout();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Clean, bright interface'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes'
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Matches your device'
    }
  ];

  if (showAppearance) {
    return (
      <div className="min-h-screen bg-brand-charcoal">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <button
            onClick={() => setShowAppearance(false)}
            className="text-blue-600 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold mt-1">Appearance</h1>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Theme</h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose your preferred appearance
              </p>
            </div>

            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    toast({
                      title: "Theme Updated",
                      description: `Switched to ${option.label.toLowerCase()} theme`,
                    });
                  }}
                  className={cn(
                    "w-full flex items-center min-h-[60px] p-4 bg-white rounded-xl shadow-sm",
                    "transition-all duration-200 touch-manipulation",
                    "hover:bg-gray-50 active:scale-[0.98]",
                    isSelected && "ring-2 ring-blue-500 bg-blue-50"
                  )}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                    isSelected ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-blue-600" : "text-gray-600"
                    )} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className={cn(
                      "text-base font-medium",
                      isSelected ? "text-blue-900" : "text-gray-900"
                    )}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-3">
                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                  </div>
                </button>
              );
            })}

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  resolvedTheme === 'dark' ? "bg-gray-800" : "bg-yellow-400"
                )}>
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-4 h-4 text-white" />
                  ) : (
                    <Sun className="w-4 h-4 text-gray-800" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Currently using {resolvedTheme} theme
                  </p>
                  {theme === 'system' && (
                    <p className="text-xs text-blue-700">
                      Automatically matches your device
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showNotifications) {
    return (
      <div className="min-h-screen bg-brand-charcoal">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <button
            onClick={() => setShowNotifications(false)}
            className="text-blue-600 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold mt-1">Notifications</h1>
        </div>
        
        <div className="p-4 space-y-6">
          {preferencesLoading ? (
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              <SettingsCard
                icon={BarChart3}
                title="Daily Summary"
                subtitle="Morning briefing with readiness and activity"
                rightElement={
                  <SettingsSwitch
                    checked={notificationPreferences?.daily_summary ?? true}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updatePreferences({
                          ...notificationPreferences,
                          daily_summary: checked
                        });
                      }
                    }}
                  />
                }
              />
              
              <SettingsCard
                icon={Clock}
                title="Missed Workout Alerts"
                subtitle="Alerts for missed training sessions"
                rightElement={
                  <SettingsSwitch
                    checked={notificationPreferences?.missed_workout ?? true}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updatePreferences({
                          ...notificationPreferences,
                          missed_workout: checked
                        });
                      }
                    }}
                  />
                }
              />
              
              <SettingsCard
                icon={AlertTriangle}
                title="Abnormal Readiness"
                subtitle="Warnings when readiness drops significantly"
                rightElement={
                  <SettingsSwitch
                    checked={notificationPreferences?.abnormal_readiness ?? true}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updatePreferences({
                          ...notificationPreferences,
                          abnormal_readiness: checked
                        });
                      }
                    }}
                  />
                }
              />
            </div>
          )}
          
          {/* Weekly Summary Settings */}
          <WeeklySummarySettings />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <div className="pb-8 pt-4">
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsCard
            icon={User}
            title="Profile"
            subtitle={profile?.full_name || 'Update your profile information'}
            onPress={() => setShowProfileEdit(true)}
          />
          
          <SettingsCard
            icon={Mail}
            title="Email"
            subtitle={user?.email || 'No email set'}
            rightElement={
              <div className="flex items-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            }
          />
          
          <SettingsCard
            icon={Shield}
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => setShowPasswordChange(true)}
          />
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsCard
            icon={Palette}
            title="Theme"
            subtitle={`Currently using ${resolvedTheme} theme`}
            onPress={() => setShowAppearance(true)}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsCard
            icon={Bell}
            title="Notification Preferences"
            subtitle="Email alerts, reminders, and reports"
            onPress={() => setShowNotifications(true)}
          />
        </SettingsSection>

        {/* Account Actions Section */}
        <SettingsSection title="Account Actions">
          <SettingsCard
            icon={LogOut}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={logout}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Danger Zone">
          <SettingsCard
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            isDangerous={true}
          />
        </SettingsSection>
      </div>
    </div>
  );
};
