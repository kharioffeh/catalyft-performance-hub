import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Watch, 
  Smartphone, 
  Activity, 
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Bluetooth,
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Zap,
  Heart,
  Battery,
  Signal
} from 'lucide-react';
import { useWearablePreferences } from '@/hooks/useWearablePreferences';
import { useWearableData } from '@/hooks/useWearableData';
import { cn } from '@/lib/utils';

interface DeviceOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  isAvailable: boolean;
  connectionType: 'bluetooth' | 'wifi' | 'oauth';
}

const deviceOptions: DeviceOption[] = [
  {
    id: 'apple_watch',
    name: 'Apple Watch',
    description: 'Heart rate, activity, and health monitoring',
    icon: <Watch className="w-12 h-12 text-blue-400" />,
    features: ['Heart Rate', 'Activity Tracking', 'Health Metrics', 'GPS'],
    isAvailable: true,
    connectionType: 'bluetooth'
  },
  {
    id: 'whoop',
    name: 'WHOOP Strap',
    description: 'Recovery and strain tracking',
    icon: <Activity className="w-12 h-12 text-purple-400" />,
    features: ['Recovery Score', 'Strain Tracking', 'Sleep Analysis', 'Heart Rate'],
    isAvailable: true,
    connectionType: 'oauth'
  },
  {
    id: 'google_fit',
    name: 'Google Fit',
    description: 'Android fitness and health data',
    icon: <Smartphone className="w-12 h-12 text-green-400" />,
    features: ['Activity Tracking', 'Heart Points', 'Move Minutes', 'Sleep Data'],
    isAvailable: true,
    connectionType: 'oauth'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Advanced health and fitness tracking',
    icon: <Activity className="w-12 h-12 text-pink-400" />,
    features: ['Sleep Stages', 'Heart Rate Zones', 'GPS Tracking', 'Water Intake'],
    isAvailable: true,
    connectionType: 'oauth'
  }
];

interface StepProps {
  step: number;
  currentStep: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

const Step: React.FC<StepProps> = ({ step, currentStep, title, description, isCompleted }) => {
  const isActive = step === currentStep;
  const isPast = step < currentStep;

  return (
    <div className="flex items-start gap-4">
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
        isCompleted 
          ? "bg-green-500 border-green-500 text-white" 
          : isActive 
            ? "bg-blue-500 border-blue-500 text-white animate-pulse" 
            : "bg-gray-600 border-gray-500 text-gray-300"
      )}>
        {isCompleted ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <span className="font-semibold">{step}</span>
        )}
      </div>
      <div className="flex-1 pt-1">
        <h3 className={cn(
          "font-semibold transition-colors duration-300",
          isCompleted 
            ? "text-green-400" 
            : isActive 
              ? "text-blue-400" 
              : "text-gray-400"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm transition-colors duration-300",
          isCompleted 
            ? "text-green-300/70" 
            : isActive 
              ? "text-blue-300/70" 
              : "text-gray-500"
        )}>
          {description}
        </p>
      </div>
    </div>
  );
};

const ScanningAnimation: React.FC = () => {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glowing pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
      
      {/* Scanning wave */}
      <div className="relative w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-white animate-bounce" />
        </div>
        
        {/* Rotating scanning ring */}
        <div 
          className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"
          style={{ animationDuration: '2s' }}
        />
        
        {/* Progress ring */}
        <div 
          className="absolute inset-0 border-4 border-transparent border-r-green-400 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent ${scanProgress * 3.6}deg, rgba(34, 197, 94, 0.3) ${scanProgress * 3.6}deg)`
          }}
        />
      </div>
      
      {/* Floating device icons */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
        <Watch className="w-4 h-4 text-white" />
      </div>
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
        <Activity className="w-4 h-4 text-white" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
        <Smartphone className="w-4 h-4 text-white" />
      </div>
      <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1.5s' }}>
        <Activity className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

export const ConnectDeviceScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  
  const { connectDevice } = useWearableData();

  const steps = [
    {
      step: 1,
      title: 'Choose Device Type',
      description: 'Select the type of wearable device you want to connect'
    },
    {
      step: 2,
      title: 'Device Discovery',
      description: 'Scanning for available devices in your area'
    },
    {
      step: 3,
      title: 'Authentication',
      description: 'Securely connect and authorize your device'
    },
    {
      step: 4,
      title: 'Sync Setup',
      description: 'Configure data synchronization preferences'
    }
  ];

  const handleDeviceSelect = (device: DeviceOption) => {
    setSelectedDevice(device);
    setCurrentStep(2);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setCurrentStep(2);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanResults([
        { id: '1', name: 'Apple Watch Series 9', signal: 95, battery: 85 },
        { id: '2', name: 'WHOOP Strap 4.0', signal: 88, battery: 45 },
        { id: '3', name: 'Fitbit Sense', signal: 72, battery: 90 }
      ]);
      setCurrentStep(3);
    }, 3000);
  };

  const handleConnect = async (deviceId: string) => {
    setConnectionStatus('connecting');
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would call the actual connect function
      // await connectDevice(deviceId);
      
      setConnectionStatus('connected');
      setCurrentStep(4);
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Connection failed:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deviceOptions.map((device) => (
                <Card 
                  key={device.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
                    device.isAvailable 
                      ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600 hover:border-blue-500/50" 
                      : "bg-gradient-to-br from-slate-800/30 to-slate-700/30 border-slate-700 opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => device.isAvailable && handleDeviceSelect(device)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {device.icon}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{device.name}</h3>
                        <p className="text-sm text-white/60">{device.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {device.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={device.connectionType === 'bluetooth' ? 'default' : 'secondary'}
                        className={cn(
                          device.connectionType === 'bluetooth' 
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        )}
                      >
                        {device.connectionType === 'bluetooth' ? (
                          <>
                            <Bluetooth className="w-3 h-3 mr-1" />
                            Bluetooth
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            OAuth
                          </>
                        )}
                      </Badge>
                      
                      {device.isAvailable ? (
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          Select
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500">Coming Soon</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <ScanningAnimation />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">
                {isScanning ? 'Scanning for Devices...' : 'Devices Found!'}
              </h3>
              <p className="text-white/60">
                {isScanning 
                  ? 'Searching for nearby wearable devices. Please ensure your device is in pairing mode.'
                  : 'We found the following devices. Select one to continue.'
                }
              </p>
            </div>

            {!isScanning && scanResults.length > 0 && (
              <div className="space-y-4">
                {scanResults.map((device) => (
                  <Card key={device.id} className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Watch className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{device.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <Signal className="w-3 h-3" />
                                {device.signal}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Battery className="w-3 h-3" />
                                {device.battery}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleConnect(device.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <Shield className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 border-4 border-transparent border-r-green-400 rounded-full animate-spin" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">Secure Connection</h3>
              <p className="text-white/60">
                Establishing a secure connection with your device. This may take a few moments.
              </p>
            </div>

            {connectionStatus === 'connecting' && (
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </div>
            )}

            {connectionStatus === 'connected' && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Connected Successfully!</span>
              </div>
            )}

            {connectionStatus === 'failed' && (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>Connection Failed</span>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">Sync Configuration</h3>
              <p className="text-white/60">
                Configure how often your device should sync data and what information to share.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">Heart Rate</h4>
                  <p className="text-sm text-white/60">Continuous monitoring</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">Activity</h4>
                  <p className="text-sm text-white/60">Real-time tracking</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Battery className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">Sleep</h4>
                  <p className="text-sm text-white/60">Daily analysis</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Signal className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium mb-1">GPS</h4>
                  <p className="text-sm text-white/60">Location tracking</p>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Complete Setup
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Connect Device</h1>
          <p className="text-xl text-white/60">
            Follow the steps to connect your wearable device
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="bg-slate-800/50 border-slate-600 mb-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              {steps.map((step) => (
                <Step
                  key={step.step}
                  step={step.step}
                  currentStep={currentStep}
                  title={step.title}
                  description={step.description}
                  isCompleted={step.step < currentStep}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="bg-slate-800/50 border-slate-600 mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length && (
            <Button
              onClick={handleNext}
              disabled={!selectedDevice && currentStep === 1}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};