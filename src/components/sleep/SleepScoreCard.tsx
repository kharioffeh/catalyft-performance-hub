import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Moon } from 'lucide-react';

interface SleepScoreProps {
  score: number;
  previousScore?: number;
  sleepHours: number;
  efficiency: number;
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreGrade = (score: number) => {
  if (score >= 90) return { grade: 'A+', description: 'Excellent' };
  if (score >= 85) return { grade: 'A', description: 'Great' };
  if (score >= 80) return { grade: 'B+', description: 'Good' };
  if (score >= 70) return { grade: 'B', description: 'Fair' };
  if (score >= 60) return { grade: 'C', description: 'Needs Work' };
  return { grade: 'D', description: 'Poor' };
};

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (current < previous) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-white/60" />;
};

export const SleepScoreCard: React.FC<SleepScoreProps> = ({
  score,
  previousScore = 0,
  sleepHours,
  efficiency,
  className = ''
}) => {
  const scoreColor = getScoreColor(score);
  const { grade, description } = getScoreGrade(score);

  return (
    <Card className={`bg-white/5 border-white/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
          <span>Sleep Score</span>
          <Moon className="w-5 h-5 text-blue-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${scoreColor} animate-scale-in`}>
            {score}
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge 
              className={`${scoreColor.replace('text-', 'bg-').replace('400', '500/20')} ${scoreColor} border-0`}
            >
              {grade}
            </Badge>
            <span className="text-sm text-white/70">{description}</span>
          </div>
          
          {/* Trend Indicator */}
          {previousScore > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2 animate-fade-in">
              {getTrendIcon(score, previousScore)}
              <span className="text-xs text-white/60">
                {score > previousScore ? '+' : ''}{score - previousScore} from last night
              </span>
            </div>
          )}
        </div>

        {/* Sleep Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {sleepHours}<span className="text-sm text-white/60">h</span>
            </div>
            <div className="text-xs text-white/60">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {efficiency}<span className="text-sm text-white/60">%</span>
            </div>
            <div className="text-xs text-white/60">Efficiency</div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-3">
          {/* Duration Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Sleep Duration</span>
              <span className="text-white/60">{sleepHours}h / 8h</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min((sleepHours / 8) * 100, 100)}%`,
                  animationDelay: '300ms'
                }}
              />
            </div>
          </div>

          {/* Efficiency Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Sleep Efficiency</span>
              <span className="text-white/60">{efficiency}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${efficiency}%`,
                  animationDelay: '600ms'
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-xs text-white/60">
            {score < 70 && sleepHours < 7 && "Try to get more sleep for better recovery"}
            {score < 70 && sleepHours >= 7 && efficiency < 85 && "Focus on sleep quality and consistency"}
            {score >= 70 && score < 85 && "Good sleep! Keep maintaining your routine"}
            {score >= 85 && "Excellent sleep quality! 🌙"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};