import React, { useState, useEffect } from 'react';
import { useGenerateFinishers, useSessionFinisher } from '@/hooks/useFinishers';
import { ProtocolsSheet } from '@/components/ProtocolsSheet';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Clock, Activity, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinishersCardProps {
  sessionId: string;
  onStartProtocol?: () => void;
}

export const FinishersCard: React.FC<FinishersCardProps> = ({
  sessionId,
  onStartProtocol
}) => {
  const [showProtocolsSheet, setShowProtocolsSheet] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const generateFinishers = useGenerateFinishers();
  const { data: sessionFinisher, isLoading } = useSessionFinisher(sessionId);

  // Auto-generate finishers when component mounts
  useEffect(() => {
    if (sessionId && !sessionFinisher && !generateFinishers.isPending) {
      generateFinishers.mutate(sessionId);
    }
  }, [sessionId, sessionFinisher, generateFinishers]);

  // Animate card in after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Add haptic feedback
  const handleCardReveal = () => {
    // Check if haptic feedback is available
    if ('vibrate' in navigator) {
      navigator.vibrate(100); // 100ms vibration
    }
  };

  useEffect(() => {
    if (isVisible) {
      handleCardReveal();
    }
  }, [isVisible]);

  const handleStartProtocol = () => {
    if (onStartProtocol) {
      onStartProtocol();
    }
    
    // Navigate to ProtocolDetailScreen with protocol and session data
    if (sessionFinisher?.mobility_protocols) {
      const params = new URLSearchParams({
        protocolId: sessionFinisher.mobility_protocols.id,
        ...(sessionId && { sessionId })
      });
      window.location.href = `/mobile/protocol-detail?${params.toString()}`;
    }
  };

  const handleChangeProtocol = () => {
    setShowProtocolsSheet(true);
  };

  if (isLoading || !sessionFinisher) {
    return (
      <div
        className={cn(
          "transform transition-all duration-500 ease-out",
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-8 opacity-0"
        )}
      >
        <GlassCard accent="primary" className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RotateCw className="w-5 h-5 animate-spin text-brand-blue" />
            <span className="text-foreground">Generating finishers...</span>
          </div>
        </GlassCard>
      </div>
    );
  }

  const protocol = sessionFinisher?.mobility_protocols;
  
  if (!protocol) {
    return (
      <div
        className={cn(
          "transform transition-all duration-500 ease-out",
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-8 opacity-0"
        )}
      >
        <GlassCard accent="primary" className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-foreground">No finisher protocol found</span>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "transform transition-all duration-500 ease-out",
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-8 opacity-0"
        )}
      >
        <GlassCard accent="success" className="p-6">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">Finishers</h3>
            <p className="text-sm text-muted-foreground">Recommended for you</p>
          </div>

          {/* Protocol Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-foreground">
                {protocol.name}
              </h4>
              <div className="flex items-center bg-brand-blue/20 px-2 py-1 rounded-lg">
                <Clock size={12} className="text-brand-blue" />
                <span className="text-brand-blue text-xs ml-1 font-medium">
                  {protocol.duration_min}min
                </span>
              </div>
            </div>
            
            {protocol.description && (
              <p className="text-sm text-muted-foreground">
                {protocol.description}
              </p>
            )}

            {protocol.muscle_targets && protocol.muscle_targets.length > 0 && (
              <div className="flex items-center mt-2">
                <Activity size={12} className="text-green-400" />
                <span className="text-green-400 text-xs ml-1 font-medium">
                  {protocol.muscle_targets.slice(0, 3).join(', ')}
                  {protocol.muscle_targets.length > 3 && ` +${protocol.muscle_targets.length - 3} more`}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleStartProtocol}
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              Start
            </Button>
            <Button
              variant="outline"
              onClick={handleChangeProtocol}
              className="px-6"
            >
              Change
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Protocols Sheet */}
      <ProtocolsSheet
        open={showProtocolsSheet}
        onClose={() => setShowProtocolsSheet(false)}
        sessionId={sessionId}
      />
    </>
  );
};