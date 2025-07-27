import React, { useState, useCallback, useEffect } from 'react';
import { useProtocols, type Protocol } from '@/hooks/useProtocols';
import { cn } from '@/lib/utils';
import { Clock, Target, X } from 'lucide-react';

interface ProtocolsSheetProps {
  open: boolean;
  onClose: () => void;
  onProtocolSelect?: (protocol: Protocol) => void;
  sessionId?: string;
}

export const ProtocolsSheet: React.FC<ProtocolsSheetProps> = ({
  open,
  onClose,
  onProtocolSelect,
  sessionId,
}) => {
  const { data: protocols = [], isLoading, error } = useProtocols();
  const [isVisible, setIsVisible] = useState(false);

  // Handle protocol selection
  const handleProtocolPress = useCallback(async (protocol: Protocol) => {
    if (sessionId) {
      try {
        // Call assignFinisher function
        // TODO: Implement assignFinisher function call
        console.log('Assigning finisher:', { session_id: sessionId, protocol_id: protocol.id });
      } catch (error) {
        console.error('Error assigning finisher:', error);
      }
    }
    
    if (onProtocolSelect) {
      onProtocolSelect(protocol);
    }
    
    onClose();
    // TODO: Navigate to ProtocolDetailScreen
  }, [sessionId, onProtocolSelect, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open && !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        "bg-black/50 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "w-full max-w-md mx-auto bg-brand-charcoal rounded-t-3xl border-t border-white/10",
          "shadow-glass-lg transition-transform duration-300 ease-out",
          "max-h-[80vh] flex flex-col",
          open ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue">Mobility Protocols</h2>
            <p className="text-white/60 text-sm">
              {protocols.length} protocols available
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "text-white/60 hover:text-white hover:bg-white/10",
              "focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/60 text-base">Loading protocols...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-400 text-base">Error loading protocols</p>
            </div>
          ) : protocols.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/60 text-base">No protocols available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {protocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className={cn(
                    "bg-white/5 rounded-xl p-4 border border-white/10",
                    "hover:bg-white/10 transition-colors cursor-pointer",
                    "group active:scale-[0.98] transition-transform"
                  )}
                  onClick={() => handleProtocolPress(protocol)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold text-base group-hover:text-brand-blue transition-colors">
                      {protocol.name}
                    </h3>
                    <div className="flex items-center bg-brand-blue/20 px-2 py-1 rounded-lg">
                      <Clock size={12} className="text-brand-blue" />
                      <span className="text-brand-blue text-xs ml-1 font-medium">
                        {protocol.duration_min}min
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-2 line-clamp-2">
                    {protocol.description}
                  </p>
                  
                  {protocol.muscle_targets && protocol.muscle_targets.length > 0 && (
                    <div className="flex items-center">
                      <Target size={12} className="text-green-400" />
                      <span className="text-green-400 text-xs ml-1 font-medium">
                        {protocol.muscle_targets.slice(0, 3).join(', ')}
                        {protocol.muscle_targets.length > 3 && ` +${protocol.muscle_targets.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};