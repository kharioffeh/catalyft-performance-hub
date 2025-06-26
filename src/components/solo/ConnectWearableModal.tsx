
import React, { useState } from 'react';
import { GlassCard } from '@/components/Glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Smartphone, Watch } from 'lucide-react';

interface ConnectWearableModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectWearableModal: React.FC<ConnectWearableModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appleFile, setAppleFile] = useState<File | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const providers = [
    {
      id: 'whoop',
      name: 'Whoop',
      description: 'Connect your Whoop strap for automatic data sync',
      color: 'from-emerald-500 to-green-600',
      icon: Watch,
    },
    {
      id: 'apple',
      name: 'Apple Health',
      description: 'Upload your Health app export file',
      color: 'from-gray-400 to-gray-600',
      icon: Smartphone,
    },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleWhoopConnect = async () => {
    if (!profile?.id) return;

    const clientId = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // This should be from environment
    const redirectUri = `${window.location.origin}/oauth/whoop`;
    const scope = 'read:recovery read:cycles read:workout read:sleep read:profile read:body_measurement';
    
    const authUrl = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', profile.id);

    window.location.href = authUrl.toString();
  };

  const handleAppleConnect = async () => {
    if (!appleFile || !profile?.id) return;

    setIsLoading(true);
    try {
      const fileContent = await appleFile.text();
      
      const { data, error } = await supabase.functions.invoke('solo-link-wearable', {
        body: {
          athlete_uuid: profile.id,
          provider: 'apple',
          apple_json: fileContent,
        },
      });

      if (error) throw error;

      toast({
        title: "Wearable connected! 💫",
        description: "Apple Health data syncing successfully.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Apple Health connection error:', error);
      toast({
        title: "Connection failed",
        description: "Unable to connect Apple Health. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    if (selectedProvider === 'whoop') {
      handleWhoopConnect();
    } else if (selectedProvider === 'apple') {
      handleAppleConnect();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900/95 backdrop-blur-md border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">
            Connect Your Wearable
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedProvider ? (
            <div className="space-y-3">
              <p className="text-white/70 text-sm">
                Choose your wearable device to sync data with ARIA for personalized insights.
              </p>
              
              {providers.map((provider) => (
                <GlassCard
                  key={provider.id}
                  className={`p-4 cursor-pointer border border-white/10 hover:border-indigo-500/40 transition-all duration-200`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${provider.color} flex items-center justify-center`}>
                      <provider.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{provider.name}</h3>
                      <p className="text-white/60 text-sm">{provider.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedProvider(null)}
                className="text-white/70 hover:text-white p-0 h-auto"
              >
                ← Back to providers
              </Button>

              {selectedProvider === 'whoop' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                      <Watch className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Connect Whoop</h3>
                    <p className="text-white/70 text-sm">
                      You'll be redirected to Whoop to authorize the connection.
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Whoop'
                    )}
                  </Button>
                </div>
              )}

              {selectedProvider === 'apple' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Upload Apple Health Data</h3>
                    <p className="text-white/70 text-sm">
                      Export your health data from the iOS Health app and upload the JSON file.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="apple-file" className="text-white">
                      Health Export File (.json)
                    </Label>
                    <Input
                      id="apple-file"
                      type="file"
                      accept=".json"
                      onChange={(e) => setAppleFile(e.target.files?.[0] || null)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading || !appleFile}
                    className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Health Data'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
