import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useToast } from '@/hooks/use-toast';
import { useProtocols } from '@/hooks/useProtocols';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProtocolStep {
  name: string;
  duration: number; // seconds
  instructions?: string;
}

interface TimerState {
  isActive: boolean;
  currentStepIndex: number;
  timeRemaining: number;
  isPaused: boolean;
}

// Timer overlay component
const TimerOverlay: React.FC<{
  step: ProtocolStep;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onComplete: () => void;
}> = ({ step, timeRemaining, isActive, isPaused, onPause, onResume, onStop, onComplete }) => {
  if (!isActive) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  useEffect(() => {
    if (timeRemaining === 0) {
      onComplete();
    }
  }, [timeRemaining, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-sm p-8 text-center">
        <h3 className="text-xl font-display font-semibold text-white mb-4">
          {step.name}
        </h3>
        
        <div className="text-6xl font-bold text-brand-electric mb-6">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        {step.instructions && (
          <p className="text-white/80 text-sm mb-6">
            {step.instructions}
          </p>
        )}
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Stop
          </Button>
          <Button
            onClick={isPaused ? onResume : onPause}
            className="bg-brand-electric hover:bg-brand-electric/80 text-brand-charcoal"
          >
            {isPaused ? (
              <><Play className="w-4 h-4 mr-2" />Resume</>
            ) : (
              <><Pause className="w-4 h-4 mr-2" />Pause</>
            )}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export const ProtocolDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const protocolId = searchParams.get('protocolId');
  const sessionId = searchParams.get('sessionId');
  
  const { data: protocols } = useProtocols();
  const protocol = protocols?.find(p => p.id === protocolId);
  
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    currentStepIndex: -1,
    timeRemaining: 0,
    isPaused: false,
  });
  
  const intervalRef = useRef<number | null>(null);
  
  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`protocol-timer-${protocolId}`);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setTimerState(parsed);
    }
  }, [protocolId]);
  
  // Save timer state to localStorage when it changes
  useEffect(() => {
    if (protocolId) {
      localStorage.setItem(`protocol-timer-${protocolId}`, JSON.stringify(timerState));
    }
  }, [timerState, protocolId]);
  
  // Timer effect
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused && timerState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isActive, timerState.isPaused, timerState.timeRemaining]);
  
  // Delete session finisher mutation
  const deleteFinisher = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      
      const { error } = await supabase
        .from('session_finishers')
        .delete()
        .eq('session_id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-finishers', sessionId] });
      toast({
        title: "Protocol Completed",
        description: "Great work! Your finisher has been completed."
      });
    }
  });
  
  // Mock protocol steps - in real implementation, this would come from protocol.steps
  const protocolSteps: ProtocolStep[] = protocol ? [
    { name: "Cat-Cow Stretch", duration: 30, instructions: "Gently arch and round your spine" },
    { name: "Hip Flexor Stretch", duration: 45, instructions: "Hold the stretch, breathe deeply" },
    { name: "Shoulder Rolls", duration: 20, instructions: "Roll shoulders backward in smooth circles" },
    { name: "Spinal Twist", duration: 40, instructions: "Gentle rotation, both sides" },
  ] : [];
  
  const startStepTimer = (stepIndex: number) => {
    const step = protocolSteps[stepIndex];
    if (!step) return;
    
    setTimerState({
      isActive: true,
      currentStepIndex: stepIndex,
      timeRemaining: step.duration,
      isPaused: false,
    });
  };
  
  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isPaused: true }));
  };
  
  const resumeTimer = () => {
    setTimerState(prev => ({ ...prev, isPaused: false }));
  };
  
  const stopTimer = () => {
    setTimerState({
      isActive: false,
      currentStepIndex: -1,
      timeRemaining: 0,
      isPaused: false,
    });
  };
  
  const completeStep = () => {
    stopTimer();
    toast({
      title: "Step Completed",
      description: `${protocolSteps[timerState.currentStepIndex]?.name} finished!`
    });
  };
  
  const completeProtocol = async () => {
    try {
      // Clear any active timer
      stopTimer();
      localStorage.removeItem(`protocol-timer-${protocolId}`);
      
      // Optionally delete the session finisher
      if (sessionId) {
        await deleteFinisher.mutateAsync();
      }
      
      navigate('/home');
    } catch (error) {
      console.error('Error completing protocol:', error);
      toast({
        title: "Error",
        description: "Failed to complete protocol",
        variant: "destructive"
      });
    }
  };
  
  if (!protocol) {
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Protocol Not Found</h2>
          <Button variant="outline" onClick={() => navigate('/home')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  const currentStep = timerState.currentStepIndex >= 0 ? protocolSteps[timerState.currentStepIndex] : null;
  
  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-brand-charcoal/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-display font-semibold text-white truncate">
            {protocol.name}
          </h1>
          <div className="w-16" />
        </div>
      </div>
      
      <div className="p-4 space-y-6 pb-32">
        {/* Protocol Description */}
        {protocol.description && (
          <GlassCard className="p-4">
            <p className="text-white/80 leading-relaxed">
              {protocol.description}
            </p>
          </GlassCard>
        )}
        
        {/* Duration Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Total Duration:</span>
          <span className="bg-brand-electric/20 text-brand-electric px-3 py-1 rounded-full text-sm font-medium">
            {protocol.duration_min} minutes
          </span>
        </div>
        
        {/* Steps List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Protocol Steps</h2>
          
          {protocolSteps.map((step, index) => (
            <GlassCard key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">
                    {step.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs">
                      {step.duration}s
                    </span>
                    {step.instructions && (
                      <span className="text-white/60 text-xs">
                        {step.instructions}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startStepTimer(index)}
                  disabled={timerState.isActive}
                  className="text-brand-electric hover:bg-brand-electric/10"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      
      {/* Complete Protocol Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-charcoal/80 backdrop-blur-md border-t border-white/10 p-4">
        <Button
          onClick={completeProtocol}
          disabled={deleteFinisher.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Complete Protocol
        </Button>
      </div>
      
      {/* Timer Overlay */}
      {currentStep && (
        <TimerOverlay
          step={currentStep}
          timeRemaining={timerState.timeRemaining}
          isActive={timerState.isActive}
          isPaused={timerState.isPaused}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
          onComplete={completeStep}
        />
      )}
    </div>
  );
};

export default ProtocolDetailScreen;