export declare const formatChartData: (rawData: any[], xKey: string, yKey: string) => {
    x: any;
    y: any;
}[];
export declare const formatHourlyChartData: (rawData: any[], xKey: string, yKey: string) => {
    x: any;
    y: any;
    hour: number;
}[];
export declare const formatSleepChartData: (rawData: any[]) => {
    x: any;
    y: any;
    deep: number;
    light: number;
    rem: number;
}[];
export declare const formatHourlySleepChartData: (rawData: any[]) => {
    x: any;
    y: any;
    deep: number;
    light: number;
    rem: number;
    hour: number;
}[];
export declare const formatLoadSecondaryData: (rawData: any[]) => {
    x: any;
    y: any;
    acute: any;
    chronic: any;
}[];
export declare const formatHourlyLoadSecondaryData: (rawData: any[]) => {
    x: any;
    y: any;
    acute: any;
    chronic: any;
    hour: number;
}[];
export declare const generateReadinessData: (athleteId: string, period: number) => any[];
export declare const generateHourlyReadinessData: (athleteId: string) => any[];
export declare const generateLoadData: (athleteId: string, period: number) => any[];
export declare const calculateTonnage: (sets: Array<{
    reps: number;
    load: number;
}>) => number;
export declare const calculateEpley1RM: (weight: number, reps: number) => number;
export declare const calculateBrzycki1RM: (weight: number, reps: number) => number;
export declare const calculateNutritionTargets: (weight: number, height: number, age: number, gender: "male" | "female", activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active") => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};
export declare const calculateCompositeReadinessScore: (metrics: {
    hrv?: number;
    restingHR?: number;
    sleepScore?: number;
    soreness?: number;
    motivation?: number;
}) => number;
