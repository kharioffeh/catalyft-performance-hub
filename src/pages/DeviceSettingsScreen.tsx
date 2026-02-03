import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Watch, 
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Bluetooth,
  Shield,
  Zap,
  Heart,
  Battery,
  Signal,
  Activity,
  Moon,
  Sun,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Upload,
  Database,
  Network,
  Smartphone,
  Bell
} from 'lucide-react';
import { useWearablePreferences } from '@/hooks/useWearablePreferences';
import { useWearableData } from '@/hooks/useWearableData';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  enabled, 
  onToggle, 
  disabled = false, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-16 h-9'
  };

  const knobSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500",
        sizeClasses[size],
        enabled 
          ? "bg-gradient-to-r from-blue-500 to-purple-500" 
          : "bg-slate-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block transform rounded-full bg-white shadow-lg transition-transform duration-300",
          knobSize[size],
          enabled 
            ? size === 'sm' ? 'translate-x-5' : size === 'md' ? 'translate-x-6' : 'translate-x-8'
            : 'translate-x-1'
        )}
      />
    </button>
  );
};

interface SyncStatusProps {
  lastSync: string;
  nextSync: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  dataTypes: string[];
}

const SyncStatus: React.FC<SyncStatusProps> = ({ 
  lastSync, 
  nextSync, 
  syncStatus, 
  dataTypes 
}) => {
  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Last sync successful';
      case 'error':
        return 'Sync failed';
      default:
        return 'Ready to sync';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sync Status</h3>
              <p className="text-sm text-white/60">Device data synchronization</p>
            </div>
          </div>
          <Badge 
            className={cn(
              "px-3 py-1 text-sm font-medium",
              syncStatus === 'syncing' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
              syncStatus === 'success' && "bg-green-500/20 text-green-400 border-green-500/30",
              syncStatus === 'error' && "bg-red-500/20 text-red-400 border-red-500/30",
              syncStatus === 'idle' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
            )}
          >
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {new Date(lastSync).toLocaleDateString()}
            </div>
            <div className="text-sm text-white/60">Last Sync</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {new Date(nextSync).toLocaleDateString()}
            </div>
            <div className="text-sm text-white/60">Next Sync</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {dataTypes.length}
            </div>
            <div className="text-sm text-white/60">Data Types</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {dataTypes.map((type, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className="bg-white/10 text-white/80 border-white/20"
            >
              {type}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface SettingSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ 
  title, 
  description, 
  icon, 
  children 
}) => {
  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
            {icon}
          </div>
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            <p className="text-sm text-white/60">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export const DeviceSettingsScreen: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState({
    autoSync: true,
    backgroundSync: true,
    notifications: true,
    dataSharing: false,
    locationTracking: true,
    heartRateMonitoring: true,
    sleepTracking: true,
    activityTracking: true,
    gpsTracking: true,
    waterIntake: false,
    calorieTracking: true,
    workoutDetection: true,
    recoveryMonitoring: true,
    stressTracking: false,
    breathingRate: false,
    bloodOxygen: false,
    temperature: false,
    ecg: false
  });

  const [syncFrequency, setSyncFrequency] = useState<'realtime' | 'hourly' | 'daily' | 'manual'>('hourly');
  const [dataRetention, setDataRetention] = useState<'30days' | '90days' | '1year' | 'forever'>('90days');
  const [privacyLevel, setPrivacyLevel] = useState<'basic' | 'standard' | 'enhanced'>('standard');

  // Mock device data
  const deviceInfo = {
    name: 'Apple Watch Series 9',
    model: 'A2972',
    version: 'watchOS 10.1',
    battery: 85,
    lastSync: new Date().toISOString(),
    nextSync: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    dataTypes: ['Heart Rate', 'Activity', 'Sleep', 'GPS', 'ECG', 'Blood Oxygen']
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSyncStatus('success');
      
      // Reset to idle after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setSettings({
      autoSync: true,
      backgroundSync: true,
      notifications: true,
      dataSharing: false,
      locationTracking: true,
      heartRateMonitoring: true,
      sleepTracking: true,
      activityTracking: true,
      gpsTracking: true,
      waterIntake: false,
      calorieTracking: true,
      workoutDetection: true,
      recoveryMonitoring: true,
      stressTracking: false,
      breathingRate: false,
      bloodOxygen: false,
      temperature: false,
      ecg: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">Device Settings</h1>
              <p className="text-xl text-white/60">
                Configure your {deviceInfo.name} and data synchronization preferences
              </p>
            </div>
          </div>

          {/* Device Info Card */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Watch className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{deviceInfo.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>Model: {deviceInfo.model}</span>
                      <span>Version: {deviceInfo.version}</span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-4 h-4" />
                        {deviceInfo.battery}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleManualSync}
                    disabled={syncStatus === 'syncing'}
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-500/30 text-white/70 hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Status */}
        <div className="mb-8">
          <SyncStatus
            lastSync={deviceInfo.lastSync}
            nextSync={deviceInfo.nextSync}
            syncStatus={syncStatus}
            dataTypes={deviceInfo.dataTypes}
          />
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Data Collection */}
          <SettingSection
            title="Data Collection"
            description="Choose what health and fitness data to collect from your device"
            icon={<Activity className="w-5 h-5 text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-medium text-white">Heart Rate Monitoring</div>
                      <div className="text-sm text-white/60">Continuous heart rate tracking</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.heartRateMonitoring}
                    onToggle={() => handleToggle('heartRateMonitoring')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="font-medium text-white">Sleep Tracking</div>
                      <div className="text-sm text-white/60">Monitor sleep stages and quality</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.sleepTracking}
                    onToggle={() => handleToggle('sleepTracking')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">Activity Tracking</div>
                      <div className="text-sm text-white/60">Steps, calories, and workouts</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.activityTracking}
                    onToggle={() => handleToggle('activityTracking')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Signal className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium text-white">GPS Tracking</div>
                      <div className="text-sm text-white/60">Location and route data</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.gpsTracking}
                    onToggle={() => handleToggle('gpsTracking')}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Workout Detection</div>
                      <div className="text-sm text-white/60">Automatic workout recognition</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.workoutDetection}
                    onToggle={() => handleToggle('workoutDetection')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-white">Recovery Monitoring</div>
                      <div className="text-sm text-white/60">Recovery score and readiness</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.recoveryMonitoring}
                    onToggle={() => handleToggle('recoveryMonitoring')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-orange-400" />
                    <div>
                      <div className="font-medium text-white">ECG Monitoring</div>
                      <div className="text-sm text-white/60">Electrocardiogram readings</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.ecg}
                    onToggle={() => handleToggle('ecg')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-pink-400" />
                    <div>
                      <div className="font-medium text-white">Blood Oxygen</div>
                      <div className="text-sm text-white/60">SpO2 level monitoring</div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={settings.bloodOxygen}
                    onToggle={() => handleToggle('bloodOxygen')}
                  />
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Sync Preferences */}
          <SettingSection
            title="Sync Preferences"
            description="Configure how and when your device syncs data"
            icon={<RefreshCw className="w-5 h-5 text-green-400" />}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">Auto Sync</div>
                    <div className="text-sm text-white/60">Automatically sync data when available</div>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.autoSync}
                  onToggle={() => handleToggle('autoSync')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-medium text-white">Background Sync</div>
                    <div className="text-sm text-white/60">Sync data in the background</div>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.backgroundSync}
                  onToggle={() => handleToggle('backgroundSync')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Sync Frequency
                  </label>
                  <select
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value as typeof syncFrequency)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Data Retention
                  </label>
                  <select
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value as typeof dataRetention)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30days">30 days</option>
                    <option value="90days">90 days</option>
                    <option value="1year">1 year</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Privacy & Security */}
          <SettingSection
            title="Privacy & Security"
            description="Control data sharing and privacy settings"
            icon={<Shield className="w-5 h-5 text-orange-400" />}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">Data Sharing</div>
                    <div className="text-sm text-white/60">Share anonymized data for research</div>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.dataSharing}
                  onToggle={() => handleToggle('dataSharing')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-medium text-white">Enhanced Privacy</div>
                    <div className="text-sm text-white/60">Use advanced privacy protection</div>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={privacyLevel === 'enhanced'}
                  onToggle={() => setPrivacyLevel(privacyLevel === 'enhanced' ? 'standard' : 'enhanced')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2",
                    privacyLevel === 'basic' && "bg-green-500/20 border-2 border-green-500/50",
                    privacyLevel === 'standard' && "bg-blue-500/20 border-2 border-blue-500/50",
                    privacyLevel === 'enhanced' && "bg-purple-500/20 border-2 border-purple-500/50"
                  )}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-white">Basic</div>
                  <div className="text-xs text-white/60">Standard protection</div>
                </div>
                
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2",
                    privacyLevel === 'basic' && "bg-green-500/20 border-2 border-green-500/50",
                    privacyLevel === 'standard' && "bg-blue-500/20 border-2 border-blue-500/50",
                    privacyLevel === 'enhanced' && "bg-purple-500/20 border-2 border-purple-500/50"
                  )}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-white">Standard</div>
                  <div className="text-xs text-white/60">Enhanced protection</div>
                </div>
                
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2",
                    privacyLevel === 'basic' && "bg-green-500/20 border-2 border-green-500/50",
                    privacyLevel === 'standard' && "bg-blue-500/20 border-2 border-blue-500/50",
                    privacyLevel === 'enhanced' && "bg-purple-500/20 border-2 border-purple-500/50"
                  )}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-white">Enhanced</div>
                  <div className="text-xs text-white/60">Maximum protection</div>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection
            title="Notifications"
            description="Manage device alerts and notifications"
            icon={<Bell className="w-5 h-5 text-yellow-400" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">Device Notifications</div>
                    <div className="text-sm text-white/60">Receive alerts from your device</div>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications}
                  onToggle={() => handleToggle('notifications')}
                />
              </div>
            </div>
          </SettingSection>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-500/30 text-white/70 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};