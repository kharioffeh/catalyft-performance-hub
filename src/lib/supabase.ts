
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeugyryfvilanoiethum.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
