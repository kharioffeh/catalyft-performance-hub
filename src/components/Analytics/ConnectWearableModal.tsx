
import React from 'react';

interface ConnectWearableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectWearableModal: React.FC<ConnectWearableModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleConnect = () => {
    onClose();
    // TODO: Implement actual connection logic
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="modal-glass p-6 max-w-md w-[90vw]">
        <h3 className="text-lg font-display font-semibold text-white mb-4">Connect Wearable Device</h3>
        <p className="text-white/70 mb-6">
          Connect your Apple Watch, Whoop, or other wearable device to start tracking your metrics.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white transition-colors"
          >
            Connect Device
          </button>
        </div>
      </div>
    </div>
  );
};
