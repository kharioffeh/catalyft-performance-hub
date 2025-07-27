/**
 * Supabase client placeholder for core package
 * The actual implementation should be provided by the consuming application
 */

// Type definitions for minimal Supabase client interface
export interface SupabaseClient {
  auth: {
    getUser(): Promise<{ data: { user: any | null } }>;
  };
  from(table: string): SupabaseQueryBuilder;
  functions: {
    invoke(name: string, options?: { body?: any }): Promise<{ data?: any; error?: any }>;
  };
}

export interface SupabaseQueryBuilder {
  insert(data: any): SupabaseQueryBuilder;
  update(data: any): SupabaseQueryBuilder;
  select(columns?: string): SupabaseQueryBuilder;
  eq(column: string, value: any): SupabaseQueryBuilder;
  gte(column: string, value: any): SupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseQueryBuilder;
  single(): Promise<{ data?: any; error?: any }>;
  then(callback: (result: { data?: any; error?: any }) => any): Promise<any>;
}

// Placeholder client - should be replaced by actual implementation
export const supabase: SupabaseClient = {
  auth: {
    async getUser() {
      throw new Error('Supabase client not initialized. Please provide a real Supabase client.');
    }
  },
  from() {
    throw new Error('Supabase client not initialized. Please provide a real Supabase client.');
  },
  functions: {
    async invoke() {
      throw new Error('Supabase client not initialized. Please provide a real Supabase client.');
    }
  }
};

// Function to set the actual Supabase client
export const setSupabaseClient = (client: SupabaseClient) => {
  Object.assign(supabase, client);
};