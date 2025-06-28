
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const WeeklySummarySettings: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!profile?.id) throw new Error('No profile ID');

      const { error } = await supabase
        .from('profiles')
        .update({ weekly_summary_opt_in: enabled })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: enabled ? "Weekly summaries enabled" : "Weekly summaries disabled",
        description: enabled 
          ? "You'll receive AI-generated weekly performance summaries every Monday" 
          : "You won't receive weekly performance summaries anymore",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate(enabled);
  };

  if (!profile) return null;

  const isEnabled = profile.weekly_summary_opt_in ?? true;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Mail className="h-5 w-5" />
          Weekly Email Summaries
        </CardTitle>
        <CardDescription className="text-white/60">
          Receive AI-generated weekly performance summaries from ARIA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="weekly-summary" className="text-white/90">
              Enable weekly summaries
            </Label>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              Delivered every Monday at 8:00 AM
            </div>
          </div>
          <Switch
            id="weekly-summary"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={updateSettingsMutation.isPending}
          />
        </div>
        
        {isEnabled && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">
              ✓ You'll receive comprehensive weekly performance insights including:
            </p>
            <ul className="text-sm text-white/80 mt-2 list-disc list-inside space-y-1">
              <li>7-day averages and trends for readiness, sleep, and workload</li>
              <li>AI-generated performance insights and recommendations</li>
              <li>Red flag alerts for injury risk and recovery concerns</li>
              <li>Focus areas and goals for the upcoming week</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
