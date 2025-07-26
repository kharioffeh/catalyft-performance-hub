import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Play, Loader2, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Camera as ExpoCamera, CameraView } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

type RecordingState = 'idle' | 'recording' | 'recorded' | 'analyzing' | 'analyzed';

export const VideoCritiqueScreen: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);
  
  const [state, setState] = useState<RecordingState>('idle');
  const [videoUri, setVideoUri] = useState<string>('');
  const [critique, setCritique] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  React.useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            handleStopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      setState('recording');
      const video = await cameraRef.current.recordAsync({
        maxDuration: 10,
      });
      
      if (video?.uri) {
        setVideoUri(video.uri);
        setState('recorded');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      toast({
        title: "Recording Error",
        description: "Failed to record video. Please try again.",
        variant: "destructive"
      });
      setState('idle');
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!videoUri) return;

    setState('analyzing');
    setCritique('');

    try {
      // Convert video URI to blob for upload
      const response = await fetch(videoUri);
      const blob = await response.blob();
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('video', blob, 'workout-video.mp4');

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Call analyzeVideo edge function
      const { data, error } = await supabase.functions.invoke('analyzeVideo', {
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.critique) {
        setCritique(data.critique);
        setState('analyzed');
        toast({
          title: "Analysis Complete",
          description: "Your workout video has been analyzed by ARIA.",
        });
      } else {
        throw new Error('No critique received');
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze video. Please try again.",
        variant: "destructive"
      });
      setState('recorded');
    }
  };

  const handleSaveFeedback = () => {
    // In a real app, this would save to local storage or database
    toast({
      title: "Feedback Saved",
      description: "Your ARIA feedback has been saved to your history.",
    });
    navigate('/mobile/dashboard');
  };

  const handleRetry = () => {
    setVideoUri('');
    setCritique('');
    setState('idle');
  };

  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Video Critique</h1>
        </div>
        
        <GlassCard className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-16 w-16 text-amber-400 mb-4" />
          <h2 className="text-lg font-medium text-foreground mb-2">Camera Permission Required</h2>
          <p className="text-muted-foreground mb-6">
            We need camera access to record your workout videos for analysis.
          </p>
          <Button 
            onClick={() => ExpoCamera.requestCameraPermissionsAsync()}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            Grant Permission
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Video Critique</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pt-2 overflow-y-auto max-h-[calc(100vh-100px)]">
        <div className="space-y-6">
          {/* Camera/Video Section */}
          <GlassCard className="aspect-video relative overflow-hidden">
            {videoUri && (state === 'recorded' || state === 'analyzing' || state === 'analyzed') ? (
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.COVER}
                isLooping={false}
                shouldPlay={false}
                useNativeControls
              />
            ) : (
              <CameraView
                ref={cameraRef}
                style={{ width: '100%', height: '100%' }}
                facing="back"
              />
            )}
            
            {/* Recording Overlay */}
            {state === 'recording' && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="font-medium">REC {recordingTime}s</span>
                </div>
              </div>
            )}

            {/* Analyzing Overlay */}
            {state === 'analyzing' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center gap-3">
                  <Spinner size={32} />
                  <span className="text-foreground font-medium">Analyzing...</span>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Action Buttons */}
          <div className="space-y-4">
            {state === 'idle' && (
              <Button
                onClick={handleStartRecording}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-6 text-lg"
                size="lg"
              >
                <Camera className="h-6 w-6 mr-2" />
                Record Video (10s max)
              </Button>
            )}

            {state === 'recording' && (
              <Button
                onClick={handleStopRecording}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg"
                size="lg"
              >
                Stop Recording
              </Button>
            )}

            {state === 'recorded' && (
              <div className="space-y-3">
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-6 text-lg"
                  size="lg"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Analyze Video
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full border-white/10 text-foreground py-6 text-lg"
                  size="lg"
                >
                  Record Again
                </Button>
              </div>
            )}

            {state === 'analyzing' && (
              <Button
                disabled
                className="w-full bg-brand-blue/50 text-white py-6 text-lg"
                size="lg"
              >
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Analyzing...
              </Button>
            )}
          </div>

          {/* Critique Results */}
          {critique && state === 'analyzed' && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">ARIA Feedback</h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {critique}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSaveFeedback}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Feedback
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1 border-white/10 text-foreground"
                >
                  Record New Video
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};