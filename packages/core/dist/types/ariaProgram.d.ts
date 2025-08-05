import { z } from "zod";
export declare const AriaProgramSchema: z.ZodObject<{
    meta: z.ZodObject<{
        goal: z.ZodEnum<["max_strength", "hypertrophy", "speed_power", "in-season_maint"]>;
        weeks: z.ZodNumber;
        metrics_available: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        goal?: "hypertrophy" | "max_strength" | "speed_power" | "in-season_maint";
        weeks?: number;
        metrics_available?: boolean;
    }, {
        goal?: "hypertrophy" | "max_strength" | "speed_power" | "in-season_maint";
        weeks?: number;
        metrics_available?: boolean;
    }>;
    blocks: z.ZodArray<z.ZodObject<{
        week: z.ZodNumber;
        sessions: z.ZodArray<z.ZodObject<{
            day: z.ZodEnum<["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]>;
            session_type: z.ZodEnum<["strength", "conditioning", "recovery"]>;
            exercises: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                sets: z.ZodNumber;
                reps: z.ZodNumber;
                intensity: z.ZodString;
                rest_sec: z.ZodNumber;
                notes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }, {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
            session_type?: "strength" | "conditioning" | "recovery";
            exercises?: {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }[];
        }, {
            day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
            session_type?: "strength" | "conditioning" | "recovery";
            exercises?: {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        sessions?: {
            day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
            session_type?: "strength" | "conditioning" | "recovery";
            exercises?: {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }[];
        }[];
        week?: number;
    }, {
        sessions?: {
            day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
            session_type?: "strength" | "conditioning" | "recovery";
            exercises?: {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }[];
        }[];
        week?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    meta?: {
        goal?: "hypertrophy" | "max_strength" | "speed_power" | "in-season_maint";
        weeks?: number;
        metrics_available?: boolean;
    };
    blocks?: {
        sessions?: {
            day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
            session_type?: "strength" | "conditioning" | "recovery";
            exercises?: {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }[];
        }[];
        week?: number;
    }[];
}, {
    meta?: {
        goal?: "hypertrophy" | "max_strength" | "speed_power" | "in-season_maint";
        weeks?: number;
        metrics_available?: boolean;
    };
    blocks?: {
        sessions?: {
            day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
            session_type?: "strength" | "conditioning" | "recovery";
            exercises?: {
                name?: string;
                sets?: number;
                reps?: number;
                intensity?: string;
                rest_sec?: number;
                notes?: string;
            }[];
        }[];
        week?: number;
    }[];
}>;
export type AriaProgram = z.infer<typeof AriaProgramSchema>;
