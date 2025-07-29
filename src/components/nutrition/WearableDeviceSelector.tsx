/**
 * Wearable Device Selector Component
 * 
 * Allows users to choose which wearable device they want to use
 * for calorie tracking, replacing automatic priority system.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Watch, 
  Play, 
  Calculator,
  CheckCircle,
  Circle,
  Settings,
  Smartphone,
  Wifi,
  WifiOff,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWearablePreferences, type WearableDevice } from '@/hooks/useWearablePreferences';

interface WearableDeviceSelectorProps {
  className?: string;
  onDeviceSelected?: (device: WearableDevice) => void;
}

export const WearableDeviceSelector: React.FC<WearableDeviceSelectorProps> = ({
  className,
  onDeviceSelected,
}) => {
  const {
    selectedDevice,
    availableDevices,
    isLoading,
    error,
    setPreferredDevice,
    connectDevice,
    disconnectDevice,
  } = useWearablePreferences();

  const [connectingDevice, setConnectingDevice] = useState<WearableDevice | null>(null);

  const getDeviceIcon = (deviceId: WearableDevice) => {
    switch (deviceId) {
      case 'whoop': return Activity;
      case 'healthkit': return Watch;
      case 'google_fit': return Play;
      case 'manual': return Calculator;
      default: return Circle;
    }
  };

  const getDeviceColor = (deviceId: WearableDevice) => {
    switch (deviceId) {
      case 'whoop': return 'text-purple-400';
      case 'healthkit': return 'text-blue-400';
      case 'google_fit': return 'text-green-400';
      case 'manual': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const handleDeviceSelect = async (device: WearableDevice) => {
    const success = await setPreferredDevice(device);
    if (success) {
      onDeviceSelected?.(device);
    }
  };

  const handleConnect = async (device: WearableDevice) => {
    setConnectingDevice(device);
    try {
      const success = await connectDevice(device);
      if (success) {
        // Automatically select the device after successful connection
        await handleDeviceSelect(device);
      }
    } finally {
      setConnectingDevice(null);
    }
  };

  const handleDisconnect = async (device: WearableDevice) => {
    setConnectingDevice(device);
    try {
      await disconnectDevice(device);
    } finally {
      setConnectingDevice(null);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-gray-800/50 border-gray-700", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-400">Loading devices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gray-800/50 border-gray-700", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5" />
          Choose Your Fitness Device
        </CardTitle>
        <p className="text-sm text-gray-400">
          Select which device you want to use for calorie tracking. You can connect multiple devices but only one will be used.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {availableDevices.map((device) => {
          const Icon = getDeviceIcon(device.id);
          const isSelected = selectedDevice === device.id;
          const isConnecting = connectingDevice === device.id;
          
          return (
            <div
              key={device.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                isSelected 
                  ? "bg-blue-500/10 border-blue-500/30" 
                  : "bg-gray-800/30 border-gray-600/30 hover:border-gray-600/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-blue-500/20" : "bg-gray-700/50"
                  )}>
                    <Icon className={cn("w-5 h-5", getDeviceColor(device.id))} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{device.name}</h3>
                      
                      {!device.isAvailable && (
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                          {device.platform} only
                        </Badge>
                      )}
                      
                      {device.isConnected ? (
                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          <Wifi className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : device.id !== 'manual' && device.isAvailable && (
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                          <WifiOff className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">{device.description}</p>
                    
                    {device.lastSync && (
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(device.lastSync).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Connection/Disconnection button */}
                  {device.id !== 'manual' && device.isAvailable && (
                    <Button
                      size="sm"
                      variant={device.isConnected ? "outline" : "default"}
                      onClick={() => device.isConnected ? handleDisconnect(device.id) : handleConnect(device.id)}
                      disabled={isConnecting}
                      className={cn(
                        "text-xs h-7",
                        device.isConnected 
                          ? "text-gray-300 border-gray-600 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                          : "text-white bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {isConnecting ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : device.isConnected ? (
                        'Disconnect'
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}

                  {/* Selection button */}
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleDeviceSelect(device.id)}
                    disabled={!device.isAvailable || (!device.isConnected && device.id !== 'manual')}
                    className={cn(
                      "text-xs h-7",
                      isSelected 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-300 border-gray-600 hover:bg-blue-500/20 hover:border-blue-500/30"
                    )}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 mr-1" />
                        Select
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-400 font-medium">How it works:</p>
              <ul className="text-blue-300/70 mt-1 space-y-1">
                <li>• Connect multiple devices, but choose one as your primary source</li>
                <li>• Your selected device will be used for all calorie calculations</li>
                <li>• If your device has no data, manual calculations will be used</li>
                <li>• You can change your selection anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};