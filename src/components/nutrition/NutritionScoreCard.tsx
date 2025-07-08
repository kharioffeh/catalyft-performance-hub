import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';

interface NutritionScoreProps {
  score: number;
  previousScore?: number;
  mealsLogged: number;
  targetMeals: number;
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

export const NutritionScoreCard: React.FC<NutritionScoreProps> = ({
  score,
  previousScore = 0,
  mealsLogged,
  targetMeals,
  className = ''
}) => {
  const scoreColor = getScoreColor(score);
  const { grade, description } = getScoreGrade(score);
  const completionRate = (mealsLogged / targetMeals) * 100;

  return (
    <Card className={`bg-white/5 border-white/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-white">
          <span>Nutrition Score</span>
          <Star className="w-5 h-5 text-yellow-400" />
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
                {score > previousScore ? '+' : ''}{score - previousScore} from yesterday
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Daily Progress</span>
            <span className="text-white/60">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out animate-fade-in"
              style={{ 
                width: `${Math.min(completionRate, 100)}%`,
                animationDelay: '300ms'
              }}
            />
          </div>
        </div>

        {/* Meals Logged */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-sm text-white/70">Meals Logged</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {mealsLogged} / {targetMeals}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: targetMeals }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i < mealsLogged ? 'bg-green-400' : 'bg-white/20'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-xs text-white/60">
            {score < 70 && mealsLogged < targetMeals && "Log more meals to improve your score"}
            {score < 70 && mealsLogged >= targetMeals && "Focus on balanced macro ratios"}
            {score >= 70 && score < 85 && "Great progress! Keep it consistent"}
            {score >= 85 && "Excellent nutrition habits! 🎉"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};