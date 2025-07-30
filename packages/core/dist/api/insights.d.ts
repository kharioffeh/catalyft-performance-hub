/**
 * API functions for insights management
 */
export interface SaveInsightRequest {
    insightId: string;
    userId?: string;
}
/**
 * Save an insight for the current user
 */
export declare function saveInsight(insightId: string): Promise<void>;
