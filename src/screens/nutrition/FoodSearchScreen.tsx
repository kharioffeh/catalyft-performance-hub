import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Camera, Plus, Filter, Star, Clock, Zap, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  thumbnail: string;
  isFavorite: boolean;
  lastUsed?: string;
}

const FoodSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentFoods] = useState<FoodItem[]>([
    {
      id: '1',
      name: 'Greek Yogurt',
      brand: 'Chobani',
      calories: 130,
      protein: 15,
      carbs: 9,
      fat: 4,
      servingSize: '150g',
      thumbnail: '🥛',
      isFavorite: true,
      lastUsed: '2 hours ago'
    },
    {
      id: '2',
      name: 'Banana',
      brand: 'Organic',
      calories: 105,
      protein: 1,
      carbs: 27,
      fat: 0,
      servingSize: '120g',
      thumbnail: '🍌',
      isFavorite: false,
      lastUsed: '1 day ago'
    }
  ]);

  const [searchResults] = useState<FoodItem[]>([
    {
      id: '3',
      name: 'Chicken Breast',
      brand: 'Perdue',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 4,
      servingSize: '100g',
      thumbnail: '🍗',
      isFavorite: false
    },
    {
      id: '4',
      name: 'Oatmeal',
      brand: 'Quaker',
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      servingSize: '40g dry',
      thumbnail: '🥣',
      isFavorite: true
    },
    {
      id: '5',
      name: 'Almonds',
      brand: 'Blue Diamond',
      calories: 164,
      protein: 6,
      carbs: 6,
      fat: 14,
      servingSize: '28g',
      thumbnail: '🥜',
      isFavorite: false
    },
    {
      id: '6',
      name: 'Salmon',
      brand: 'Wild Alaskan',
      calories: 208,
      protein: 25,
      carbs: 0,
      fat: 12,
      servingSize: '100g',
      thumbnail: '🐟',
      isFavorite: true
    }
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'proteins', name: 'Proteins', icon: '🥩' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' }
  ];

  const [addedFoods, setAddedFoods] = useState<Set<string>>(new Set());

  const handleAddFood = (food: FoodItem) => {
    // Add to local state to show visual feedback
    setAddedFoods(prev => new Set(prev).add(food.id));

    // Show success toast
    toast({
      title: 'Food Added',
      description: `${food.name} (${food.calories} kcal) added to your meal`,
    });

    // In a full implementation, this would save to the database
    // For now, just log it
    console.log('Added food:', food);
  };

  const handleScanBarcode = () => {
    // Barcode scanning requires native camera access
    // Show informative toast for web users
    toast({
      title: 'Barcode Scanner',
      description: 'Barcode scanning is available in the mobile app. Please use manual search for now.',
    });
  };

  const filteredResults = searchQuery 
    ? searchResults.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Food Search</h1>
          <p className="text-slate-300">Find and add foods to your meals</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for foods, brands, or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-24 py-4 bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-full text-lg"
            />
            <Button
              onClick={handleScanBarcode}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Recent Foods */}
        {!searchQuery && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-semibold text-white">Recent Foods</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentFoods.map((food) => (
                <Card key={food.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{food.thumbnail}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white truncate">{food.name}</h3>
                            {food.brand && (
                              <p className="text-sm text-slate-400 truncate">{food.brand}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddFood(food)}
                            disabled={addedFoods.has(food.id)}
                            className={`rounded-full px-3 py-1 ${
                              addedFoods.has(food.id)
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {addedFoods.has(food.id) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white font-medium">{food.calories} kcal</span>
                          <span className="text-red-400">{food.protein}g protein</span>
                          <span className="text-yellow-400">{food.carbs}g carbs</span>
                          <span className="text-green-400">{food.fat}g fat</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">{food.servingSize}</span>
                          {food.lastUsed && (
                            <span className="text-xs text-slate-500">{food.lastUsed}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-semibold text-white">
                Search Results ({filteredResults.length})
              </h2>
            </div>
            
            {filteredResults.length === 0 ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-white mb-2">No foods found</h3>
                  <p className="text-slate-400">Try adjusting your search terms or scan a barcode</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((food) => (
                  <Card key={food.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{food.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-white truncate">{food.name}</h3>
                              {food.brand && (
                                <p className="text-sm text-slate-400 truncate">{food.brand}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {food.isFavorite && (
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleAddFood(food)}
                                disabled={addedFoods.has(food.id)}
                                className={`rounded-full px-3 py-1 ${
                                  addedFoods.has(food.id)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {addedFoods.has(food.id) ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-white font-medium">{food.calories} kcal</span>
                            <span className="text-red-400">{food.protein}g protein</span>
                            <span className="text-yellow-400">{food.carbs}g carbs</span>
                            <span className="text-green-400">{food.fat}g fat</span>
                          </div>

                          <div className="mt-2">
                            <span className="text-xs text-slate-400">{food.servingSize}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodSearchScreen;