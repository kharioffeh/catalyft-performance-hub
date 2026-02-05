import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Watch, 
  Smartphone, 
  Activity, 
  Plus,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useWearablePreferences } from '@/hooks/useWearablePreferences';
import { useWearableData } from '@/hooks/useWearableData';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    description: string;
    logo: string;
    isConnected: boolean;
    lastSync?: string;
    batteryLevel?: number;
    signalStrength?: number;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onSettings: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  onConnect, 
  onDisconnect, 
  onSettings 
}) => {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'apple watch':
      case 'healthkit':
        return <Watch className="w-8 h-8 text-blue-400" />;
      case 'whoop':
        return <Activity className="w-8 h-8 text-purple-400" />;
      case 'google fit':
        return <Smartphone className="w-8 h-8 text-green-400" />;
      case 'fitbit':
        return <Activity className="w-8 h-8 text-pink-400" />;
      default:
        return <Smartphone className="w-8 h-8 text-gray-400" />;
    }
  };

  const getConnectionStatus = () => {
    if (device.isConnected) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <span className="text-gray-400 text-sm font-medium">Disconnected</span>
      </div>
    );
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
      device.isConnected 
        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20" 
        : "bg-gradient-to-br from-gray-500/10 to-slate-500/5 border-gray-500/20"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {getDeviceIcon(device.name)}
              {device.isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{device.name}</h3>
              <p className="text-sm text-white/60">{device.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {device.isConnected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSettings}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {getConnectionStatus()}
          
          {device.isConnected && (
            <>
              {device.lastSync && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <RefreshCw className="w-4 h-4" />
                  <span>Last sync: {new Date(device.lastSync).toLocaleDateString()}</span>
                </div>
              )}
              
              {device.batteryLevel !== undefined && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-4 h-4 bg-white/20 rounded-full p-0.5">
                    <div 
                      className="h-full bg-green-400 rounded-full transition-all duration-300"
                      style={{ width: `${device.batteryLevel}%` }}
                    />
                  </div>
                  <span>{device.batteryLevel}% battery</span>
                </div>
              )}
              
              {device.signalStrength !== undefined && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  {device.signalStrength > 70 ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : device.signalStrength > 30 ? (
                    <Wifi className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span>Signal: {device.signalStrength}%</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {device.isConnected ? (
            <Button
              variant="outline"
              onClick={onDisconnect}
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={onConnect}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DevicesScreen: React.FC = () => {
  const { availableDevices, isLoading, error } = useWearablePreferences();
  const { connectDevice, disconnectDevice } = useWearableData();

  // Mock device data for demonstration
  const mockDevices = [
    {
      id: '1',
      name: 'Apple Watch Series 9',
      description: 'Heart rate, activity, and health monitoring',
      logo: '/apple-watch-logo.png',
      isConnected: true,
      lastSync: new Date().toISOString(),
      batteryLevel: 85,
      signalStrength: 95
    },
    {
      id: '2',
      name: 'WHOOP Strap 4.0',
      description: 'Recovery and strain tracking',
      logo: '/whoop-logo.png',
      isConnected: false,
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      batteryLevel: 45,
      signalStrength: 0
    },
    {
      id: '3',
      name: 'Google Fit',
      description: 'Android fitness and health data',
      logo: '/google-fit-logo.png',
      isConnected: true,
      lastSync: new Date().toISOString(),
      batteryLevel: undefined,
      signalStrength: 88
    },
    {
      id: '4',
      name: 'Fitbit Sense',
      description: 'Advanced health and fitness tracking',
      logo: '/fitbit-logo.png',
      isConnected: false,
      lastSync: undefined,
      batteryLevel: undefined,
      signalStrength: 0
    }
  ];

  const handleConnect = async (deviceId: string) => {
    // Find device type and connect
    const device = mockDevices.find(d => d.id === deviceId);
    if (device) {
      try {
        // This would call the actual connect function
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    const device = mockDevices.find(d => d.id === deviceId);
    if (device) {
      try {
        // This would call the actual disconnect function
      } catch (error) {
        console.error('Disconnection failed:', error);
      }
    }
  };

  const handleSettings = (deviceId: string) => {
    // Navigate to device settings
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Devices</h3>
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Devices</h1>
          <p className="text-xl text-white/60">
            Manage your connected wearable devices and fitness trackers
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {mockDevices.filter(d => d.isConnected).length}
              </div>
              <div className="text-blue-300">Connected Devices</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {mockDevices.filter(d => d.isConnected && d.lastSync).length}
              </div>
              <div className="text-green-300">Active Sync</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {mockDevices.length}
              </div>
              <div className="text-purple-300">Total Devices</div>
            </CardContent>
          </Card>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onConnect={() => handleConnect(device.id)}
              onDisconnect={() => handleDisconnect(device.id)}
              onSettings={() => handleSettings(device.id)}
            />
          ))}
        </div>

        {/* Add New Device */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Add New Device</h3>
              <p className="text-white/60 mb-4">
                Connect additional wearable devices to enhance your fitness tracking
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};