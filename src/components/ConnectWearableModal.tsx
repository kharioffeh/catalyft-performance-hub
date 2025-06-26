
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Smartphone, Watch } from 'lucide-react';

interface ConnectWearableModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Provider {
  id: 'whoop' | 'apple';
  name: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const providers: Provider[] = [
  {
    id: 'whoop',
    name: 'Whoop',
    description: 'Connect your Whoop device for recovery & strain data',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    icon: <Watch className="w-6 h-6" />,
  },
  {
    id: 'apple',
    name: 'Apple Health',
    description: 'Upload Apple Health export for comprehensive data',
    color: 'bg-gray-600 hover:bg-gray-700',
    icon: <Smartphone className="w-6 h-6" />,
  },
];

export const ConnectWearableModal: React.FC<ConnectWearableModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [appleFile, setAppleFile] = useState<File | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleWhoopConnect = () => {
    const clientId = 'YOUR_WHOOP_CLIENT_ID'; // This should come from env
    const redirectUri = encodeURIComponent('https://xeugyryfvilanoiethum.supabase.co/functions/v1/solo-link-wearable/whoop-callback');
    const scope = encodeURIComponent('read:recovery read:sleep read:workout');
    const state = encodeURIComponent(profile?.id || '');
    
    const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth/?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    window.location.href = authUrl;
  };

  const handleAppleFileUpload = async (file: File) => {
    if (!file || !profile?.id) return;
    
    setLoading(true);
    try {
      const fileContent = await file.text();
      const appleData = JSON.parse(fileContent);
      
      const response = await supabase.functions.invoke('solo-link-wearable', {
        body: {
          athlete_uuid: profile.id,
          provider: 'apple',
          apple_data: appleData,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Apple Health Connected',
        description: 'Your health data has been imported successfully! 💫',
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Apple Health connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to import Apple Health data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAppleFile(file);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    
    if (providerId === 'whoop') {
      handleWhoopConnect();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-md border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Connect Your Wearable
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {!selectedProvider && (
            <div className="space-y-3">
              <p className="text-white/70 text-sm">
                Choose your device to sync health and performance data:
              </p>
              
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id)}
                  disabled={loading}
                  className="w-full p-4 rounded-xl border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${provider.color} text-white group-hover:scale-105 transition-transform`}>
                      {provider.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{provider.name}</h3>
                      <p className="text-sm text-white/60">{provider.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedProvider === 'apple' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-medium text-white mb-2">Upload Apple Health Export</h4>
                <p className="text-sm text-white/70 mb-3">
                  Export your health data from the Health app and upload the JSON file here.
                </p>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full p-2 rounded border border-white/20 bg-white/5 text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-white file:text-slate-900"
                />
              </div>
              
              {appleFile && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAppleFileUpload(appleFile)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Upload & Connect
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProvider(null);
                      setAppleFile(null);
                    }}
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="ml-2 text-white/70">Connecting...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
