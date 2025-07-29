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
  AlertTriangle
} from 'lucide-react';
import { useWearableData } from '@/hooks/useWearableData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const WearableConnectionBanner: React.FC = () => {
  const { profile } = useAuth();
  const { connectedDevices, connectDevice, isConnecting, connectionError } = useWearableData();
  
  // Check if user has WHOOP connected
  const { data: whoopToken } = useQuery({
    queryKey: ['whoop-token', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('whoop_tokens')
        .select('expires_at')
        .eq('user_id', profile.id)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      return error ? null : data;
    },
    enabled: !!profile?.id,
  });
  
  const hasConnectedDevice = connectedDevices.length > 0;
  const hasWearableWithCalories = connectedDevices.some(device => 
    device.capabilities.some(cap => cap.type === 'calories')
  );
  const hasWhoopConnected = !!whoopToken;

  if (hasWhoopConnected || hasWearableWithCalories) {
    const deviceName = hasWhoopConnected ? 'WHOOP' : connectedDevices[0]?.name;
    return (
      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-green-300 text-sm">
                {hasWhoopConnected ? 'WHOOP Connected' : 'Wearable Connected'}
              </div>
              <div className="text-xs text-green-400/70">
                Getting accurate calorie burn data from {deviceName}
                {hasWhoopConnected && ' (including strain & workouts)'}
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
              Connect a Wearable for Better Tracking
            </div>
            <div className="text-xs text-yellow-400/70 mb-3">
              Get accurate calorie burn data instead of estimates. Connect your smartwatch or fitness tracker.
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
                onClick={() => connectDevice('apple_watch')}
                disabled={isConnecting}
                className="text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20 text-xs h-7"
              >
                <Watch className="w-3 h-3 mr-1" />
                Apple Watch
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