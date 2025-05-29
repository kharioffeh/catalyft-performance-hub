
import React, { useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { calculateAsymmetry } from '@/utils/biomech';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PoseAnalyzerProps {
  athleteId: string;
  isActive?: boolean;
  videoElement?: HTMLVideoElement | null;
}

export const PoseAnalyzer: React.FC<PoseAnalyzerProps> = ({ 
  athleteId, 
  isActive = true,
  videoElement 
}) => {
  const { profile } = useAuth();
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!isActive || !profile?.id || !videoElement) {
      // Clean up pose detection
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
      return;
    }

    // Initialize MediaPipe Pose
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks || !isActive || !profile?.id) return;

      try {
        // Convert MediaPipe landmarks to our format
        const landmarks = results.poseLandmarks;
        const convertedLandmarks = {
          leftShoulder: landmarks[11] || { x: 0, y: 0, z: 0 },
          rightShoulder: landmarks[12] || { x: 0, y: 0, z: 0 },
          leftHip: landmarks[23] || { x: 0, y: 0, z: 0 },
          rightHip: landmarks[24] || { x: 0, y: 0, z: 0 },
          leftKnee: landmarks[25] || { x: 0, y: 0, z: 0 },
          rightKnee: landmarks[26] || { x: 0, y: 0, z: 0 },
          leftAnkle: landmarks[27] || { x: 0, y: 0, z: 0 },
          rightAnkle: landmarks[28] || { x: 0, y: 0, z: 0 },
        };

        const asymmetry = calculateAsymmetry(convertedLandmarks);
        
        // Trigger alert if asymmetry threshold exceeded (5%)
        if (asymmetry > 0.05) {
          // Insert alert into database
          supabase
            .from('biomech_alerts')
            .insert({
              athlete_uuid: athleteId,
              coach_uuid: profile.id,
              alert_type: 'asymmetry',
              value: asymmetry
            })
            .then(({ error }) => {
              if (error) {
                console.error('Failed to insert biomech alert:', error);
              }
            });

          // Send real-time notification to coach
          supabase
            .channel(`biomech-alerts.${athleteId}`)
            .send({
              type: 'broadcast',
              event: 'asymmetry',
              payload: {
                athleteId,
                value: asymmetry,
                timestamp: new Date().toISOString()
              }
            });
        }
      } catch (error) {
        console.error('Error in pose analysis:', error);
      }
    });

    // Initialize camera
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });

    poseRef.current = pose;
    cameraRef.current = camera;

    // Start camera
    camera.start();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [isActive, athleteId, profile?.id, videoElement]);

  // This component doesn't render anything visible - it's purely for analysis
  return null;
};

export default PoseAnalyzer;
