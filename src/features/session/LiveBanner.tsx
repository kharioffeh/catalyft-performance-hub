
import React, { useEffect, useState } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { useActiveSession } from '@/hooks/useActiveSession';
import { updateSessionStatus } from '@/lib/api/sessions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlassToast } from '@/components/ui/GlassToastProvider';

export const LiveBanner: React.FC = () => {
  const { data: activeSession } = useActiveSession();
  const [elapsedTime, setElapsedTime] = useState(0);
  const queryClient = useQueryClient();
  const { push: toast } = useGlassToast();

  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      updateSessionStatus(sessionId, 'completed', new Date().toISOString()),
    onMutate: async (sessionId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['activeSession'] });
      const previousSession = queryClient.getQueryData(['activeSession']);
      queryClient.setQueryData(['activeSession'], null);
      return { previousSession };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      queryClient.setQueryData(['activeSession'], context?.previousSession);
      toast('error', 'Session End Failed', 'Could not end the session. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast('success', 'Session Completed', 'Your training session has been completed.');
    },
  });

  // Update elapsed time every second
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeSession.start_ts).getTime();
    
    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    if (activeSession) {
      endSessionMutation.mutate(activeSession.id);
    }
  };

  if (!activeSession) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-semibold">Now</span>
          </div>
          <Clock size={16} className="text-white ml-2" />
          <span className="text-white text-base font-bold font-mono">
            {formatTime(elapsedTime)}
          </span>
        </div>
        
        <button 
          onClick={handleEndSession}
          disabled={endSessionMutation.isPending}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Square size={16} />
          End
        </button>
      </div>
    </div>
  );
};
