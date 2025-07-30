/**
 * Supabase client placeholder for core package
 * The actual implementation should be provided by the consuming application
 */
// Placeholder client - should be replaced by actual implementation
export const supabase = {
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
export const setSupabaseClient = (client) => {
    Object.assign(supabase, client);
};
