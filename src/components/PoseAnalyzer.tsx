
import React from 'react';
import { usePoseLandmarker } from '@catalyft/rn-mediapipe';
import { useAnimatedReaction } from 'react-native-reanimated';
import { calculateAsymmetry } from '@/utils/biomech';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PoseAnalyzerProps {
  athleteId: string;
  isActive?: boolean;
}

export const PoseAnalyzer: React.FC<PoseAnalyzerProps> = ({ 
  athleteId, 
  isActive = true 
}) => {
  const { profile } = useAuth();
  const { landmarks } = usePoseLandmarker({ fps: 30 });

  // Real-time pose analysis with asymmetry detection
  useAnimatedReaction(
    () => landmarks.value,
    (lm) => {
      if (!lm || !isActive || !profile?.id) return;
      
      try {
        const asymmetry = calculateAsymmetry(lm);
        
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
    }
  );

  // This component doesn't render anything visible - it's purely for analysis
  return null;
};

export default PoseAnalyzer;
