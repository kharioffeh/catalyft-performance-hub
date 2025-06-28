
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Bell, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { 
    preferences, 
    thresholds, 
    isLoading, 
    updatePreferences, 
    updateThresholds, 
    isUpdating 
  } = useNotificationPreferences();

  const [localThresholds, setLocalThresholds] = React.useState(thresholds);

  React.useEffect(() => {
    if (thresholds) {
      setLocalThresholds(thresholds);
    }
  }, [thresholds]);

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    if (preferences) {
      updatePreferences({
        ...preferences,
        [key]: value
      });
    }
  };

  const handleThresholdSave = () => {
    if (localThresholds) {
      updateThresholds(localThresholds);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification Settings</h2>
        <p className="text-muted-foreground">
          Configure when and how you receive notifications from ARIA
        </p>
      </div>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Daily Summary
              </Label>
              <p className="text-sm text-muted-foreground">
                Morning briefing with your readiness and recent activity
              </p>
            </div>
            <Switch
              checked={preferences?.daily_summary || false}
              onCheckedChange={(value) => handlePreferenceChange('daily_summary', value)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Missed Workout Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminders when you miss planned training sessions
              </p>
            </div>
            <Switch
              checked={preferences?.missed_workout || false}
              onCheckedChange={(value) => handlePreferenceChange('missed_workout', value)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Abnormal Readiness Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Warnings when your readiness drops below your threshold
              </p>
            </div>
            <Switch
              checked={preferences?.abnormal_readiness || false}
              onCheckedChange={(value) => handlePreferenceChange('abnormal_readiness', value)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>
            Customize when you receive abnormal readiness alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="readiness-threshold">
                Readiness Threshold (%)
              </Label>
              <Input
                id="readiness-threshold"
                type="number"
                min="0"
                max="100"
                value={localThresholds?.readiness_threshold || 40}
                onChange={(e) => setLocalThresholds(prev => ({
                  ...prev!,
                  readiness_threshold: Number(e.target.value)
                }))}
                placeholder="40"
              />
              <p className="text-xs text-muted-foreground">
                Alert when readiness drops below this value
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strain-threshold">
                Strain Threshold
              </Label>
              <Input
                id="strain-threshold"
                type="number"
                min="0"
                max="30"
                value={localThresholds?.strain_threshold || 18}
                onChange={(e) => setLocalThresholds(prev => ({
                  ...prev!,
                  strain_threshold: Number(e.target.value)
                }))}
                placeholder="18"
              />
              <p className="text-xs text-muted-foreground">
                Alert when strain exceeds this value
              </p>
            </div>
          </div>

          <Button 
            onClick={handleThresholdSave} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? "Saving..." : "Save Thresholds"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
