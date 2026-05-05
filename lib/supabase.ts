import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

// Server client - used in API routes (has INSERT permission)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

// Public client - used for SELECT only (shared link reads)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)
