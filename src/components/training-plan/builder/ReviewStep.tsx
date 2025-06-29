
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BuilderMeta, BuilderSession } from '@/hooks/useTemplateBuilder';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ReviewStepProps {
  meta: BuilderMeta;
  sessions: BuilderSession[];
  isValid: () => boolean;
  onPrev: () => void;
  onFinish: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  meta,
  sessions,
  isValid,
  onPrev,
  onFinish
}) => {
  const totalExercises = sessions.reduce((sum, session) => sum + session.exercises.length, 0);
  const weeklyVolume = Math.round(totalExercises / meta.weeks);

  const handleReOptimize = () => {
    // TODO: Call ARIA optimization
    console.log('Re-optimize template');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Optimize</h2>
        <p className="text-white/70">Final review before saving your template</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{meta.weeks}</div>
            <div className="text-sm text-white/70">Weeks</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{sessions.length}</div>
            <div className="text-sm text-white/70">Sessions</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{totalExercises}</div>
            <div className="text-sm text-white/70">Total Exercises</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{weeklyVolume}</div>
            <div className="text-sm text-white/70">Avg Weekly Volume</div>
          </CardContent>
        </Card>
      </div>

      {/* Template Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            Template Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/70">Name:</span>
              <span className="text-white ml-2">{meta.name}</span>
            </div>
            <div>
              <span className="text-white/70">Goal:</span>
              <span className="text-white ml-2 capitalize">{meta.goal}</span>
            </div>
            <div>
              <span className="text-white/70">Audience:</span>
              <span className="text-white ml-2 capitalize">{meta.audience}</span>
            </div>
            <div>
              <span className="text-white/70">Duration:</span>
              <span className="text-white ml-2">{meta.weeks} weeks</span>
            </div>
          </div>
          {meta.description && (
            <div>
              <span className="text-white/70 text-sm">Description:</span>
              <p className="text-white/90 text-sm mt-1">{meta.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ARIA Suggestions */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            ARIA Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-white/90">Consider adding more recovery sessions between high-intensity days</p>
              <p className="text-white/60 text-xs mt-1">This can help improve adaptation and reduce injury risk</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-white/90">Good progression pattern detected across weeks</p>
              <p className="text-white/60 text-xs mt-1">Volume and intensity increase appropriately</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button
          onClick={onPrev}
          variant="outline"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          Previous Step
        </Button>
        
        <div className="flex gap-3">
          <Button
            onClick={handleReOptimize}
            variant="outline"
            className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500/30 text-white hover:from-purple-600/30 hover:to-indigo-600/30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Re-optimize
          </Button>
          <Button
            onClick={onFinish}
            disabled={!isValid()}
            className="bg-green-600 hover:bg-green-500 text-white px-8"
          >
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
};
