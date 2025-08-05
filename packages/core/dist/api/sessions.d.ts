export declare const updateSessionStatus: (sessionId: string, status: string, endTs?: string) => Promise<any>;
export declare const createSession: (sessionData: any) => Promise<any>;
export declare const rescheduleSession: (sessionId: string, newStartTime: string) => Promise<any>;
