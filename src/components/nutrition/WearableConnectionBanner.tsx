import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Watch, 
  Smartphone, 
  Activity, 
  Plus,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useWearableData } from '@/hooks/useWearableData';
import { useUnifiedWearableData } from '@/hooks/useUnifiedWearableData';
import { useWearablePreferences } from '@/hooks/useWearablePreferences';

export const WearableConnectionBanner: React.FC = () => {
  const { connectedDevices, connectDevice, isConnecting, connectionError } = useWearableData();
  const { connectionStatus } = useUnifiedWearableData(7); // Check last 7 days
  const { selectedDevice, availableDevices } = useWearablePreferences();
  
  const hasConnectedDevice = connectedDevices.length > 0;
  const hasWearableWithCalories = connectedDevices.some(device => 
    device.capabilities.some(cap => cap.type === 'calories')
  );
  
  const { hasWhoop, hasHealthKit, hasGoogleFit } = connectionStatus;
  
  // Get the user's selected device info
  const selectedDeviceInfo = availableDevices.find(d => d.id === selectedDevice);
  const hasSelectedWearable = selectedDevice !== 'manual' && selectedDeviceInfo?.isConnected;

  if (hasSelectedWearable) {
    // User has selected a wearable device and it's connected
    const deviceName = selectedDeviceInfo?.name || 'Wearable Device';
    const deviceDetails = ` (${selectedDeviceInfo?.description.toLowerCase() || 'fitness tracking'})`;
    const isUserChoice = true;
    
    return (
      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-green-300 text-sm">
                {deviceName} Selected
              </div>
              <div className="text-xs text-green-400/70">
                Using {deviceName} for calorie tracking{deviceDetails}
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-yellow-500/10 border-yellow-500/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-yellow-300 text-sm mb-1">
              Choose Your Fitness Device
            </div>
            <div className="text-xs text-yellow-400/70 mb-3">
              Connect a wearable device for accurate calorie tracking, or use manual calculations. You choose which device to use.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open('/calendar?connect_whoop=true', '_blank')}
                disabled={isConnecting}
                className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20 text-xs h-7"
              >
                <Activity className="w-3 h-3 mr-1" />
                WHOOP
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // This would trigger the iOS app to request HealthKit permissions
                  alert('To connect Apple Watch:\n\n1. Open the iOS app\n2. Go to Health integration\n3. Grant HealthKit permissions');
                }}
                disabled={isConnecting}
                className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20 text-xs h-7"
              >
                <Watch className="w-3 h-3 mr-1" />
                Apple Watch
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => connectDevice('google_fit')}
                disabled={isConnecting}
                className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20 text-xs h-7"
              >
                <Play className="w-3 h-3 mr-1" />
                Google Fit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => connectDevice('fitbit')}
                disabled={isConnecting}
                className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20 text-xs h-7"
              >
                <Activity className="w-3 h-3 mr-1" />
                Fitbit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => connectDevice('polar')}
                disabled={isConnecting}
                className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20 text-xs h-7"
              >
                <Smartphone className="w-3 h-3 mr-1" />
                Other
              </Button>
            </div>
            {connectionError && (
              <div className="text-xs text-red-400 mt-2">
                {connectionError}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};