import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Copy .env.example to .env and fill in your project URL and anon key.')
}

/**
 * The public site only ever uses the anon key. Row Level Security means
 * this client can only ever see published posts, visible categories, live
 * ads, and active plans - drafts and staff-only data are invisible here at
 * the database level, not hidden by app logic.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
