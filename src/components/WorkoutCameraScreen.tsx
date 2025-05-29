
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Square, Play, Pause } from 'lucide-react';
import { PoseAnalyzer } from './PoseAnalyzer';
import { useAuth } from '@/contexts/AuthContext';

interface WorkoutCameraScreenProps {
  athleteId?: string;
}

export const WorkoutCameraScreen: React.FC<WorkoutCameraScreenProps> = ({ 
  athleteId 
}) => {
  const { profile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPoseAnalysisActive, setIsPoseAnalysisActive] = useState(false);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleTogglePoseAnalysis = () => {
    setIsPoseAnalysisActive(!isPoseAnalysisActive);
  };

  // Use current user as athlete if no specific athlete provided
  const currentAthleteId = athleteId || profile?.id;

  if (!currentAthleteId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please log in to use the camera features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Workout Camera & Pose Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera placeholder - would integrate with actual camera in real app */}
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Camera feed would appear here</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleToggleRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Recording
                </>
              )}
            </Button>

            <Button
              onClick={handleTogglePoseAnalysis}
              variant={isPoseAnalysisActive ? "secondary" : "outline"}
              className="flex items-center gap-2"
            >
              {isPoseAnalysisActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Analysis
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Pose Analysis
                </>
              )}
            </Button>
          </div>

          {/* Status indicators */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`} />
              Recording: {isRecording ? 'Active' : 'Inactive'}
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isPoseAnalysisActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              Pose Analysis: {isPoseAnalysisActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pose Analyzer Component - runs in background when active */}
      <PoseAnalyzer 
        athleteId={currentAthleteId}
        isActive={isPoseAnalysisActive}
      />
    </div>
  );
};

export default WorkoutCameraScreen;
