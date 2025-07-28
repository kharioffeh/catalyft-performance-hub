import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useLogout } from '@/hooks/useLogout';
import { useBilling } from '@/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  CreditCard,
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Trash2,
  Download,
  Smartphone
} from 'lucide-react';
import { useFabPosition } from '@/hooks/useFabPosition';
import { cn } from '@/lib/utils';

// Solo-only settings - No athlete management or coach features
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
  const { billing, isLoading: billingLoading } = useBilling();
  const logout = useLogout();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { contentPadding } = useFabPosition();

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

  const handleExportData = async () => {
    if (!user?.id) return;
    
    setExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: { userId: user.id }
      });

      if (error) throw error;

      // Create and download JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `catalyft-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: `Failed to export data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
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

  // Mobile Settings Layout
  const MobileSettingsContent = () => (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Name</Label>
            <p className="text-sm text-muted-foreground">{profile?.full_name || 'No name set'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No wearables connected</p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Summary</Label>
            <Switch
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
          </div>
          <div className="flex items-center justify-between">
            <Label>Missed Workout Alerts</Label>
            <Switch
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
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              Plan: {billing?.plan_status === 'trialing' ? 'Free Trial' : 'Solo Basic'}
            </p>
            {billing?.plan_status === 'trialing' && (
              <p className="text-sm text-muted-foreground">
                Trial ends: {new Date(billing.trial_end).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const themes = ['light', 'dark', 'system'] as const;
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
              className="flex items-center gap-2"
            >
              <ThemeIcon className="w-4 h-4" />
              {themeInfo.label}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={exporting}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export My Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-destructive/10 backdrop-blur-md border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Desktop Settings Layout
  const DesktopSettingsContent = () => (
    <div className={cn("space-y-6 p-6 max-w-2xl mx-auto", contentPadding)}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <p className="text-sm text-muted-foreground mt-1">{profile?.full_name || 'No name set'}</p>
            </div>
            <div>
              <Label>Email Address</Label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No wearables currently connected</p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Summary</Label>
              <p className="text-sm text-muted-foreground">Morning briefing with readiness and activity</p>
            </div>
            <Switch
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
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Missed Workout Alerts</Label>
              <p className="text-sm text-muted-foreground">Alerts for missed training sessions</p>
            </div>
            <Switch
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
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Readiness Alerts</Label>
              <p className="text-sm text-muted-foreground">Warnings when readiness drops significantly</p>
            </div>
            <Switch
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
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plan */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">
                {billing?.plan_status === 'trialing' ? 'Free Trial' : 'Solo Basic'}
              </p>
              {billing?.plan_status === 'trialing' && (
                <p className="text-sm text-muted-foreground">
                  Trial ends: {new Date(billing.trial_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm">
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Currently using {themeInfo.label} theme</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const themes = ['light', 'dark', 'system'] as const;
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
              className="flex items-center gap-2"
            >
              <ThemeIcon className="w-4 h-4" />
              {themeInfo.label}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Export Your Data</h3>
              <p className="text-sm text-muted-foreground">Download all your metrics and session data</p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-destructive/10 backdrop-blur-md border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ErrorBoundary FallbackComponent={SettingsErrorFallback}>
      {isMobile ? <MobileSettingsContent /> : <DesktopSettingsContent />}
    </ErrorBoundary>
  );
};

export default SettingsRevamped;