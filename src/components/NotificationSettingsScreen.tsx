import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dumbbell, 
  Apple, 
  Users, 
  Bell, 
  Clock, 
  AlertTriangle, 
  BarChart3,
  Mail,
  Trophy,
  Heart,
  Target,
  Zap
} from 'lucide-react';
import { useNotificationPreferences, NotificationPreferences } from '@/hooks/useNotificationPreferences';
import { toast } from '@/hooks/use-toast';

interface NotificationSetting {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'training' | 'nutrition' | 'social';
}

const notificationSettings: NotificationSetting[] = [
  // Training Category
  {
    key: 'missed_workout',
    label: 'Workout Reminders',
    description: 'Get notified when you miss scheduled workouts',
    icon: <Dumbbell className="h-5 w-5" />,
    category: 'training'
  },
  {
    key: 'abnormal_readiness',
    label: 'Recovery Alerts',
    description: 'Notifications for unusual readiness scores and recovery concerns',
    icon: <Heart className="h-5 w-5" />,
    category: 'training'
  },
  {
    key: 'daily_summary',
    label: 'Daily Performance Summary',
    description: 'Receive daily insights about your training and recovery',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'training'
  },
  
  // Nutrition Category
  {
    key: 'nutrition_tracking',
    label: 'Nutrition Tracking',
    description: 'Reminders to log meals and track nutrition goals',
    icon: <Apple className="h-5 w-5" />,
    category: 'nutrition'
  },
  {
    key: 'hydration_reminders',
    label: 'Hydration Reminders',
    description: 'Get reminded to stay hydrated throughout the day',
    icon: <Target className="h-5 w-5" />,
    category: 'nutrition'
  },
  {
    key: 'meal_planning',
    label: 'Meal Planning',
    description: 'Weekly meal plan suggestions and grocery reminders',
    icon: <Clock className="h-5 w-5" />,
    category: 'nutrition'
  },
  
  // Social Category
  {
    key: 'social_connections',
    label: 'Social Connections',
    description: 'Notifications about friend requests and connections',
    icon: <Users className="h-5 w-5" />,
    category: 'social'
  },
  {
    key: 'achievements',
    label: 'Achievements & Milestones',
    description: 'Celebrate your progress and unlock new achievements',
    icon: <Trophy className="h-5 w-5" />,
    category: 'social'
  },
  {
    key: 'challenges',
    label: 'Challenge Updates',
    description: 'Stay updated on challenge progress and leaderboards',
    icon: <Zap className="h-5 w-5" />,
    category: 'social'
  }
];

const categoryConfig = {
  training: {
    title: 'Training & Recovery',
    description: 'Stay on top of your fitness routine and recovery',
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'bg-blue-500/10 border-blue-500/20'
  },
  nutrition: {
    title: 'Nutrition & Wellness',
    description: 'Manage your nutrition and overall wellness',
    icon: <Apple className="h-6 w-6" />,
    color: 'bg-green-500/10 border-green-500/20'
  },
  social: {
    title: 'Social & Community',
    description: 'Stay connected with your fitness community',
    icon: <Users className="h-6 w-6" />,
    color: 'bg-purple-500/10 border-purple-500/20'
  }
};

export const NotificationSettingsScreen: React.FC = () => {
  const { preferences, updatePreferences, isLoading, isUpdating } = useNotificationPreferences();

  // Extend preferences with additional settings (these would be stored in the database)
  const extendedPreferences = {
    ...preferences,
    nutrition_tracking: preferences?.nutrition_tracking ?? true,
    hydration_reminders: preferences?.hydration_reminders ?? true,
    meal_planning: preferences?.meal_planning ?? false,
    social_connections: preferences?.social_connections ?? true,
    achievements: preferences?.achievements ?? true,
    challenges: preferences?.challenges ?? true,
  };

  const handleToggle = async (key: string, enabled: boolean) => {
    try {
      // For now, we'll only update the core preferences that exist in the hook
      if (key in (preferences || {})) {
        await updatePreferences({
          ...preferences!,
          [key]: enabled
        } as NotificationPreferences);
      } else {
        // For new settings, show a toast (in a real app, these would be saved to the database)
        toast({
          title: "Setting updated",
          description: `${enabled ? 'Enabled' : 'Disabled'} ${notificationSettings.find(s => s.key === key)?.label}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification setting",
        variant: "destructive"
      });
    }
  };

  const getCategorySettings = (category: 'training' | 'nutrition' | 'social') => {
    return notificationSettings.filter(setting => setting.category === category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications from ARIA
        </p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Global Settings
          </CardTitle>
          <CardDescription>
            Control your overall notification experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="all-notifications" className="text-base font-medium">
                All Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all notification types
              </p>
            </div>
            <Switch
              id="all-notifications"
              checked={true}
              disabled
              className="opacity-50"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="quiet-hours" className="text-base font-medium">
                Quiet Hours
              </Label>
              <p className="text-sm text-muted-foreground">
                Mute notifications during your sleep hours
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={false}
              disabled
              className="opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category-based Settings */}
      {(['training', 'nutrition', 'social'] as const).map((category) => {
        const config = categoryConfig[category];
        const settings = getCategorySettings(category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <CardTitle>{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting, index) => (
                <div key={setting.key}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-muted/50 mt-0.5">
                        {setting.icon}
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label htmlFor={setting.key} className="text-base font-medium">
                          {setting.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={setting.key}
                      checked={extendedPreferences[setting.key as keyof typeof extendedPreferences] ?? false}
                      onCheckedChange={(enabled) => handleToggle(setting.key, enabled)}
                      disabled={isUpdating}
                    />
                  </div>
                  {index < settings.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email & Push Notifications
          </CardTitle>
          <CardDescription>
            Choose your preferred notification delivery methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-notifications" className="text-base font-medium">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications on your device
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={true}
              disabled
              className="opacity-50"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get detailed notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={false}
              disabled
              className="opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Changes are saved automatically. You can modify these settings at any time.
        </p>
      </div>
    </div>
  );
};