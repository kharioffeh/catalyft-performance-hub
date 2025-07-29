import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  QrCode, 
  PenTool, 
  X, 
  Zap,
  ZapOff,
  RotateCcw,
  Circle,
  Square,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GlassCard from '@/components/ui/GlassCard';
import { FoodListEditor, FoodItem } from '@/components/nutrition/FoodListEditor';
import { LoadingShimmer } from '@/components/nutrition/LoadingShimmer';
import { useNutrition } from '@/hooks/useNutrition';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// @ts-expect-error - Median types not available
const { Barcode } = window.Median;

type ScanMode = 'photo' | 'barcode' | 'describe';
type ViewMode = 'camera' | 'parsing' | 'editing';

interface ParsedMealResponse {
  foods: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  }>;
  confidence: number;
  notes?: string;
}

const ParseScreen: React.FC = () => {
  const { addMeal } = useNutrition();
  
  // Camera states
  const [mode, setMode] = useState<ScanMode>('photo');
  const [viewMode, setViewMode] = useState<ViewMode>('camera');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Parsing states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedMealResponse | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCameraCallback = useCallback(async () => {
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
      setError('Failed to access camera');
    }
  }, [facingMode]);

  useEffect(() => {
    if (viewMode === 'camera') {
      startCameraCallback();
    }
    return () => {
      stopCamera();
    };
  }, [viewMode, startCameraCallback]);



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
            // @ts-expect-error - torch is not in the types but exists in modern browsers
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

  const capturePhotoFromVideo = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const parseMeal = async (imageBase64?: string, barcodeData?: string, manualDescription?: string) => {
    setIsLoading(true);
    setError(null);
    setViewMode('parsing');

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke('ai-parse-meal', {
        body: {
          mode,
          data: barcodeData,
          imageBase64,
          description: manualDescription || description
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setParsedData(result);
      
      // Convert to FoodItem format with IDs
      const foodItems: FoodItem[] = result.foods.map((food: ParsedMealResponse['foods'][0], index: number) => ({
        id: `food-${index}`,
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar
      }));

      setFoods(foodItems);
      setViewMode('editing');
    } catch (err) {
      console.error('Error parsing meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse meal');
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    const imageBase64 = capturePhotoFromVideo();
    if (imageBase64) {
      setCapturedImage(imageBase64);
      stopCamera();
      parseMeal(imageBase64);
    }
  };

  const handleBarcodeScan = async () => {
    try {
      // Use Median's Barcode scanning API
      const result = await Barcode.scan();
      
      if (result && result.data) {
        stopCamera();
        parseMeal(undefined, result.data);
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      // Fallback to mock data for demonstration
      stopCamera();
      parseMeal(undefined, '123456789012');
    }
  };

  const handleDescribe = () => {
    if (description.trim()) {
      stopCamera();
      parseMeal(undefined, undefined, description);
    } else {
      setError('Please enter a description of your meal');
    }
  };

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

  const handleSaveMeal = async () => {
    if (foods.length === 0) return;

    setIsSaving(true);
    try {
      // Calculate totals
      const totals = foods.reduce(
        (acc, food) => ({
          calories: acc.calories + (food.calories * food.quantity),
          protein: acc.protein + (food.protein * food.quantity),
          carbs: acc.carbs + (food.carbs * food.quantity),
          fat: acc.fat + (food.fat * food.quantity),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Create meal entry
      const now = new Date();
      const mealEntry = {
        date: now.toISOString().split('T')[0], // YYYY-MM-DD format
        time: now.toTimeString().split(' ')[0], // HH:MM:SS format
        name: foods.length === 1 ? foods[0].name : `Mixed meal (${foods.length} items)`,
        description: `Parsed via ${mode}. Contains: ${foods.map(f => f.name).join(', ')}. ${parsedData?.notes || ''}`.trim(),
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
      };

      await addMeal(mealEntry);
      
      // Reset to camera view
      resetToCamera();
    } catch (err) {
      console.error('Error saving meal:', err);
      setError('Failed to save meal');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToCamera = () => {
    setViewMode('camera');
    setError(null);
    setParsedData(null);
    setFoods([]);
    setCapturedImage(null);
    setDescription('');
  };

  const handleRetry = () => {
    setError(null);
    if (mode === 'photo' && capturedImage) {
      parseMeal(capturedImage);
    } else if (mode === 'describe') {
      parseMeal(undefined, undefined, description);
    } else {
      resetToCamera();
    }
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

  // Calculate totals for display
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories * food.quantity),
      protein: acc.protein + (food.protein * food.quantity),
      carbs: acc.carbs + (food.carbs * food.quantity),
      fat: acc.fat + (food.fat * food.quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getModeIcon = () => {
    switch (mode) {
      case 'photo':
        return <Camera className="w-5 h-5" />;
      case 'barcode':
        return <QrCode className="w-5 h-5" />;
      case 'describe':
        return <PenTool className="w-5 h-5" />;
      default:
        return <Camera className="w-5 h-5" />;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'photo':
        return 'Photo Analysis';
      case 'barcode':
        return 'Barcode Scan';
      case 'describe':
        return 'Manual Entry';
      default:
        return 'Meal Entry';
    }
  };

  // Camera View
  if (viewMode === 'camera') {
    return (
      <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera Video */}
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
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <h2 className="text-lg font-semibold text-white">{getModeLabel()}</h2>
          </div>

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

        {/* Description Input for Describe Mode */}
        {mode === 'describe' && (
          <div className="absolute inset-x-4 top-20 bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your meal (e.g., 'grilled chicken breast with rice and vegetables')"
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/50"
              rows={3}
            />
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
                disabled={!isCameraReady || (mode === 'describe' && !description.trim())}
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
              {mode === 'describe' && "Describe your meal and tap capture"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (viewMode === 'parsing' && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <h2 className="text-xl font-bold text-white">{getModeLabel()}</h2>
          </div>

          <div className="ml-auto flex items-center gap-2 text-white/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing...</span>
          </div>
        </div>

        <GlassCard className="p-6">
          <LoadingShimmer />
        </GlassCard>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <h2 className="text-xl font-bold text-white">{getModeLabel()}</h2>
          </div>
        </div>

        <GlassCard className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Analysis Failed</h3>
          <p className="text-white/70 mb-6">{error}</p>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRetry}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={resetToCamera}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/20"
            >
              Retake
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Editing state
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {getModeIcon()}
          <h2 className="text-xl font-bold text-white">{getModeLabel()}</h2>
        </div>

        {parsedData?.confidence && (
          <Badge variant="secondary" className="ml-auto">
            {parsedData.confidence}% confident
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        <FoodListEditor
          foods={foods}
          onChange={setFoods}
          onSwapFood={(foodId) => console.log('Swap food:', foodId)}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={resetToCamera}
            variant="outline"
            className="flex-1 text-white border-white/20 hover:bg-white/20"
          >
            Retake
          </Button>
          
          <Button
            onClick={handleSaveMeal}
            disabled={foods.length === 0 || isSaving}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Meal ({Math.round(totals.calories)} kcal)
              </>
            )}
          </Button>
        </div>

        {/* Tips */}
        {parsedData?.notes && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/70 text-sm">{parsedData.notes}</p>
          </div>
        )}

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-sm">
            {mode === 'photo' && "💡 AI analyzed your photo. You can edit quantities and nutrition values above."}
            {mode === 'barcode' && "💡 Product information retrieved. Adjust serving size as needed."}
            {mode === 'describe' && "💡 Based on your description. Please verify and adjust values."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParseScreen;