import { format, subDays, addDays, addHours, startOfDay } from 'date-fns';
// Base metrics for solo athlete mock data
const baseSoloMetrics = {
    baseReadiness: 75,
    baseSleep: 7.5,
    baseLoad: 12
};
// Generate chart data from raw data
export const formatChartData = (rawData, xKey, yKey) => {
    return rawData.map(item => ({
        x: item[xKey],
        y: item[yKey] || 0
    }));
};
// Generate chart data with hourly formatting
export const formatHourlyChartData = (rawData, xKey, yKey) => {
    return rawData.map(item => ({
        x: item[xKey],
        y: item[yKey] || 0,
        hour: new Date(item[xKey]).getHours()
    }));
};
// Generate sleep chart data with stages
export const formatSleepChartData = (rawData) => {
    return rawData.map(item => ({
        x: item.day,
        y: item.total_sleep_hours || 0,
        deep: (item.deep_minutes || 0) / 60,
        light: (item.light_minutes || 0) / 60,
        rem: (item.rem_minutes || 0) / 60
    }));
};
// Generate hourly sleep chart data
export const formatHourlySleepChartData = (rawData) => {
    return rawData.map(item => ({
        x: item.day,
        y: item.total_sleep_hours || 0,
        deep: (item.deep_minutes || 0) / 60,
        light: (item.light_minutes || 0) / 60,
        rem: (item.rem_minutes || 0) / 60,
        hour: new Date(item.day).getHours()
    }));
};
// Generate load secondary data for acute vs chronic comparison
export const formatLoadSecondaryData = (rawData) => {
    return rawData.map(item => ({
        x: item.day,
        y: (item.acute_7d || 0) + (item.chronic_28d || 0),
        acute: item.acute_7d || 0,
        chronic: item.chronic_28d || 0
    }));
};
// Generate hourly load secondary data
export const formatHourlyLoadSecondaryData = (rawData) => {
    return rawData.map(item => ({
        x: item.day,
        y: (item.acute_7d || 0) + (item.chronic_28d || 0),
        acute: item.acute_7d || 0,
        chronic: item.chronic_28d || 0,
        hour: new Date(item.day).getHours()
    }));
};
// Generate realistic readiness data for solo athletes
export const generateReadinessData = (athleteId, period) => {
    const endDate = new Date();
    const startDate = subDays(endDate, period);
    const data = [];
    let currentScore = baseSoloMetrics.baseReadiness;
    for (let i = 0; i <= period; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        const dayOfWeek = addDays(startDate, i).getDay();
        // Add weekly patterns (weekend recovery)
        const weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 5 : 0;
        // Add training stress patterns
        let trainingStress = 0;
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
            trainingStress = -3; // Hard training days
        }
        // Random variation
        const randomVariation = (Math.random() - 0.5) * 8;
        // Calculate score with bounds
        currentScore = Math.max(30, Math.min(100, baseSoloMetrics.baseReadiness + weekendBonus + trainingStress + randomVariation));
        data.push({
            day: date,
            readiness_score: Math.round(currentScore),
            avg_7d: Math.round(currentScore + (Math.random() - 0.5) * 3),
            avg_30d: Math.round(baseSoloMetrics.baseReadiness + (Math.random() - 0.5) * 5),
            avg_90d: Math.round(baseSoloMetrics.baseReadiness + (Math.random() - 0.5) * 3)
        });
    }
    return data;
};
// Generate hourly readiness data for 24h view
export const generateHourlyReadinessData = (athleteId) => {
    const athlete = baseSoloMetrics;
    const now = new Date();
    const startOfCurrentDay = startOfDay(now);
    const data = [];
    let currentScore = athlete.baseReadiness;
    for (let i = 0; i < 24; i++) {
        const timestamp = addHours(startOfCurrentDay, i);
        const hour = i;
        // Circadian rhythm patterns
        let circadianEffect = 0;
        if (hour >= 6 && hour <= 10) {
            circadianEffect = 5; // Morning boost
        }
        else if (hour >= 14 && hour <= 16) {
            circadianEffect = -3; // Afternoon dip
        }
        else if (hour >= 22 || hour <= 5) {
            circadianEffect = -5; // Night/early morning low
        }
        // Post-workout effects (assuming workout around 17:00)
        let workoutEffect = 0;
        if (hour >= 17 && hour <= 19) {
            workoutEffect = -8; // During/immediately after workout
        }
        else if (hour >= 20 && hour <= 22) {
            workoutEffect = 3; // Recovery boost
        }
        const randomVariation = (Math.random() - 0.5) * 4;
        currentScore = Math.max(30, Math.min(100, athlete.baseReadiness + circadianEffect + workoutEffect + randomVariation));
        data.push({
            day: timestamp.toISOString(),
            readiness_score: Math.round(currentScore),
            avg_7d: Math.round(currentScore + (Math.random() - 0.5) * 2),
            avg_30d: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 3),
            avg_90d: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 2)
        });
    }
    return data;
};
// Generate realistic training load data with ACWR calculations
export const generateLoadData = (athleteId, period) => {
    const athlete = baseSoloMetrics;
    const endDate = new Date();
    const startDate = subDays(endDate, period);
    const data = [];
    const loads = [];
    // Generate daily loads first
    for (let i = 0; i <= period; i++) {
        const dayOfWeek = addDays(startDate, i).getDay();
        let dailyLoad = 0;
        // Training pattern: Hard on Mon/Wed/Fri, easy Tue/Thu, rest weekends
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
            dailyLoad = athlete.baseLoad + (Math.random() - 0.3) * 8; // Hard days
        }
        else if (dayOfWeek === 2 || dayOfWeek === 4) {
            dailyLoad = athlete.baseLoad * 0.6 + (Math.random() - 0.5) * 4; // Easy days
        }
        else {
            dailyLoad = athlete.baseLoad * 0.2 + Math.random() * 3; // Rest days
        }
        loads.push(Math.max(0, dailyLoad));
    }
    // Calculate rolling averages and ACWR
    for (let i = 0; i <= period; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        const dailyLoad = loads[i];
        // Calculate acute load (7-day average)
        const acute7dStart = Math.max(0, i - 6);
        const acute7d = loads.slice(acute7dStart, i + 1).reduce((sum, load) => sum + load, 0) / 7;
        // Calculate chronic load (28-day average)
        const chronic28dStart = Math.max(0, i - 27);
        const chronic28d = loads.slice(chronic28dStart, i + 1).reduce((sum, load) => sum + load, 0) / 28;
        // Calculate ACWR
        const acwr = chronic28d > 0 ? acute7d / chronic28d : 0;
        data.push({
            day: date,
            daily_load: Number(dailyLoad.toFixed(1)),
            acute_7d: Number(acute7d.toFixed(1)),
            chronic_28d: Number(chronic28d.toFixed(1)),
            acwr_7_28: Number(acwr.toFixed(2))
        });
    }
    return data;
};
// Calculate tonnage from session data
export const calculateTonnage = (sets) => {
    return sets.reduce((total, set) => total + (set.reps * set.load), 0);
};
// Calculate estimated 1RM using Epley formula
export const calculateEpley1RM = (weight, reps) => {
    if (reps === 1)
        return weight;
    return weight * (1 + (reps / 30));
};
// Calculate estimated 1RM using Brzycki formula
export const calculateBrzycki1RM = (weight, reps) => {
    if (reps === 1)
        return weight;
    return weight / (1.0278 - (0.0278 * reps));
};
// Get nutrition targets for user
export const calculateNutritionTargets = (weight, height, age, gender, activityLevel) => {
    // Calculate BMR using Mifflin-St Jeor equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    }
    else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };
    const calories = bmr * activityMultipliers[activityLevel];
    // Macronutrient distribution (as percentages of calories)
    const proteinPercent = 0.25; // 25% protein
    const carbPercent = 0.45; // 45% carbs
    const fatPercent = 0.30; // 30% fat
    return {
        calories: Math.round(calories),
        protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
        carbs: Math.round((calories * carbPercent) / 4), // 4 cal/g
        fat: Math.round((calories * fatPercent) / 9) // 9 cal/g
    };
};
// Calculate readiness score from various metrics
export const calculateCompositeReadinessScore = (metrics) => {
    const weights = {
        hrv: 0.3,
        restingHR: 0.2,
        sleepScore: 0.25,
        soreness: 0.15,
        motivation: 0.1
    };
    let totalScore = 0;
    let totalWeight = 0;
    if (metrics.hrv !== undefined) {
        // Normalize HRV (assuming 20-80 range, higher is better)
        const hrvScore = Math.min(100, Math.max(0, ((metrics.hrv - 20) / 60) * 100));
        totalScore += hrvScore * weights.hrv;
        totalWeight += weights.hrv;
    }
    if (metrics.restingHR !== undefined) {
        // Normalize resting HR (assuming 40-100 range, lower is better)
        const hrScore = Math.min(100, Math.max(0, ((100 - metrics.restingHR) / 60) * 100));
        totalScore += hrScore * weights.restingHR;
        totalWeight += weights.restingHR;
    }
    if (metrics.sleepScore !== undefined) {
        // Sleep score already 0-100
        totalScore += metrics.sleepScore * weights.sleepScore;
        totalWeight += weights.sleepScore;
    }
    if (metrics.soreness !== undefined) {
        // Soreness 1-10 scale, lower is better
        const sorenessScore = Math.max(0, ((10 - metrics.soreness) / 9) * 100);
        totalScore += sorenessScore * weights.soreness;
        totalWeight += weights.soreness;
    }
    if (metrics.motivation !== undefined) {
        // Motivation 1-10 scale, higher is better
        const motivationScore = ((metrics.motivation - 1) / 9) * 100;
        totalScore += motivationScore * weights.motivation;
        totalWeight += weights.motivation;
    }
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};
