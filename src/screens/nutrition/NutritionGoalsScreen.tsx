import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, Save, TrendingUp, TrendingDown, Zap, Activity, Scale, Flame } from 'lucide-react';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface UserProfile {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight?: number;
}

const NutritionGoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 25,
    sugar: 50,
    sodium: 2300
  });

  const [profile, setProfile] = useState<UserProfile>({
    age: 30,
    weight: 70,
    height: 175,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { age, weight, height, gender } = profile;
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * activityMultipliers[profile.activityLevel];
  };

  // Calculate recommended calories based on goal
  const calculateRecommendedCalories = () => {
    const tdee = calculateTDEE();
    const goalAdjustments = {
      lose: -500, // 500 calorie deficit for weight loss
      maintain: 0,
      gain: 300 // 300 calorie surplus for weight gain
    };
    return Math.round(tdee + goalAdjustments[profile.goal]);
  };

  // Calculate macro ratios based on goals
  const calculateMacros = (calories: number) => {
    const proteinRatio = 0.25; // 25% of calories
    const fatRatio = 0.25; // 25% of calories
    const carbsRatio = 0.5; // 50% of calories

    return {
      protein: Math.round((calories * proteinRatio) / 4), // 4 calories per gram
      carbs: Math.round((calories * carbsRatio) / 4), // 4 calories per gram
      fat: Math.round((calories * fatRatio) / 9) // 9 calories per gram
    };
  };

  const recommendedCalories = calculateRecommendedCalories();
  const recommendedMacros = calculateMacros(recommendedCalories);

  const handleGoalChange = (key: keyof NutritionGoals, value: number[]) => {
    setGoals(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleProfileChange = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const applyRecommendedGoals = () => {
    const newGoals = {
      calories: recommendedCalories,
      protein: recommendedMacros.protein,
      carbs: recommendedMacros.carbs,
      fat: recommendedMacros.fat,
      fiber: 25,
      sugar: Math.round(recommendedCalories * 0.1 / 4), // 10% of calories
      sodium: 2300
    };
    setGoals(newGoals);
  };

  const getGoalStatus = (current: number, recommended: number) => {
    const diff = Math.abs(current - recommended);
    const percentage = (diff / recommended) * 100;
    
    if (percentage <= 5) return { status: 'optimal', color: 'text-green-400', icon: '✅' };
    if (percentage <= 15) return { status: 'good', color: 'text-yellow-400', icon: '⚠️' };
    return { status: 'needs-adjustment', color: 'text-red-400', icon: '❌' };
  };

  const getActivityLevelLabel = (level: string) => {
    const labels = {
      sedentary: 'Sedentary (little or no exercise)',
      light: 'Lightly active (light exercise 1-3 days/week)',
      moderate: 'Moderately active (moderate exercise 3-5 days/week)',
      active: 'Very active (hard exercise 6-7 days/week)',
      very_active: 'Extremely active (very hard exercise, physical job)'
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Nutrition Goals</h1>
          <p className="text-slate-300">Set and track your daily nutrition targets</p>
        </div>

        {/* Profile Calculator */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Profile & Calculator
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowCalculator(!showCalculator)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {showCalculator ? 'Hide' : 'Show'} Calculator
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showCalculator && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-white/5 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Age</label>
                  <Input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Weight (kg)</label>
                  <Input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => handleProfileChange('weight', parseFloat(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Height (cm)</label>
                  <Input
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleProfileChange('height', parseInt(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Activity Level</label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) => handleProfileChange('activityLevel', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                    <option value="very_active">Extremely Active</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Goal</label>
                  <select
                    value={profile.goal}
                    onChange={(e) => handleProfileChange('goal', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>
              </div>
            )}

            {/* Calculator Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{Math.round(calculateBMR())}</div>
                <div className="text-sm text-slate-300">BMR (Basal Metabolic Rate)</div>
                <div className="text-xs text-slate-400">calories/day</div>
              </div>
              
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{Math.round(calculateTDEE())}</div>
                <div className="text-sm text-slate-300">TDEE (Total Daily Energy)</div>
                <div className="text-xs text-slate-400">calories/day</div>
              </div>
              
              <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{recommendedCalories}</div>
                <div className="text-sm text-slate-300">Recommended Calories</div>
                <div className="text-xs text-slate-400">calories/day</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                onClick={applyRecommendedGoals}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Apply Recommended Goals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Macro Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calories */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Daily Calories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{goals.calories}</div>
                <div className="text-sm text-slate-400">calories per day</div>
              </div>
              
              <Slider
                value={[goals.calories]}
                onValueChange={(value) => handleGoalChange('calories', value)}
                max={4000}
                min={1200}
                step={50}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-slate-400">
                <span>1200</span>
                <span>2600</span>
                <span>4000</span>
              </div>
              
              <div className="text-center">
                {(() => {
                  const status = getGoalStatus(goals.calories, recommendedCalories);
                  return (
                    <div className={`text-sm ${status.color}`}>
                      {status.icon} {status.status === 'optimal' ? 'Optimal' : status.status === 'good' ? 'Good' : 'Needs adjustment'}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Protein */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" />
                Protein Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{goals.protein}g</div>
                <div className="text-sm text-slate-400">grams per day</div>
              </div>
              
              <Slider
                value={[goals.protein]}
                onValueChange={(value) => handleGoalChange('protein', value)}
                max={300}
                min={50}
                step={5}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-slate-400">
                <span>50g</span>
                <span>175g</span>
                <span>300g</span>
              </div>
              
              <div className="text-center">
                {(() => {
                  const status = getGoalStatus(goals.protein, recommendedMacros.protein);
                  return (
                    <div className={`text-sm ${status.color}`}>
                      {status.icon} {status.status === 'optimal' ? 'Optimal' : status.status === 'good' ? 'Good' : 'Needs adjustment'}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Carbs */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Carbohydrates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{goals.carbs}g</div>
                <div className="text-sm text-slate-400">grams per day</div>
              </div>
              
              <Slider
                value={[goals.carbs]}
                onValueChange={(value) => handleGoalChange('carbs', value)}
                max={400}
                min={50}
                step={10}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-slate-400">
                <span>50g</span>
                <span>225g</span>
                <span>400g</span>
              </div>
              
              <div className="text-center">
                {(() => {
                  const status = getGoalStatus(goals.carbs, recommendedMacros.carbs);
                  return (
                    <div className={`text-sm ${status.color}`}>
                      {status.icon} {status.status === 'optimal' ? 'Optimal' : status.status === 'good' ? 'Good' : 'Needs adjustment'}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Fat */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-green-400" />
                Fat Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{goals.fat}g</div>
                <div className="text-sm text-slate-400">grams per day</div>
              </div>
              
              <Slider
                value={[goals.fat]}
                onValueChange={(value) => handleGoalChange('fat', value)}
                max={150}
                min={30}
                step={5}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-slate-400">
                <span>30g</span>
                <span>90g</span>
                <span>150g</span>
              </div>
              
              <div className="text-center">
                {(() => {
                  const status = getGoalStatus(goals.fat, recommendedMacros.fat);
                  return (
                    <div className={`text-sm ${status.color}`}>
                      {status.icon} {status.status === 'optimal' ? 'Optimal' : status.status === 'good' ? 'Good' : 'Needs adjustment'}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Nutrients */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Additional Nutrients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Fiber (g)</label>
                <Input
                  type="number"
                  value={goals.fiber}
                  onChange={(e) => setGoals({ ...goals, fiber: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Sugar (g)</label>
                <Input
                  type="number"
                  value={goals.sugar}
                  onChange={(e) => setGoals({ ...goals, sugar: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Sodium (mg)</label>
                <Input
                  type="number"
                  value={goals.sodium}
                  onChange={(e) => setGoals({ ...goals, sodium: parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{goals.calories}</div>
                <div className="text-sm text-red-400">Calories</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{goals.protein}g</div>
                <div className="text-sm text-blue-400">Protein</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{goals.carbs}g</div>
                <div className="text-sm text-yellow-400">Carbs</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{goals.fat}g</div>
                <div className="text-sm text-green-400">Fat</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Save className="w-4 h-4 mr-2" />
                Save Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionGoalsScreen;