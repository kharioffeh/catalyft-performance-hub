import { generateInsights } from '../hooks/useInsights';
describe('Insights Generation', () => {
    describe('generateInsights', () => {
        it('generates readiness insight for low score', () => {
            const params = {
                metricsData: { recovery: 55 }
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('readiness');
            expect(insights[0].severity).toBe('red');
            expect(insights[0].message).toContain('Low readiness');
        });
        it('generates readiness insight for moderate score', () => {
            const params = {
                metricsData: { recovery: 75 }
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].severity).toBe('amber');
            expect(insights[0].message).toContain('Moderate readiness');
        });
        it('generates readiness insight for high score', () => {
            const params = {
                metricsData: { recovery: 85 }
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].severity).toBe('green');
            expect(insights[0].message).toContain('High readiness');
        });
        it('generates sleep insight for poor quality', () => {
            const params = {
                sleepScore: 65
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('sleep');
            expect(insights[0].severity).toBe('red');
            expect(insights[0].message).toContain('Poor sleep quality');
        });
        it('generates sleep insight for excellent quality', () => {
            const params = {
                sleepScore: 90
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].severity).toBe('green');
            expect(insights[0].message).toContain('Excellent sleep quality');
        });
        it('generates training load insight for high ACWR', () => {
            const params = {
                loadACWR: [{ acwr_7_28: 1.6 }]
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('load');
            expect(insights[0].severity).toBe('red');
            expect(insights[0].message).toContain('High training load');
            expect(insights[0].message).toContain('injury risk');
        });
        it('generates training load insight for optimal ACWR', () => {
            const params = {
                loadACWR: [{ acwr_7_28: 1.1 }]
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].severity).toBe('green');
            expect(insights[0].message).toContain('Optimal training load');
        });
        it('generates stress insight for high stress', () => {
            const params = {
                stressData: { current: 90 }
            };
            const insights = generateInsights(params);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('stress');
            expect(insights[0].severity).toBe('red');
            expect(insights[0].message).toContain('Elevated stress levels');
        });
        it('generates performance insight for peak state', () => {
            const params = {
                metricsData: { recovery: 90 },
                sleepScore: 90
            };
            const insights = generateInsights(params);
            expect(insights.some(insight => insight.type === 'general')).toBe(true);
            const performanceInsight = insights.find(insight => insight.type === 'general');
            expect(performanceInsight?.message).toContain('Peak performance window');
        });
        it('generates multiple insights when multiple conditions are met', () => {
            const params = {
                metricsData: { recovery: 85 },
                sleepScore: 90,
                stressData: { current: 25 },
                loadACWR: [{ acwr_7_28: 1.1 }]
            };
            const insights = generateInsights(params);
            expect(insights.length).toBeGreaterThan(1);
            expect(insights.some(insight => insight.type === 'readiness')).toBe(true);
            expect(insights.some(insight => insight.type === 'sleep')).toBe(true);
            expect(insights.some(insight => insight.type === 'stress')).toBe(true);
            expect(insights.some(insight => insight.type === 'load')).toBe(true);
        });
        it('limits insights to 5 maximum', () => {
            const params = {
                metricsData: { recovery: 85 },
                sleepScore: 90,
                stressData: { current: 25 },
                loadACWR: [{ acwr_7_28: 1.1 }]
            };
            const insights = generateInsights(params);
            expect(insights.length).toBeLessThanOrEqual(5);
        });
        it('returns empty array when no data provided', () => {
            const insights = generateInsights({});
            expect(insights).toHaveLength(0);
        });
    });
});
