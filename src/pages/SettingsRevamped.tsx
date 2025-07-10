import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { MobileSettingsLayout } from '@/components/Settings/MobileSettingsLayout';
import { SettingsCard } from '@/components/Settings/SettingsCard';
import { SettingsSection } from '@/components/Settings/SettingsSection';
import { SettingsSwitch } from '@/components/Settings/SettingsSwitch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useLogout } from '@/hooks/useLogout';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  BellOff,
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Trash2,
  Key,
  AlertTriangle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useFabPosition } from '@/hooks/useFabPosition';
import { cn } from '@/lib/utils';

const SettingsErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold text-red-600">Settings Error</h2>
      <p className="text-gray-600">Something went wrong loading the settings page.</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  </div>
);

const SettingsRevamped: React.FC = () => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { preferences: notificationPreferences, updatePreferences } = useNotificationPreferences();
  const logout = useLogout();
  const [loading, setLoading] = useState(false);
  const { contentPadding } = useFabPosition();

  // Use mobile layout on mobile devices with error boundary
  if (isMobile) {
    return (
      <ErrorBoundary FallbackComponent={SettingsErrorFallback}>
        <MobileSettingsLayout />
      </ErrorBoundary>
    );
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'This will permanently delete all your data. Type "DELETE" to confirm.'
    );

    if (!doubleConfirmed) return;

    setLoading(true);

    try {
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
    } finally {
      setLoading(false);
    }
  };

  const getThemeDisplayInfo = () => {
    switch (theme) {
      case 'light':
        return { icon: Sun, label: 'Light' };
      case 'dark':
        return { icon: Moon, label: 'Dark' };
      case 'system':
        return { icon: Monitor, label: `System (${resolvedTheme})` };
      default:
        return { icon: Monitor, label: 'System' };
    }
  };

  const themeInfo = getThemeDisplayInfo();
  const ThemeIcon = themeInfo.icon;

  return (
    <ErrorBoundary FallbackComponent={SettingsErrorFallback}>
      <div className={cn("space-y-8 p-6 max-w-2xl mx-auto", contentPadding)}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsCard
            icon={User}
            title="Profile Information"
            subtitle={`${profile?.full_name || 'No name set'} • ${user?.email}`}
            onPress={() => {
              // Navigate to profile edit
              toast({
                title: "Profile Edit",
                description: "Profile editing feature coming soon",
              });
            }}
          />
          
          <SettingsCard
            icon={Mail}
            title="Email Address"
            subtitle={user?.email || 'No email'}
            onPress={() => {
              toast({
                title: "Email Settings",
                description: "Contact support to change your email address",
              });
            }}
          />
          
          <SettingsCard
            icon={Key}
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => {
              toast({
                title: "Password Change",
                description: "Password change feature coming soon",
              });
            }}
          />
          
          <SettingsCard
            icon={Shield}
            title="Security Settings"
            subtitle="Two-factor authentication and security options"
            onPress={() => {
              toast({
                title: "Security Settings",
                description: "Security settings coming soon",
              });
            }}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsCard
            icon={Bell}
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
            icon={AlertTriangle}
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
            icon={BellOff}
            title="Readiness Alerts"
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
          
          <SettingsCard
            icon={SettingsIcon}
            title="Notification Settings"
            subtitle="Manage all notification preferences"
            onPress={() => {
              toast({
                title: "Notification Settings",
                description: "Advanced notification settings coming soon",
              });
            }}
          />
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsCard
            icon={Palette}
            title="Theme"
            subtitle={`Currently using ${themeInfo.label} theme`}
            onPress={() => {
              // Cycle through themes
              const themes = ['light', 'dark', 'system'] as const;
              const currentIndex = themes.indexOf(theme);
              const nextIndex = (currentIndex + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            rightElement={
              <div className="flex items-center">
                <ThemeIcon className="w-5 h-5 text-gray-400" />
              </div>
            }
          />
        </SettingsSection>

        {/* Danger Zone Section */}
        <SettingsSection title="Danger Zone">
          <SettingsCard
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently delete your account and all data"
            onPress={handleDeleteAccount}
            isDangerous={true}
            disabled={loading}
          />
        </SettingsSection>
      </div>
    </ErrorBoundary>
  );
};

export default SettingsRevamped;