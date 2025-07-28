// @ts-ignore
const { Barcode } = window.Median;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  QrCode, 
  PenTool, 
  X, 
  Zap,
  ZapOff,
  RotateCcw,
  Circle,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MealScannerCameraProps {
  onClose: () => void;
}

type ScanMode = 'photo' | 'barcode' | 'describe';

export const MealScannerCamera: React.FC<MealScannerCameraProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ScanMode>('photo');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            // @ts-ignore - torch is not in the types but exists in modern browsers
            advanced: [{ torch: !isFlashOn }]
          });
          setIsFlashOn(!isFlashOn);
        } catch (error) {
          console.error('Flash not supported:', error);
        }
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    // Navigate to meal parse screen with photo mode
    navigate('/nutrition/my-parse', { state: { mode: 'photo', data: 'photo_data' } });
  };

  const handleBarcodeScan = async () => {
    try {
      // Use Median's Barcode scanning API
      const result = await Barcode.scan();
      
      if (result && result.data) {
        navigate('/nutrition/my-parse', { state: { mode: 'barcode', data: result.data } });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      // Fallback to mock data for demonstration
      navigate('/nutrition/my-parse', { state: { mode: 'barcode', data: '123456789012' } });
    }
  };

  const handleDescribe = () => {
    // Navigate to meal parse screen with describe mode
    navigate('/nutrition/my-parse', { state: { mode: 'describe', data: null } });
  };

  const modes = [
    {
      id: 'photo' as ScanMode,
      label: 'Photo',
      icon: Camera,
      emoji: '📷'
    },
    {
      id: 'barcode' as ScanMode,
      label: 'Barcode',
      icon: QrCode,
      emoji: '🏷'
    },
    {
      id: 'describe' as ScanMode,
      label: 'Describe',
      icon: PenTool,
      emoji: '✍️'
    }
  ];

  const handleCapture = () => {
    switch (mode) {
      case 'photo':
        capturePhoto();
        break;
      case 'barcode':
        handleBarcodeScan();
        break;
      case 'describe':
        handleDescribe();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera View */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Camera not ready overlay */}
        {!isCameraReady && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={toggleFlash}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              {isFlashOn ? (
                <Zap className="w-6 h-6" />
              ) : (
                <ZapOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={switchCamera}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mode-specific Overlays */}
        {mode === 'barcode' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg">
              <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                <QrCode className="w-12 h-12 text-white/70" />
              </div>
            </div>
          </div>
        )}

        {mode === 'photo' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-4 border-white/20 rounded-lg m-4">
              <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-white"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-white"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-white"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-white"></div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          {/* Mode Selector */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-black/50 rounded-full p-1 backdrop-blur-sm">
              {modes.map((modeOption) => {
                const Icon = modeOption.icon;
                return (
                  <button
                    key={modeOption.id}
                    onClick={() => setMode(modeOption.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
                      mode === modeOption.id
                        ? "bg-white text-black"
                        : "text-white hover:bg-white/20"
                    )}
                  >
                    <span className="text-lg">{modeOption.emoji}</span>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{modeOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capture Controls */}
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-8">
              {/* Gallery Preview (placeholder) */}
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Square className="w-6 h-6 text-white" />
              </div>

              {/* Capture Button */}
              <button
                onClick={handleCapture}
                className="relative w-20 h-20 rounded-full border-4 border-white bg-black/50 flex items-center justify-center hover:scale-105 transition-transform duration-200"
                disabled={!isCameraReady}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  {mode === 'photo' && <Circle className="w-8 h-8 text-black" />}
                  {mode === 'barcode' && <QrCode className="w-8 h-8 text-black" />}
                  {mode === 'describe' && <PenTool className="w-8 h-8 text-black" />}
                </div>
              </button>

              {/* Settings placeholder */}
              <div className="w-12 h-12"></div>
            </div>
          </div>

          {/* Mode Instructions */}
          <div className="text-center mt-4">
            <p className="text-white/80 text-sm">
              {mode === 'photo' && "Capture a photo of your meal"}
              {mode === 'barcode' && "Align barcode within the frame"}
              {mode === 'describe' && "Describe your meal manually"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};