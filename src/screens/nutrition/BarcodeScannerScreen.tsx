import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Scan, CheckCircle, AlertCircle } from 'lucide-react';

interface BarcodeScannerScreenProps {
  onScan: (result: { data: string }) => void;
  onClose: () => void;
}

const BarcodeScannerScreen: React.FC<BarcodeScannerScreenProps> = ({
  onScan,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Auto-start scanning when component mounts
    startScanning();
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    setScanStatus('scanning');
    
    try {
      // Simulate barcode scanning with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful scan
      const mockBarcode = '123456789012';
      setScanResult(mockBarcode);
      setScanStatus('success');
      
      // Auto-close after success
      setTimeout(() => {
        onScan({ data: mockBarcode });
        onClose();
      }, 1500);
      
    } catch (error) {
      setScanStatus('error');
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setScanStatus('idle');
    startScanning();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-white text-lg font-medium">Scan Barcode</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full h-full bg-gray-900">
        {/* Mock Camera Feed */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/50">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Camera Preview</p>
          </div>
        </div>

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Scanning Frame */}
          <div className="relative w-80 h-48">
            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>
            
            {/* Scanning Line */}
            {scanStatus === 'scanning' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-green-400 to-transparent animate-bounce"></div>
                </div>
              </div>
            )}
            
            {/* Success Animation */}
            {scanStatus === 'success' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            
            {/* Error State */}
            {scanStatus === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scanning Status */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center">
          {scanStatus === 'scanning' && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-white text-sm">Position barcode within frame</p>
            </div>
          )}
          
          {scanStatus === 'success' && (
            <div className="text-center">
              <p className="text-green-400 text-sm font-medium">Barcode detected!</p>
              <p className="text-white/70 text-xs mt-1">{scanResult}</p>
            </div>
          )}
          
          {scanStatus === 'error' && (
            <div className="text-center">
              <p className="text-red-400 text-sm font-medium">Scan failed</p>
              <p className="text-white/70 text-xs mt-1">Please try again</p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          {scanStatus === 'error' && (
            <div className="flex justify-center">
              <Button
                onClick={handleRetry}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
              >
                <Scan className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </div>
          )}
          
          {scanStatus === 'idle' && (
            <div className="flex justify-center">
              <Button
                onClick={startScanning}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
              >
                <Scan className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white/80 text-sm">
              {scanStatus === 'scanning' 
                ? 'Hold steady and wait for scan...'
                : scanStatus === 'success'
                ? 'Processing...'
                : 'Point camera at barcode'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Scanning Reticle Animation */}
      {scanStatus === 'scanning' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-80 h-48 border border-green-400/30 rounded-lg">
              {/* Scanning grid lines */}
              <div className="w-full h-full relative">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-green-400/20"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-green-400/20"></div>
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-green-400/20"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-green-400/20"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScannerScreen;