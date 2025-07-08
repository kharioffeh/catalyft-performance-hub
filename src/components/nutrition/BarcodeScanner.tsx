import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Scan, X, Zap } from 'lucide-react';

interface MockFoodItem {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  barcode: string;
}

interface BarcodeScannerProps {
  onScanSuccess: (foodItem: MockFoodItem) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Mock food database for demonstration
const MOCK_FOODS: MockFoodItem[] = [
  {
    name: "Greek Yogurt",
    description: "Plain Greek yogurt, 150g serving",
    calories: 130,
    protein: 15,
    carbs: 9,
    fat: 4,
    barcode: "123456789012"
  },
  {
    name: "Banana",
    description: "Medium banana, 120g",
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
    barcode: "234567890123"
  },
  {
    name: "Chicken Breast",
    description: "Grilled chicken breast, 100g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 4,
    barcode: "345678901234"
  },
  {
    name: "Oatmeal",
    description: "Steel cut oats, 40g dry",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    barcode: "456789012345"
  },
  {
    name: "Almonds",
    description: "Raw almonds, 28g (1 oz)",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    barcode: "567890123456"
  }
];

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onClose,
  isOpen
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanningAnimation, setScanningAnimation] = useState(false);

  const handleScanClick = () => {
    setIsScanning(true);
    setScanningAnimation(true);
    
    // Simulate scan delay
    setTimeout(() => {
      // Return random mock food item
      const randomFood = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];
      onScanSuccess(randomFood);
      setIsScanning(false);
      setScanningAnimation(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Scan Barcode</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Camera Placeholder */}
          <div className="relative bg-gray-800 rounded-lg aspect-square mb-6 overflow-hidden">
            {/* Mock Camera View */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Camera Preview</p>
                <p className="text-gray-500 text-xs mt-1">Point camera at barcode</p>
              </div>
            </div>

            {/* Scanning Overlay */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-lg">
              {/* Scanning Reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-24 border-2 border-white/40 rounded-lg relative">
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-white"></div>
                  
                  {/* Scanning line animation */}
                  {scanningAnimation && (
                    <div className="absolute inset-0">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scanning Status */}
            {isScanning && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Scanning...
                </Badge>
              </div>
            )}
          </div>

          {/* Scan Button */}
          <Button
            onClick={handleScanClick}
            disabled={isScanning}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Scanning...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Scan Barcode
              </>
            )}
          </Button>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Position the barcode within the frame and tap scan
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Demo mode: Returns mock food data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};