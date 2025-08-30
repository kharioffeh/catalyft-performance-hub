export interface Insight {
    id: string;
    title: string;
    message: string;
    type: 'readiness' | 'sleep' | 'load' | 'stress' | 'general';
    severity: 'green' | 'amber' | 'red';
    route?: string;
    value?: number;
    trend?: 'up' | 'down' | 'stable';
}
export interface MetricsData {
    recovery?: number;
}
export interface StressData {
    current?: number;
}
export interface InsightParams {
    metricsData?: MetricsData;
    stressData?: StressData;
    sleepScore?: number;
    loadACWR?: Array<{
        acwr_7_28?: number;
    }>;
}
/**
 * Core insights generation logic
 */
export declare const generateInsights: (params: InsightParams) => Insight[];
export declare const useInsights: (params: InsightParams) => Insight[];
