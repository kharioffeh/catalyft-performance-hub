import React, { useState } from 'react';
import { BodyHeatMap } from '@/components/BodyHeatMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MuscleLoadData {
  user_id: string;
  date: string;
  muscle: string;
  load_score: number;
}

interface MuscleLoadCardProps {
  data: MuscleLoadData[];
  selectedAthleteId: string;
}

export const MuscleLoadCard: React.FC<MuscleLoadCardProps> = ({ data, selectedAthleteId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform muscle load data to format expected by BodyHeatMap
  const muscleHeatmapData = data.map(item => ({
    muscle: item.muscle,
    load: item.load_score,
    acute: item.load_score,
    chronic: item.load_score * 0.8,
    acwr: item.load_score / (item.load_score * 0.8),
    zone: item.load_score > 80 ? 'High' as const : 
          item.load_score > 40 ? 'Normal' as const : 
          'Low' as const
  }));

  return (
    <>
      <div 
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[300px] h-[240px] flex flex-col cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <h3 className="font-display font-semibold text-lg text-slate-50 mb-2">
          Muscle Load Heatmap
        </h3>
        
        <div className="text-xs text-muted-foreground mb-2">
          Tap to view full screen
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full">
            <BodyHeatMap 
              userId={selectedAthleteId}
              window_days={7}
              mockData={muscleHeatmapData}
            />
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              Muscle Load Distribution - Last 7 Days
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-4">
            <BodyHeatMap 
              userId={selectedAthleteId}
              window_days={7}
              mockData={muscleHeatmapData}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};