import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Plus, Minus, Target, TrendingUp, Clock, Zap, Droplet } from 'lucide-react';

interface WaterIntake {
  current: number;
  target: number;
  unit: 'ml' | 'oz' | 'cups';
  history: {
    time: string;
    amount: number;
    type: 'water' | 'beverage' | 'food';
  }[];
}

const WaterIntakeScreen: React.FC = () => {
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({
    current: 1250,
    target: 2500,
    unit: 'ml',
    history: [
      { time: '8:00 AM', amount: 250, type: 'water' },
      { time: '10:30 AM', amount: 300, type: 'water' },
      { time: '12:00 PM', amount: 200, type: 'beverage' },
      { time: '2:30 PM', amount: 250, type: 'water' },
      { time: '4:00 PM', amount: 250, type: 'water' }
    ]
  });

  const [selectedUnit, setSelectedUnit] = useState<'ml' | 'oz' | 'cups'>('ml');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAmount, setAddAmount] = useState(250);

  const unitConversions = {
    ml: { oz: 0.033814, cups: 0.00422675 },
    oz: { ml: 29.5735, cups: 0.125 },
    cups: { ml: 236.588, oz: 8 }
  };

  const convertUnit = (value: number, from: string, to: string) => {
    if (from === to) return value;
    return value * unitConversions[from as keyof typeof unitConversions][to as keyof typeof unitConversions[typeof from]];
  };

  const getProgressPercentage = () => {
    return Math.min((waterIntake.current / waterIntake.target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'from-blue-400 to-cyan-400';
    if (percentage >= 70) return 'from-blue-500 to-blue-400';
    if (percentage >= 50) return 'from-blue-600 to-blue-500';
    return 'from-blue-700 to-blue-600';
  };

  const addWater = (amount: number) => {
    const newCurrent = waterIntake.current + amount;
    const newHistory = [
      {
        time: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        amount,
        type: 'water' as const
      },
      ...waterIntake.history
    ];

    setWaterIntake({
      ...waterIntake,
      current: newCurrent,
      history: newHistory.slice(0, 10) // Keep only last 10 entries
    });
  };

  const quickAddAmounts = [100, 200, 250, 300, 500];

  const getBottleHeight = () => {
    const percentage = getProgressPercentage();
    return Math.min(percentage, 100);
  };

  const getBottleColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return 'bg-gradient-to-b from-blue-300 to-blue-500';
    if (percentage >= 70) return 'bg-gradient-to-b from-blue-400 to-blue-600';
    if (percentage >= 50) return 'bg-gradient-to-b from-blue-500 to-blue-700';
    return 'bg-gradient-to-b from-blue-600 to-blue-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Water Intake</h1>
          <p className="text-slate-300">Stay hydrated throughout the day</p>
        </div>

        {/* Main Water Bottle Display */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Animated Water Bottle */}
              <div className="relative">
                <div className="w-32 h-64 bg-white/10 rounded-full border-4 border-white/20 relative overflow-hidden">
                  {/* Water Level */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 ${getBottleColor()} transition-all duration-1000 ease-out`}
                    style={{ 
                      height: `${getBottleHeight()}%`,
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                    }}
                  >
                    {/* Water Ripple Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  {/* Bottle Cap */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-white/30 rounded-full"></div>
                  
                  {/* Bottle Neck */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white/10 rounded-full"></div>
                </div>
                
                {/* Progress Ring Around Bottle */}
                <div className="absolute inset-0">
                  <svg width="128" height="256" className="transform -rotate-90">
                    <circle
                      cx="64"
                      cy="128"
                      r="60"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="64"
                      cy="128"
                      r="60"
                      fill="none"
                      stroke="url(#waterGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - getProgressPercentage() / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Droplets Animation */}
                {getProgressPercentage() > 0 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
                    <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>

              {/* Progress Info */}
              <div className="text-center lg:text-left space-y-6">
                <div>
                  <div className="text-5xl font-bold text-white mb-2">
                    {waterIntake.current}
                  </div>
                  <div className="text-lg text-slate-300">
                    of {waterIntake.target} {selectedUnit}
                  </div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {Math.round(getProgressPercentage())}%
                  </div>
                  <div className="text-sm text-slate-400">Daily Goal Progress</div>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {Math.round(waterIntake.target - waterIntake.current)}
                    </div>
                    <div className="text-xs text-slate-400">Remaining</div>
                  </div>
                  
                  <div className="w-px h-8 bg-white/20"></div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {Math.round(waterIntake.current / 8)}
                    </div>
                    <div className="text-xs text-slate-400">Glasses (8oz)</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Buttons */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Add Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              {quickAddAmounts.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => addWater(amount)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full"
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  +{amount} {selectedUnit}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(true)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Custom Amount
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unit Selector */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Unit Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 justify-center">
              {(['ml', 'oz', 'cups'] as const).map((unit) => (
                <Button
                  key={unit}
                  variant={selectedUnit === unit ? "default" : "outline"}
                  onClick={() => setSelectedUnit(unit)}
                  className={selectedUnit === unit 
                    ? 'bg-blue-600 text-white' 
                    : 'border-white/20 text-white hover:bg-white/10'
                  }
                >
                  {unit.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's History */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Intake History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waterIntake.history.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <div>
                      <div className="font-medium text-white">{entry.time}</div>
                      <div className="text-sm text-slate-400 capitalize">{entry.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">+{entry.amount} {selectedUnit}</div>
                    <div className="text-xs text-slate-400">
                      {Math.round((entry.amount / waterIntake.target) * 100)}% of daily goal
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hydration Tips */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Hydration Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">Morning Hydration</span>
                </div>
                <p className="text-sm text-slate-300">Drink 1-2 glasses of water first thing in the morning to rehydrate after sleep.</p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">Set Reminders</span>
                </div>
                <p className="text-sm text-slate-300">Use phone reminders or apps to stay on track with your hydration goals.</p>
              </div>
              
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-white">Exercise Hydration</span>
                </div>
                <p className="text-sm text-slate-300">Drink extra water before, during, and after exercise sessions.</p>
              </div>
              
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">Evening Cutoff</span>
                </div>
                <p className="text-sm text-slate-300">Reduce water intake 2-3 hours before bedtime to avoid sleep disruption.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Add Custom Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Amount ({selectedUnit})</label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      addWater(addAmount);
                      setShowAddModal(false);
                      setAddAmount(250);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Water
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterIntakeScreen;