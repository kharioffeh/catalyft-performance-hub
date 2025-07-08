import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Scan } from 'lucide-react';
import { MealEntry } from '@/hooks/useNutrition';
import { BarcodeScanner } from './BarcodeScanner';

interface AddMealDialogProps {
  onAddMeal: (meal: Omit<MealEntry, 'id' | 'createdAt'>) => void;
  trigger?: React.ReactNode;
}

export const AddMealDialog: React.FC<AddMealDialogProps> = ({ 
  onAddMeal, 
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    time: new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    date: new Date().toISOString().split('T')[0],
  });

  const handleScanSuccess = (foodItem: any) => {
    setFormData(prev => ({
      ...prev,
      name: foodItem.name,
      description: foodItem.description,
      calories: foodItem.calories.toString(),
      protein: foodItem.protein.toString(),
      carbs: foodItem.carbs.toString(),
      fat: foodItem.fat.toString(),
    }));
    setScannerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }

    onAddMeal({
      name: formData.name,
      description: formData.description,
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      protein: formData.protein ? parseInt(formData.protein) : undefined,
      carbs: formData.carbs ? parseInt(formData.carbs) : undefined,
      fat: formData.fat ? parseInt(formData.fat) : undefined,
      time: formData.time,
      date: formData.date,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: new Date().toISOString().split('T')[0],
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1A1B23] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Log New Meal</DialogTitle>
        </DialogHeader>
        
        {/* Barcode Scanner Button */}
        <div className="flex justify-center mb-4">
          <Button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Scan className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name" className="text-white/90">
                Meal Name
              </Label>
              <Input
                id="meal-name"
                placeholder="e.g., Breakfast, Lunch"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meal-time" className="text-white/90">
                Time
              </Label>
              <Input
                id="meal-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-description" className="text-white/90">
              What did you eat?
            </Label>
            <Textarea
              id="meal-description"
              placeholder="Describe your meal items..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
              required
            />
          </div>

          {/* Nutrition Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-calories" className="text-white/90">
                Calories
              </Label>
              <Input
                id="meal-calories"
                type="number"
                placeholder="0"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meal-protein" className="text-white/90">
                Protein (g)
              </Label>
              <Input
                id="meal-protein"
                type="number"
                placeholder="0"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-carbs" className="text-white/90">
                Carbs (g)
              </Label>
              <Input
                id="meal-carbs"
                type="number"
                placeholder="0"
                value={formData.carbs}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meal-fat" className="text-white/90">
                Fat (g)
              </Label>
              <Input
                id="meal-fat"
                type="number"
                placeholder="0"
                value={formData.fat}
                onChange={(e) => setFormData(prev => ({ ...prev, fat: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-date" className="text-white/90">
              Date
            </Label>
            <Input
              id="meal-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="bg-white/5 border-white/20 text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log Meal
            </Button>
          </div>
        </form>

        {/* Barcode Scanner */}
        <BarcodeScanner
          isOpen={scannerOpen}
          onScanSuccess={handleScanSuccess}
          onClose={() => setScannerOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};