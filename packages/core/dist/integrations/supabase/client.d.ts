/**
 * Supabase client placeholder for core package
 * The actual implementation should be provided by the consuming application
 */
export interface SupabaseClient {
    auth: {
        getUser(): Promise<{
            data: {
                user: any | null;
            };
        }>;
    };
    from(table: string): SupabaseQueryBuilder;
    functions: {
        invoke(name: string, options?: {
            body?: any;
        }): Promise<{
            data?: any;
            error?: any;
        }>;
    };
}
export interface SupabaseQueryBuilder {
    insert(data: any): SupabaseQueryBuilder;
    update(data: any): SupabaseQueryBuilder;
    select(columns?: string): SupabaseQueryBuilder;
    eq(column: string, value: any): SupabaseQueryBuilder;
    gte(column: string, value: any): SupabaseQueryBuilder;
    order(column: string, options?: {
        ascending?: boolean;
    }): SupabaseQueryBuilder;
    single(): Promise<{
        data?: any;
        error?: any;
    }>;
    then(callback: (result: {
        data?: any;
        error?: any;
    }) => any): Promise<any>;
}
export declare const supabase: SupabaseClient;
export declare const setSupabaseClient: (client: SupabaseClient) => void;
