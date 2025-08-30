/**
 * API functions for ARIA program generation
 */
export interface AriaGenerateProgramRequest {
    goal: string;
    weeks: number;
    availableDays: string[];
    equipment: string[];
    prompt?: string;
}
export interface AriaGenerateProgramResponse {
    template_id: string;
    program_instance_id: string;
}
/**
 * Generates a training program using ARIA AI
 */
export declare function generateProgramWithAria(request: AriaGenerateProgramRequest): Promise<AriaGenerateProgramResponse>;
