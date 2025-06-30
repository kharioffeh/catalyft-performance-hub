
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useLogout } from '@/hooks/useLogout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsCard } from './SettingsCard';
import { SettingsSection } from './SettingsSection';
import { SettingsSwitch } from './SettingsSwitch';
import { NotificationSettingsWithWeeklySummary } from '@/components/NotificationSettingsWithWeeklySummary';
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
  Shield
} from 'lucide-react';

export const MobileSettingsLayout: React.FC = () => {
  const { user, profile } = useAuth();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    training_reminders: true,
    weekly_reports: true,
    abnormal_readiness: false
  });

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

  if (showNotifications) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <button
            onClick={() => setShowNotifications(false)}
            className="text-blue-600 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold mt-1">Notifications</h1>
        </div>
        
        <div className="p-4">
          <NotificationSettingsWithWeeklySummary>
            <div className="space-y-4">
              <SettingsCard
                icon={BarChart3}
                title="Daily Summary"
                subtitle="Morning briefing with readiness and activity"
                rightElement={
                  <SettingsSwitch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                }
              />
              
              <SettingsCard
                icon={Clock}
                title="Training Reminders"
                subtitle="Alerts for upcoming training sessions"
                rightElement={
                  <SettingsSwitch
                    checked={notifications.training_reminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, training_reminders: checked }))
                    }
                  />
                }
              />
              
              <SettingsCard
                icon={BarChart3}
                title="Weekly Reports"
                subtitle="Performance summaries every week"
                rightElement={
                  <SettingsSwitch
                    checked={notifications.weekly_reports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weekly_reports: checked }))
                    }
                  />
                }
              />
              
              <SettingsCard
                icon={AlertTriangle}
                title="Abnormal Readiness"
                subtitle="Warnings when readiness drops significantly"
                rightElement={
                  <SettingsSwitch
                    checked={notifications.abnormal_readiness}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, abnormal_readiness: checked }))
                    }
                  />
                }
              />
            </div>
          </NotificationSettingsWithWeeklySummary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
