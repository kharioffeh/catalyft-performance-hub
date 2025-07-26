import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface SorenessScreenProps {
  onBack?: () => void;
}

export const SorenessScreen: React.FC<SorenessScreenProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [sorenessScore, setSorenessScore] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { error } = await supabase.functions.invoke('upsertSoreness', {
        body: {
          date: today,
          score: Math.round(sorenessScore)
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Soreness saved",
        description: `Logged soreness level ${Math.round(sorenessScore)} for today`,
      });

      // Navigate back
      if (onBack) {
        onBack();
      } else {
        window.history.back();
      }
    } catch (error) {
      console.error('Error saving soreness:', error);
      
      toast({
        title: "Error",
        description: "Failed to save soreness data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <div className="min-h-screen bg-white/5 backdrop-blur-md rounded-3xl m-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button 
            onClick={() => onBack ? onBack() : window.history.back()}
            className="w-10 h-10 rounded-full bg-white/10 border-none flex justify-center items-center cursor-pointer"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-2xl font-bold text-center m-0">Daily Soreness</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col justify-center min-h-[calc(100vh-200px)]">
          <p className="text-white/70 text-base text-center mb-12">
            Rate your overall muscle soreness level
          </p>

          {/* Live Score Display */}
          <div className="text-center mb-16">
            <p className="text-white/60 text-sm mb-2">Soreness Level</p>
            <div className="text-brand-blue text-7xl font-bold leading-none">{Math.round(sorenessScore)}</div>
            <p className="text-white/60 text-base mt-1">out of 10</p>
          </div>

          {/* Slider */}
          <div className="mb-16">
            <style>
              {`
                .soreness-slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 12px;
                  background: #00D4FF;
                  cursor: pointer;
                }
                
                .soreness-slider::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 12px;
                  background: #00D4FF;
                  cursor: pointer;
                  border: none;
                }
              `}
            </style>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sorenessScore}
              onChange={(e) => setSorenessScore(parseInt(e.target.value))}
              className="soreness-slider w-full h-2 rounded bg-white/20 outline-none appearance-none mb-4"
            />
            
            {/* Scale Labels */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/60 text-xs text-center">1</span>
              <span className="text-white/60 text-xs text-center">No Pain</span>
              <span className="text-white/60 text-xs text-center">10</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/60 text-xs text-center"></span>
              <span className="text-white/60 text-xs text-center">Extreme Pain</span>
              <span className="text-white/60 text-xs text-center"></span>
            </div>
          </div>

          {/* Save Button */}
          <button
            className={`bg-brand-blue py-4 px-8 rounded-xl border-none text-brand-charcoal text-lg font-semibold cursor-pointer w-full ${
              loading ? 'bg-brand-blue/50 cursor-not-allowed' : ''
            }`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Soreness'}
          </button>
        </div>
      </div>
    </div>
  );
};