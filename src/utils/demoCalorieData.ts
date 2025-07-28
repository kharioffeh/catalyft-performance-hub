// Demo data for testing calorie balance features
// This can be removed once wearable integration is fully connected

interface DemoCalorieData {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  bmr: number;
  totalExpenditure: number;
  balance: number;
  balancePercentage: number;
}

export const generateDemoCalorieData = (days: number = 7): DemoCalorieData[] => {
  const data: DemoCalorieData[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate realistic calorie data with some variation
    const bmr = 1600 + (Math.random() * 200 - 100); // 1500-1700 BMR
    const activityCalories = 300 + (Math.random() * 400); // 300-700 activity calories
    const totalExpenditure = bmr + activityCalories;
    const caloriesConsumed = 1800 + (Math.random() * 600 - 300); // 1500-2100 consumed
    const balance = caloriesConsumed - totalExpenditure;
    const balancePercentage = (balance / totalExpenditure) * 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      caloriesConsumed: Math.round(caloriesConsumed),
      caloriesBurned: Math.round(activityCalories),
      bmr: Math.round(bmr),
      totalExpenditure: Math.round(totalExpenditure),
      balance: Math.round(balance),
      balancePercentage: Math.round(balancePercentage * 10) / 10,
    });
  }
  
  return data.reverse(); // Oldest first
};

export const getDemoTodaysData = (): DemoCalorieData => {
  const data = generateDemoCalorieData(1);
  return data[0];
};