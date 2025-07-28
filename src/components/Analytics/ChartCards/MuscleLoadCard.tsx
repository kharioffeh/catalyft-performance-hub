import React, { useState } from 'react';
import { BodyHeatMap } from '@/components/BodyHeatMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface MuscleLoadData {
  user_id: string;
  date: string;
  muscle: string;
  load_score: number;
}

interface MuscleLoadCardProps {
  data: MuscleLoadData[];
}

export const MuscleLoadCard: React.FC<MuscleLoadCardProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile } = useAuth();
  
  // Use current user ID
  const userId = profile?.id || 'demo-user';

  // Transform muscle load data to format expected by BodyHeatMap with enhanced color-shading
  const muscleHeatmapData = data.map(item => {
    const loadScore = item.load_score;
    return {
      muscle: item.muscle,
      load: loadScore,
      acute: loadScore,
      chronic: loadScore * 0.8,
      acwr: loadScore / (loadScore * 0.8),
      zone: loadScore > 80 ? 'High' as const : 
            loadScore > 40 ? 'Normal' as const : 
            'Low' as const
    };
  });

  return (
    <>
      <div 
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full h-[320px] flex flex-col cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <h3 className="font-display font-semibold text-xl text-slate-50 mb-4">
          My Muscle Load Heatmap
        </h3>
        
        <div className="text-sm text-muted-foreground mb-4">
          Tap to view full screen - SVG body diagram with color-shaded muscle groups
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full max-w-[280px]">
            <BodyHeatMap 
              userId={userId}
              window_days={7}
              mockData={muscleHeatmapData}
            />
          </div>
        </div>
        
        {/* Load Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-400">Low Load</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-slate-400">Normal Load</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-400">High Load</span>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              My Muscle Load Distribution - Last 7 Days
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-4">
            <BodyHeatMap 
              userId={userId}
              window_days={7}
              mockData={muscleHeatmapData}
            />
          </div>
          
          {/* Enhanced Legend in Modal */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-medium text-slate-200">Low Load</div>
                  <div className="text-slate-400">0-40% capacity</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <div>
                  <div className="font-medium text-slate-200">Normal Load</div>
                  <div className="text-slate-400">40-80% capacity</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div>
                  <div className="font-medium text-slate-200">High Load</div>
                  <div className="text-slate-400">80%+ capacity</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};