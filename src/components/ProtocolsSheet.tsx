import React, { useState, useCallback, useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { useProtocols, type Protocol } from '@/hooks/useProtocols';
import { cn } from '@/lib/utils';
import { Clock, Target } from 'lucide-react';

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { data: protocols = [], isLoading, error } = useProtocols();

  // BottomSheet snap points
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

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

  // Render protocol item
  const renderProtocol = useCallback(({ item }: { item: Protocol }) => (
    <div
      className={cn(
        "bg-white/5 rounded-xl p-4 mb-3 border border-white/10",
        "hover:bg-white/10 transition-colors cursor-pointer"
      )}
      onClick={() => handleProtocolPress(item)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-base">{item.name}</h3>
        <div className="flex items-center bg-brand-blue/20 px-2 py-1 rounded-lg">
          <Clock size={12} className="text-brand-blue" />
          <span className="text-brand-blue text-xs ml-1 font-medium">{item.duration_min}min</span>
        </div>
      </div>
      
      <p className="text-white/70 text-sm mb-2 line-clamp-2">
        {item.description}
      </p>
      
      {item.muscle_targets && item.muscle_targets.length > 0 && (
        <div className="flex items-center">
          <Target size={12} className="text-green-400" />
          <span className="text-green-400 text-xs ml-1 font-medium">
            {item.muscle_targets.slice(0, 3).join(', ')}
            {item.muscle_targets.length > 3 && ` +${item.muscle_targets.length - 3} more`}
          </span>
        </div>
      )}
    </div>
  ), [handleProtocolPress]);

  // React to open prop changes
  React.useEffect(() => {
    if (open) {
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [open]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 40,
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
        <div className="py-4 border-b border-white/10 mb-4">
          <h2 className="text-2xl font-bold text-brand-blue mb-1">Mobility Protocols</h2>
          <p className="text-white/60 text-sm">
            {protocols.length} protocols available
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/60 text-base">Loading protocols...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-400 text-base">Error loading protocols</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto pb-5">
            {protocols.map((protocol) => renderProtocol({ item: protocol }))}
          </div>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};
