# Enhanced Nutrition Components

This directory contains enhanced nutrition tracking components inspired by MyFitnessPal's modern design.

## New Components

### MacroRing
Individual macro progress rings with percentage display and color coding.

```tsx
<MacroRing 
  macro="Protein" 
  value={120} 
  target={150} 
  color="#EF4444" 
  size={80}
/>
```

### MacroBadge
Compact macro value badges for food cards with color coding.

```tsx
<MacroBadge type="P" value={25} size="sm" />
<MacroBadge type="C" value={45} size="sm" />
<MacroBadge type="F" value={12} size="sm" />
```

### Swipeable
Touch-friendly swipe-to-delete functionality for food items.

```tsx
<Swipeable onSwipeRight={() => deleteFood(id)}>
  <FoodCard food={food} />
</Swipeable>
```

### FoodCard
Enhanced food display with images, macro badges, and modern styling.

```tsx
<FoodCard 
  food={foodData} 
  onDelete={() => handleDelete(food.id)}
/>
```

### MacroSummaryCard
Top-level macro summary with visual rings and calorie tracking.

```tsx
<MacroSummaryCard
  calories={{ current: 1850, target: 2400 }}
  protein={{ current: 120, target: 150 }}
  carbs={{ current: 200, target: 250 }}
  fats={{ current: 65, target: 80 }}
/>
```

### MealSection
Organized meal display with macro breakdowns and food lists.

```tsx
<MealSection
  name="Breakfast"
  time="8:00 AM"
  foods={breakfastFoods}
  totalCalories={420}
  totalProtein={25}
  totalCarbs={45}
  totalFats={18}
>
  {/* Food items go here */}
</MealSection>
```

## Key Features

- **Visual Macro Tracking**: Circular progress rings for each macro
- **Food Images**: High-quality food photos with fallback images
- **Swipe to Delete**: Touch-friendly food removal
- **Modern UI**: Glass morphism design with backdrop blur
- **Responsive Layout**: Works on both mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Design Philosophy

The enhanced design focuses on:
1. **Visual Progress**: Easy-to-see macro tracking
2. **Food Recognition**: Images help identify logged foods
3. **Quick Actions**: Swipe gestures for common tasks
4. **Clean Information**: Organized, scannable layout
5. **Modern Aesthetics**: Contemporary design language

## Usage in FoodDiaryScreen

The main FoodDiaryScreen now uses these components to create a comprehensive, visually appealing nutrition tracking experience that rivals MyFitnessPal's interface.