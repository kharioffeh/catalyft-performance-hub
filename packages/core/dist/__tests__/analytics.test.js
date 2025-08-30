import { calculateTonnage, calculateEpley1RM, calculateBrzycki1RM, calculateNutritionTargets, calculateCompositeReadinessScore, formatChartData } from '../utils/analytics';
describe('Analytics Utilities', () => {
    describe('calculateTonnage', () => {
        it('calculates tonnage correctly', () => {
            const sets = [
                { reps: 5, load: 100 },
                { reps: 5, load: 100 },
                { reps: 3, load: 120 }
            ];
            expect(calculateTonnage(sets)).toBe(1360); // (5*100) + (5*100) + (3*120)
        });
        it('handles empty sets', () => {
            expect(calculateTonnage([])).toBe(0);
        });
    });
    describe('calculateEpley1RM', () => {
        it('calculates 1RM correctly', () => {
            expect(calculateEpley1RM(100, 5)).toBeCloseTo(116.67, 1);
            expect(calculateEpley1RM(100, 1)).toBe(100);
        });
    });
    describe('calculateBrzycki1RM', () => {
        it('calculates 1RM correctly', () => {
            expect(calculateBrzycki1RM(100, 5)).toBeCloseTo(112.51, 1);
            expect(calculateBrzycki1RM(100, 1)).toBe(100);
        });
    });
    describe('calculateNutritionTargets', () => {
        it('calculates nutrition targets for male', () => {
            const targets = calculateNutritionTargets(80, 180, 30, 'male', 'moderate');
            expect(targets.calories).toBeGreaterThan(2000);
            expect(targets.protein).toBeGreaterThan(0);
            expect(targets.carbs).toBeGreaterThan(0);
            expect(targets.fat).toBeGreaterThan(0);
        });
        it('calculates different targets for female', () => {
            const maleTargets = calculateNutritionTargets(80, 180, 30, 'male', 'moderate');
            const femaleTargets = calculateNutritionTargets(80, 180, 30, 'female', 'moderate');
            expect(femaleTargets.calories).toBeLessThan(maleTargets.calories);
        });
    });
    describe('calculateCompositeReadinessScore', () => {
        it('calculates readiness score with all metrics', () => {
            const metrics = {
                hrv: 40,
                restingHR: 60,
                sleepScore: 85,
                soreness: 3,
                motivation: 8
            };
            const score = calculateCompositeReadinessScore(metrics);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });
        it('handles partial metrics', () => {
            const metrics = {
                sleepScore: 80,
                motivation: 7
            };
            const score = calculateCompositeReadinessScore(metrics);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });
        it('returns 0 for no metrics', () => {
            expect(calculateCompositeReadinessScore({})).toBe(0);
        });
    });
    describe('formatChartData', () => {
        it('formats data correctly', () => {
            const rawData = [
                { day: '2024-01-01', score: 75 },
                { day: '2024-01-02', score: 80 }
            ];
            const formatted = formatChartData(rawData, 'day', 'score');
            expect(formatted).toEqual([
                { x: '2024-01-01', y: 75 },
                { x: '2024-01-02', y: 80 }
            ]);
        });
        it('handles missing values', () => {
            const rawData = [
                { day: '2024-01-01', score: 75 },
                { day: '2024-01-02' }
            ];
            const formatted = formatChartData(rawData, 'day', 'score');
            expect(formatted[1].y).toBe(0);
        });
    });
});
