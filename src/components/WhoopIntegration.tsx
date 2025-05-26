
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link, Unlink, RefreshCw } from 'lucide-react';

interface WhoopIntegrationProps {
  athleteId: string;
  athleteName: string;
}

const WhoopIntegration: React.FC<WhoopIntegrationProps> = ({ athleteId, athleteName }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkWhoopConnection();
  }, [athleteId]);

  const checkWhoopConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('whoop_tokens')
        .select('updated_at')
        .eq('athlete_uuid', athleteId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking WHOOP connection:', error);
        return;
      }

      setIsConnected(!!data);
      if (data) {
        setLastSync(data.updated_at);
      }
    } catch (error) {
      console.error('Error checking WHOOP connection:', error);
    }
  };

  const connectWhoop = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whoop-oauth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: new URLSearchParams({
          action: 'authorize',
          athlete_id: athleteId,
        }),
      });

      if (error) throw error;

      if (data?.authorization_url) {
        window.open(data.authorization_url, '_blank');
        toast({
          title: "WHOOP Authorization",
          description: "Please complete the authorization in the new window, then refresh this page.",
        });
      }
    } catch (error) {
      console.error('Error connecting to WHOOP:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to WHOOP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWhoop = async () => {
    try {
      const { error } = await supabase
        .from('whoop_tokens')
        .delete()
        .eq('athlete_uuid', athleteId);

      if (error) throw error;

      setIsConnected(false);
      setLastSync(null);
      toast({
        title: "WHOOP Disconnected",
        description: "WHOOP integration has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting WHOOP:', error);
      toast({
        title: "Disconnection Error",
        description: "Failed to disconnect WHOOP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncRecoveryData = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('pull-whoop-recovery', {
        body: { athlete_id: athleteId },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data?.records_processed || 0} recovery data points.`,
      });
      
      await checkWhoopConnection();
    } catch (error) {
      console.error('Error syncing recovery data:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync recovery data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          WHOOP Integration
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              Not Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Connect {athleteName}'s WHOOP account to automatically sync recovery data.
        </p>
        
        {lastSync && (
          <p className="text-xs text-gray-500">
            Last synced: {new Date(lastSync).toLocaleString()}
          </p>
        )}

        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={connectWhoop} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link className="w-4 h-4" />
              )}
              Connect WHOOP
            </Button>
          ) : (
            <>
              <Button 
                onClick={syncRecoveryData} 
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync Data
              </Button>
              <Button 
                onClick={disconnectWhoop} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhoopIntegration;
